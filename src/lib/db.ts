import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { connection } from "next/server";

/* ============================================================
   Accès PostgreSQL — BHAR INOX
   - DATABASE_URL : PostgreSQL local ou Neon/Vercel Postgres.
   - connection() force le rendu dynamique : aucune requête
     n'est exécutée au build sur Vercel.
   ============================================================ */

declare global {
  // Réutilise le pool entre les rechargements du serveur de dev.
  // eslint-disable-next-line no-var
  var __bharPgPool: Pool | undefined;
}

export function getConnectionString(): string | undefined {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING
  );
}

function getPool(): Pool {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error(
      "Connexion base de données manquante. Définissez DATABASE_URL (Neon) ou connectez Vercel Postgres au projet.",
    );
  }
  if (!globalThis.__bharPgPool) {
    globalThis.__bharPgPool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalThis.__bharPgPool;
}

export async function query<T extends QueryResultRow>(
  sql: string,
  params: unknown[] = [],
) {
  await connection();
  return getPool().query<T>(sql, params);
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  await connection();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
