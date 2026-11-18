import { NextResponse } from "next/server";
import { getConnectionString } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!getConnectionString()) {
    return NextResponse.json(
      {
        ok: false,
        step: "configuration",
        error:
          "Aucune variable de connexion trouvée (DATABASE_URL, POSTGRES_URL). Connectez une base Postgres au projet Vercel.",
      },
      { status: 503 },
    );
  }

  try {
    const { query } = await import("@/lib/db");
    const result = await query<{ projects: string | null }>(
      "SELECT to_regclass('public.projects')::text AS projects",
    );
    const schemaReady = result.rows[0]?.projects !== null;
    return NextResponse.json(
      {
        ok: schemaReady,
        step: schemaReady ? "ok" : "schema",
        error: schemaReady
          ? undefined
          : "Base joignable mais schéma absent : exécutez `npm run db:setup` avec l'URL de production.",
      },
      { status: schemaReady ? 200 : 503 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        step: "connexion",
        code: (err as { code?: string }).code ?? "unknown",
        error: "Connexion à la base impossible.",
      },
      { status: 503 },
    );
  }
}
