import "server-only";
import type {
  Project,
  Service,
  QuoteRequest,
  SiteSettings,
  ContactMessage,
} from "./types";
import {
  QUOTE_STATUS_ORDER,
  type QuoteStatus as StatusType,
} from "./types";

/* ============================================================
   Couche de données — BHAR INOX
   Toutes les lectures/écritures passent par l'API PHP
   (server/public/index.php) adossée à MySQL/MariaDB.
   Configuration : PHP_API_URL et PHP_API_KEY (.env.local).
   ============================================================ */

const API_URL = (process.env.PHP_API_URL ?? "http://127.0.0.1/bhar-api").replace(/\/+$/, "");
const API_KEY = process.env.PHP_API_KEY ?? "";

async function api<T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const hasBody = init?.body !== undefined;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Accept: "application/json",
        "X-Api-Key": API_KEY,
        ...(hasBody ? { "Content-Type": "application/json; charset=utf-8" } : {}),
      },
      body: hasBody ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    // Next.js signale les pages dynamiques via une erreur interne :
    // elle doit remonter telle quelle, sinon le build la confond avec
    // une panne de l'API.
    const digest = (error as { digest?: unknown } | null)?.digest;
    if (
      error instanceof Error &&
      (error.name === "DynamicServerError" ||
        (typeof digest === "string" && digest.startsWith("DYNAMIC_SERVER_USAGE")))
    ) {
      throw error;
    }

    throw new Error(
      `API PHP/MySQL injoignable (${API_URL}). Vérifiez qu'Apache et MySQL sont démarrés.`,
    );
  }

  const text = await response.text();
  let data: unknown = null;
  if (text.trim() !== "") {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : `API PHP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

/* ------------------------------------------------------------
   Contenus publics
   ------------------------------------------------------------ */

export async function listProjects(opts?: {
  publishedOnly?: boolean;
  category?: string;
}): Promise<Project[]> {
  const params = new URLSearchParams();
  if (opts?.publishedOnly === false) params.set("published", "0");
  if (opts?.category && opts.category !== "Toutes") {
    params.set("category", opts.category);
  }
  const query = params.toString();
  return api<Project[]>(`/projects${query ? `?${query}` : ""}`);
}

export async function getProjectBySlug(
  slug: string,
  opts?: { publishedOnly?: boolean },
): Promise<Project | null> {
  const all = await listProjects({
    publishedOnly: opts?.publishedOnly !== false,
  });
  return all.find((p) => p.slug === slug) ?? null;
}

export async function listCategories(): Promise<string[]> {
  const all = await listProjects({ publishedOnly: true });
  return Array.from(new Set(all.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

export async function listServices(opts?: {
  publishedOnly?: boolean;
}): Promise<Service[]> {
  const query = opts?.publishedOnly === false ? "?published=0" : "";
  return api<Service[]>(`/services${query}`);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return api<SiteSettings>("/settings");
}

/* ------------------------------------------------------------
   Demandes de devis
   ------------------------------------------------------------ */

export async function createQuoteRequest(input: {
  draft: Record<string, unknown>;
  files: { name: string; size: number; type: string }[];
}): Promise<{ reference: string }> {
  return api<{ reference: string }>("/quotes", {
    method: "POST",
    body: { draft: input.draft, files: input.files },
  });
}

export async function listQuoteRequests(opts?: {
  status?: StatusType;
  search?: string;
}): Promise<QuoteRequest[]> {
  const params = new URLSearchParams();
  if (opts?.status) params.set("status", opts.status);
  if (opts?.search) params.set("search", opts.search);
  const query = params.toString();
  return api<QuoteRequest[]>(`/quotes${query ? `?${query}` : ""}`);
}

export async function updateQuoteStatus(
  id: string,
  status: StatusType,
): Promise<void> {
  await api<{ ok: boolean }>(
    `/quotes/${encodeURIComponent(id)}/status`,
    { method: "POST", body: { status } },
  );
}

export async function listQuoteFiles(
  reference: string,
): Promise<{ file_name: string; file_size: number; file_type: string }[]> {
  return api<{ file_name: string; file_size: number; file_type: string }[]>(
    `/quote-files?reference=${encodeURIComponent(reference)}`,
  );
}

/* ------------------------------------------------------------
   Messages de contact
   ------------------------------------------------------------ */

export async function createContactMessage(input: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}): Promise<{ id: string }> {
  return api<{ id: string }>("/messages", {
    method: "POST",
    body: input,
  });
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  return api<ContactMessage[]>("/messages");
}

export async function deleteContactMessage(id: string): Promise<void> {
  await api<{ ok: boolean }>(`/messages/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function markContactMessageRead(
  id: string,
  read = true,
): Promise<void> {
  await api<{ ok: boolean }>(`/messages/${encodeURIComponent(id)}/read`, {
    method: "POST",
    body: { read },
  });
}

/* ------------------------------------------------------------
   Mutations contenus (admin)
   ------------------------------------------------------------ */

export type ProjectInput = Omit<Project, "id" | "created_at"> & {
  id?: string;
};

export async function upsertProject(
  input: ProjectInput,
): Promise<{ id: string }> {
  return api<{ id: string }>("/projects", {
    method: "POST",
    body: { ...input, images: input.images ?? [] },
  });
}

export async function deleteProject(id: string): Promise<void> {
  await api<{ ok: boolean }>(`/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function upsertService(
  input: Omit<Service, "id"> & { id?: string },
): Promise<{ id: string }> {
  return api<{ id: string }>("/services", {
    method: "POST",
    body: input,
  });
}

export async function deleteService(id: string): Promise<void> {
  await api<{ ok: boolean }>(`/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<void> {
  await api<SiteSettings>("/settings", {
    method: "PUT",
    body: patch,
  });
}

export { QUOTE_STATUS_ORDER };

export function statusIndex(status: StatusType): number {
  return QUOTE_STATUS_ORDER.indexOf(status);
}
