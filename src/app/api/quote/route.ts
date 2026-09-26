import { NextResponse } from "next/server";
import { quoteDraftSchema, MAX_FILE_SIZE, MAX_FILES, ALLOWED_FILE_TYPES } from "@/lib/quote-schema";
import { createQuoteRequest } from "@/lib/data";
import { notifyQuoteReceived } from "@/lib/notify";

/* ------------------------------------------------------------
   Anti-spam rudimentaire : limitation de débit en mémoire
   (par IP). En production, préférer un limiteur partagé
   (Upstash, edge middleware) si plusieurs instances.
   ------------------------------------------------------------ */
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 60_000;
const MAX_HITS = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_HITS;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de demandes envoyées. Merci de réessayer dans une minute." },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  // Piège anti-spam : champ caché devant rester vide
  const honeypot = form.get("website");
  if (honeypot && String(honeypot).length > 0) {
    // Réponse neutre pour ne pas révéler le filtre
    return NextResponse.json(
      { error: "Requête refusée." },
      { status: 400 },
    );
  }

  // Validation des fichiers avant tout traitement
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FILES} pièces jointes.` },
      { status: 400 },
    );
  }
  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Fichier « ${f.name} » trop volumineux (10 Mo max).` },
        { status: 400 },
      );
    }
    if (!ALLOWED_FILE_TYPES.includes(f.type)) {
      return NextResponse.json(
        { error: `Format non autorisé pour « ${f.name} ».` },
        { status: 400 },
      );
    }
  }

  // Validation du formulaire (schéma partagé client/serveur)
  const raw = {
    project_type: form.get("project_type") ?? "",
    description: form.get("description") ?? "",
    location: form.get("location") ?? "",
    dimensions: form.get("dimensions") ?? "",
    quantity: form.get("quantity") || "",
    finish: form.get("finish") ?? "",
    budget: form.get("budget") ?? "",
    deadline: form.get("deadline") ?? "",
    full_name: form.get("full_name") ?? "",
    company: form.get("company") ?? "",
    phone: form.get("phone") ?? "",
    email: form.get("email") ?? "",
    consent: form.get("consent") === "true",
  };

  const parsed = quoteDraftSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: `Validation : ${first.message}`, field: first.path.join(".") },
      { status: 422 },
    );
  }

  try {
    const { reference } = await createQuoteRequest({
      draft: parsed.data,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    });

    // Notification email APRÈS enregistrement, non bloquante :
    // no-op si RESEND_API_KEY n'est pas configurée.
    void notifyQuoteReceived({
      reference,
      fullName: parsed.data.full_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      projectType: parsed.data.project_type,
      location: parsed.data.location,
      filesCount: files.length,
    }).catch((err) =>
      console.error("[quote] notification échouée", {
        message: err instanceof Error ? err.message : "unknown",
      }),
    );

    return NextResponse.json({ reference });
  } catch (err) {
    console.error("[quote] enregistrement impossible", {
      message: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(
      {
        error:
          "L'enregistrement a échoué côté serveur. Merci de réessayer plus tard.",
      },
      { status: 500 },
    );
  }
}
