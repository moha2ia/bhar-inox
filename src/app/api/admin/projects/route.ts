import { NextResponse } from "next/server";
import { checkSession } from "@/lib/admin-session";
import { upsertProject } from "@/lib/data";

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

  const title = String(body.title ?? "").trim();
  if (title.length < 2) {
    return NextResponse.json({ error: "Titre requis." }, { status: 422 });
  }
  const slug =
    String(body.slug ?? "").trim() ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  try {
    const { id } = await upsertProject({
      slug,
      title,
      description: String(body.description ?? ""),
      category: String(body.category ?? "Autre"),
      location: body.location ? String(body.location) : null,
      images: Array.isArray(body.images) ? (body.images as string[]) : [],
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
