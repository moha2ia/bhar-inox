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
import * as store from "./store";

/* ============================================================
   Couche de données — BHAR INOX
   Délègue au store local (fichier JSON) qui fonctionne partout,
   y compris sur Vercel (données seed en mémoire).
   ============================================================ */

/* ------------------------------------------------------------
   Contenus publics
   ------------------------------------------------------------ */

export async function listProjects(opts?: {
  publishedOnly?: boolean;
  category?: string;
}): Promise<Project[]> {
  return store.listProjects(opts);
}

export async function getProjectBySlug(
  slug: string,
  opts?: { publishedOnly?: boolean },
): Promise<Project | null> {
  const all = store.listProjects({
    publishedOnly: opts?.publishedOnly !== false,
  });
  return all.find((p) => p.slug === slug) ?? null;
}

export async function listCategories(): Promise<string[]> {
  const all = store.listProjects({ publishedOnly: true });
  return Array.from(new Set(all.map((p) => p.category))).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

export async function listServices(opts?: {
  publishedOnly?: boolean;
}): Promise<Service[]> {
  return store.listServices(opts);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return store.getSettings();
}

/* ------------------------------------------------------------
   Demandes de devis
   ------------------------------------------------------------ */

export async function createQuoteRequest(input: {
  draft: Record<string, unknown>;
  files: { name: string; size: number; type: string }[];
}): Promise<{ reference: string }> {
  return store.addQuote(input.draft, input.files);
}

export async function listQuoteRequests(opts?: {
  status?: StatusType;
  search?: string;
}): Promise<QuoteRequest[]> {
  return store.listQuotes(opts);
}

export async function updateQuoteStatus(
  id: string,
  status: StatusType,
): Promise<void> {
  store.updateQuoteStatus(id, status);
}

export async function listQuoteFiles(
  reference: string,
): Promise<{ file_name: string; file_size: number; file_type: string }[]> {
  return store.listQuoteFiles(reference);
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
  return store.addContactMessage(input);
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  return store.listContactMessages();
}

export async function deleteContactMessage(id: string): Promise<void> {
  store.deleteContactMessage(id);
}

export async function markContactMessageRead(
  id: string,
  read = true,
): Promise<void> {
  store.markContactMessageRead(id, read);
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
  const id = store.upsertProject(input as Project & { created_at?: string });
  return { id };
}

export async function deleteProject(id: string): Promise<void> {
  store.deleteProject(id);
}

export async function upsertService(
  input: Omit<Service, "id"> & { id?: string },
): Promise<{ id: string }> {
  const id = store.upsertService(input as Service);
  return { id };
}

export async function deleteService(id: string): Promise<void> {
  store.deleteService(id);
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<void> {
  store.updateSettings(patch);
}

export { QUOTE_STATUS_ORDER };

export function statusIndex(status: StatusType): number {
  return QUOTE_STATUS_ORDER.indexOf(status);
}
