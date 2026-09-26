import "server-only";
import {
  cert,
  getApps,
  initializeApp,
  type AppOptions,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
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
   Couche de données — BHAR INOX (édition finale)
   - Firebase configuré (variables d'environnement) : Firestore,
     accès serveur via le SDK Admin (firebase-admin).
   - Sinon : stockage local persistant (.data/data.json) — les
     contenus et les demandes de devis survivent aux redémarrages.
   ============================================================ */

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "";
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL ?? "";
const FIREBASE_PRIVATE_KEY = (
  process.env.FIREBASE_PRIVATE_KEY ?? ""
).replace(/\\n/g, "\n");

export const USE_FIREBASE = Boolean(
  FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY,
);

let firestore: Firestore | null = null;

export function getDb(): Firestore {
  if (!firestore) {
    if (!USE_FIREBASE)
      throw new Error("Firebase non configuré — stockage local utilisé.");
    const options: AppOptions = {
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY,
      }),
      projectId: FIREBASE_PROJECT_ID,
    };
    const existing = getApps().find((a) => a.name === "bhar-inox");
    firestore = existing
      ? getFirestore(existing)
      : getFirestore(initializeApp(options, "bhar-inox"));
  }
  return firestore;
}

const COL_PROJECTS = "projects";
const COL_SERVICES = "services";
const COL_SETTINGS = "site_settings";
const COL_QUOTES = "quote_requests";
const COL_QUOTE_FILES = "quote_files";
const COL_MESSAGES = "contact_messages";
const SETTINGS_DOC_ID = "default";

/* ------------------------------------------------------------
   API publique du module (server-side)
   ------------------------------------------------------------ */

export async function listProjects(opts?: {
  publishedOnly?: boolean;
  category?: string;
}): Promise<Project[]> {
  if (!USE_FIREBASE) {
    return store.listProjects(opts);
  }
  const colRef = getDb().collection(COL_PROJECTS);
  const countSnap = await colRef.limit(1).get();
  if (countSnap.empty) {
    const seedProjects = store.listProjects({ publishedOnly: false });
    const batch = getDb().batch();
    for (const p of seedProjects) {
      batch.set(colRef.doc(p.id), p);
    }
    await batch.commit();
  }
  let q: FirebaseFirestore.Query = colRef;
  if (opts?.publishedOnly !== false) q = q.where("published", "==", true);
  if (opts?.category && opts.category !== "Toutes")
    q = q.where("category", "==", opts.category);
  const snap = await q.get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
  return items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export async function getProjectBySlug(
  slug: string,
  opts?: { publishedOnly?: boolean },
): Promise<Project | null> {
  const all = await listProjects({ publishedOnly: opts?.publishedOnly !== false });
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
  if (!USE_FIREBASE) {
    return store.listServices(opts);
  }
  const colRef = getDb().collection(COL_SERVICES);
  const countSnap = await colRef.limit(1).get();
  if (countSnap.empty) {
    const seedServices = store.listServices({ publishedOnly: false });
    const batch = getDb().batch();
    for (const s of seedServices) {
      batch.set(colRef.doc(s.id), s);
    }
    await batch.commit();
  }
  let q: FirebaseFirestore.Query = colRef;
  if (opts?.publishedOnly !== false) q = q.where("published", "==", true);
  const snap = await q.get();
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service);
  return items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!USE_FIREBASE) {
    return store.getSettings();
  }
  const doc = await getDb()
    .collection(COL_SETTINGS)
    .doc(SETTINGS_DOC_ID)
    .get();
  if (!doc.exists) {
    // Première exécution : amorcer avec les valeurs locales par défaut.
    const seed = store.getSettings();
    await doc.ref.set(seed);
    return seed;
  }
  return doc.data() as SiteSettings;
}

export async function createQuoteRequest(input: {
  draft: Record<string, unknown>;
  files: { name: string; size: number; type: string }[];
}): Promise<{ reference: string }> {
  if (!USE_FIREBASE) {
    return store.addQuote(input.draft, input.files);
  }
  const db = getDb();
  const d = input.draft;
  const reference = await nextQuoteReference(db);
  await db.runTransaction(async (tx) => {
    tx.set(db.collection(COL_QUOTES).doc(), {
      reference,
      project_type: String(d.project_type ?? ""),
      description: String(d.description ?? ""),
      location: String(d.location ?? ""),
      dimensions: d.dimensions ? String(d.dimensions) : null,
      quantity: d.quantity ? Number(d.quantity) : null,
      finish: d.finish ? String(d.finish) : null,
      budget: d.budget ? String(d.budget) : null,
      deadline: d.deadline ? String(d.deadline) : null,
      full_name: String(d.full_name ?? ""),
      company: d.company ? String(d.company) : null,
      phone: String(d.phone ?? ""),
      email: String(d.email ?? ""),
      status: "nouveau",
      created_at: new Date().toISOString(),
    });
    // Métadonnées des fichiers (les binaires ne sont pas stockés)
    for (const f of input.files) {
      tx.set(db.collection(COL_QUOTE_FILES).doc(), {
        quote_reference: reference,
        file_name: f.name,
        file_size: f.size,
        file_type: f.type,
      });
    }
  });
  return { reference };
}

/** Référence unique BI-AAAA-#### (compteur transactionnel Firestore). */
async function nextQuoteReference(db: Firestore): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BI-${year}-`;
  const counterId = `quote_counter_${year}`;
  const counterRef = db.collection("counters").doc(counterId);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists ? Number(snap.data()?.value ?? 0) : 0;
    const next = current + 1;
    tx.set(counterRef, { value: next }, { merge: true });
    return `${prefix}${String(next).padStart(4, "0")}`;
  });
}

export async function listQuoteRequests(opts?: {
  status?: StatusType;
  search?: string;
}): Promise<QuoteRequest[]> {
  if (!USE_FIREBASE) {
    return store.listQuotes(opts);
  }
  let q = getDb()
    .collection(COL_QUOTES)
    .orderBy("created_at", "desc");
  if (opts?.status) q = q.where("status", "==", opts.status);
  const snap = await q.get();
  let out = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as QuoteRequest);
  if (opts?.search) {
    const s = opts.search.toLowerCase();
    out = out.filter(
      (q) =>
        q.reference.toLowerCase().includes(s) ||
        q.full_name.toLowerCase().includes(s) ||
        q.email.toLowerCase().includes(s),
    );
  }
  return out;
}

export async function updateQuoteStatus(
  id: string,
  status: StatusType,
): Promise<void> {
  if (!USE_FIREBASE) {
    store.updateQuoteStatus(id, status);
    return;
  }
  await getDb().collection(COL_QUOTES).doc(id).update({ status });
}

export async function listQuoteFiles(
  reference: string,
): Promise<{ file_name: string; file_size: number; file_type: string }[]> {
  if (!USE_FIREBASE) {
    return store.listQuoteFiles(reference);
  }
  const snap = await getDb()
    .collection(COL_QUOTE_FILES)
    .where("quote_reference", "==", reference)
    .get();
  return snap.docs.map(
    (d) =>
      d.data() as { file_name: string; file_size: number; file_type: string },
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
  if (!USE_FIREBASE) {
    return store.addContactMessage(input);
  }
  const db = getDb();
  const docRef = await db.collection(COL_MESSAGES).add({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    message: input.message,
    read: false,
    created_at: new Date().toISOString(),
  });
  return { id: docRef.id };
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  if (!USE_FIREBASE) {
    return store.listContactMessages();
  }
  const snap = await getDb().collection(COL_MESSAGES).get();
  const list = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ContactMessage[];
  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (!USE_FIREBASE) {
    store.deleteContactMessage(id);
    return;
  }
  await getDb().collection(COL_MESSAGES).doc(id).delete();
}

export async function markContactMessageRead(
  id: string,
  read = true,
): Promise<void> {
  if (!USE_FIREBASE) {
    store.markContactMessageRead(id, read);
    return;
  }
  await getDb().collection(COL_MESSAGES).doc(id).update({ read });
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
  if (!USE_FIREBASE) {
    const id = store.upsertProject({
      ...input,
      id: input.id,
      images: input.images ?? [],
    } as Project & { created_at?: string });
    return { id };
  }
  const db = getDb();
  const row = { ...input } as Record<string, unknown>;
  // Recherche par id puis par slug (unicité, comme le schéma SQL initial)
  let existing: FirebaseFirestore.DocumentSnapshot | null = null;
  if (input.id) {
    const byId = await db.collection(COL_PROJECTS).doc(input.id).get();
    if (byId.exists) existing = byId;
  }
  if (!existing) {
    const bySlug = await db
      .collection(COL_PROJECTS)
      .where("slug", "==", input.slug)
      .limit(1)
      .get();
    if (!bySlug.empty) existing = bySlug.docs[0];
  }
  if (existing) {
    await existing.ref.set(row, { merge: true });
    return { id: existing.id };
  }
  const ref = await db.collection(COL_PROJECTS).add({
    ...row,
    created_at: new Date().toISOString(),
  });
  return { id: ref.id };
}

export async function deleteProject(id: string): Promise<void> {
  if (!USE_FIREBASE) {
    store.deleteProject(id);
    return;
  }
  await getDb().collection(COL_PROJECTS).doc(id).delete();
}

export async function upsertService(
  input: Omit<Service, "id"> & { id?: string },
): Promise<{ id: string }> {
  if (!USE_FIREBASE) {
    const id = store.upsertService(input as Service);
    return { id };
  }
  const db = getDb();
  // Recherche par id puis par nom (unicité, comme le schéma SQL initial)
  let existing: FirebaseFirestore.DocumentSnapshot | null = null;
  if (input.id) {
    const byId = await db.collection(COL_SERVICES).doc(input.id).get();
    if (byId.exists) existing = byId;
  }
  if (!existing) {
    const byName = await db
      .collection(COL_SERVICES)
      .where("name", "==", input.name)
      .limit(1)
      .get();
    if (!byName.empty) existing = byName.docs[0];
  }
  if (existing) {
    await existing.ref.set({ ...input }, { merge: true });
    return { id: existing.id };
  }
  const ref = await db.collection(COL_SERVICES).add({ ...input });
  return { id: ref.id };
}

export async function deleteService(id: string): Promise<void> {
  if (!USE_FIREBASE) {
    store.deleteService(id);
    return;
  }
  await getDb().collection(COL_SERVICES).doc(id).delete();
}

export async function updateSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<void> {
  if (!USE_FIREBASE) {
    store.updateSettings(patch);
    return;
  }
  await getDb()
    .collection(COL_SETTINGS)
    .doc(SETTINGS_DOC_ID)
    .set(patch, { merge: true });
}

export { QUOTE_STATUS_ORDER };

export function statusIndex(status: StatusType): number {
  return QUOTE_STATUS_ORDER.indexOf(status);
}
