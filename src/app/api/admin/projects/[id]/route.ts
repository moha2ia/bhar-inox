import { NextResponse } from "next/server";
import { checkSession } from "@/lib/admin-session";
import { upsertProject, deleteProject } from "@/lib/data";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await checkSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
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

  try {
    await upsertProject({
      id,
      slug: String(body.slug ?? "").trim(),
      title,
      description: String(body.description ?? ""),
      category: String(body.category ?? "Autre"),
      location: body.location ? String(body.location) : null,
      images: Array.isArray(body.images) ? (body.images as string[]) : [],
      sort_order: Number(body.sort_order ?? 0),
      published: Boolean(body.published),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await checkSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteProject(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}
