import { NextResponse } from "next/server";
import { checkSession } from "@/lib/admin-session";
import { upsertService } from "@/lib/data";

export async function POST(req: Request) {
  const session = await checkSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Nom requis." }, { status: 422 });
  }

  try {
    const { id } = await upsertService({
      name,
      description: String(body.description ?? ""),
      image: body.image ? String(body.image) : null,
      sort_order: Number(body.sort_order ?? 0),
      published: Boolean(body.published),
    });
    return NextResponse.json({ id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}
