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

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL manquant. Configurez PostgreSQL en local ou une base Neon sur Vercel.",
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
