import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

/* ============================================================
   Sessions administrateur — cookie signé (HMAC-SHA256)
   - AUTH_SECRET : clé de signature (obligatoire en production,
     sinon une clé dérivée du démarrage est utilisée avec un
     avertissement explicite).
   - ADMIN_EMAIL / ADMIN_PASSWORD : identifiants administrateur.
   ============================================================ */

const SECRET =
  process.env.AUTH_SECRET ?? "bhar-inox-dev-secret-local-only";

if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
  console.warn(
    "[admin-session] AUTH_SECRET non défini — définissez-le via .env.local avant tout déploiement.",
  );
}

const COOKIE = "bhar_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 h

interface SessionData {
  email: string;
  exp: number;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSessionToken(email: string): string {
  const data: SessionData = { email, exp: Date.now() + MAX_AGE * 1000 };
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): SessionData | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionData;
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function checkSession(): Promise<SessionData | null> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
}

export const SESSION_COOKIE = COOKIE;
export const SESSION_MAX_AGE = MAX_AGE;

/** Identifiants administrateur (variables d'environnement). */
export function getAdminCredentials(): { email: string; password: string } {
  return {
    email: process.env.ADMIN_EMAIL ?? "elhasnaouimohamedd@gmail.com",
    password: process.env.ADMIN_PASSWORD ?? "",
  };
}
