import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (id.length > 64) {
    return new Response("Introuvable", { status: 404 });
  }

  const { rows } = await query<{ mime: string; data: Buffer }>(
    "SELECT mime, data FROM uploaded_images WHERE id = $1",
    [id],
  );
  const image = rows[0];
  if (!image) {
    return new Response("Introuvable", { status: 404 });
  }

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(image.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
