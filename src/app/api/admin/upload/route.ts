import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { checkSession } from "@/lib/admin-session";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function signatureMatches(buffer: Buffer, ext: string): boolean {
  switch (ext) {
    case "jpg":
      return (
        buffer.length > 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff
      );
    case "png":
      return (
        buffer.length > 8 &&
        buffer
          .subarray(0, 8)
          .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
      );
    case "webp":
      return (
        buffer.length > 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
      );
    case "avif": {
      if (buffer.length < 12 || buffer.subarray(4, 8).toString("ascii") !== "ftyp") {
        return false;
      }
      const brand = buffer.subarray(8, 12).toString("ascii");
      return ["avif", "avis", "mif1", "msf1"].includes(brand);
    }
    default:
      return false;
  }
}

export async function POST(req: Request) {
  const session = await checkSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const ext = EXTENSIONS[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Format non autorisé (JPG, PNG, WebP ou AVIF)." },
      { status: 422 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Le fichier est vide." }, { status: 422 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image trop volumineuse (10 Mo maximum)." },
      { status: 422 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!signatureMatches(buffer, ext)) {
    return NextResponse.json(
      { error: "Le contenu du fichier ne correspond pas au format annoncé." },
      { status: 422 },
    );
  }

  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const directory = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, name), buffer);
  } catch (error) {
    console.error("[upload] écriture impossible", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Impossible d'enregistrer l'image sur le serveur." },
      { status: 500 },
    );
  }

  return NextResponse.json({ path: `/uploads/${name}`, name }, { status: 201 });
}
