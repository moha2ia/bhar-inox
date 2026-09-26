import { NextResponse } from "next/server";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de messages envoyés. Réessayez dans une minute." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (body.website && String(body.website).length > 0) {
    return NextResponse.json({ error: "Requête refusée." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = body.phone ? String(body.phone).trim() : null;
  const message = String(body.message ?? "").trim();

  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 5) {
    return NextResponse.json(
      { error: "Champs invalides ou incomplets." },
      { status: 422 },
    );
  }

  try {
    const { createContactMessage } = await import("@/lib/data");
    await createContactMessage({
      name,
      email,
      phone,
      message,
    });
    console.info("[contact] message enregistré dans Firebase", { from: `${name} <${email}>` });
  } catch (err) {
    console.error("[contact] échec de l'enregistrement", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }

  return NextResponse.json({ ok: true });
}

