import "server-only";
import fs from "node:fs";
import path from "node:path";
import type {
  Project,
  Service,
  QuoteRequest,
  SiteSettings,
} from "./types";
import { QUOTE_STATUS_ORDER, type QuoteStatus } from "./types";

/* ============================================================
   Stockage persistant local (édition finale sans Firebase)
   - Les contenus et les demandes de devis sont enregistrés
     dans .data/data.json (hors dépôt git) et survivent aux
     redémarrages du serveur.
   - Avec les identifiants Firebase configurés, src/lib/data.ts
     bascule automatiquement sur Firestore (ce fichier devient
     inutilisé).
   ============================================================ */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "data.json");

/* Position GPS de l'atelier BHAR INOX (Google Maps, WGS84) :
   https://maps.google.com/maps?q=loc:33.86772537231445,-5.565772533416748 */
const MAP_LAT = 33.86772537231445;
const MAP_LNG = -5.565772533416748;
const MAP_ZOOM = 16;

/* ------------------------------------------------------------
   Contenus initiaux (édition finale)
   ------------------------------------------------------------ */

const PHOTOS = (n: string) => `/photos/WA${n}.jpg`;

const SEED_PROJECTS: Project[] = [
  {
    id: "p1",
    slug: "porte-dentree-residence",
    title: "Portes d'entrée inox & verre",
    description:
      "Portes d'entrée en acier inoxydable et verre, modèles pleins ou vitrés, fabriquées sur mesure en atelier et posées avec cadrage et quincaillerie adaptés. Finition brossée ou polie, serrures de sécurité en option.",
    category: "Portes",
    location: "Meknès",
    images: [PHOTOS("0047"), PHOTOS("0051")],
    sort_order: 1,
    published: true,
    created_at: "2026-09-01T09:00:00Z",
  },
  {
    id: "p2",
    slug: "garde-corps-terrasse",
    title: "Garde-corps extérieurs & balcons",
    description:
      "Garde-corps en tubes inox pour terrasses, balcons et façades : lisses main-courante, remplissage à barreaux ou panneaux, fixations scellées ou à plaque. Conçu pour résister aux intempéries.",
    category: "Garde-corps",
    location: "Meknès",
    images: [PHOTOS("0050"), PHOTOS("0063"), PHOTOS("0060")],
    sort_order: 2,
    published: true,
    created_at: "2026-09-02T09:00:00Z",
  },
  {
    id: "p3",
    slug: "verriere-atelier",
    title: "Verrères & parois vitrées",
    description:
      "Verrères d'atelier et parois vitrées à structure inox fine : profilés à section réduite, vitrage feuilleté ou trempé, joints continus. Lumière maximale, isolation préservée.",
    category: "Verrières",
    location: "Meknès",
    images: [PHOTOS("0048"), PHOTOS("0067")],
    sort_order: 3,
    published: true,
    created_at: "2026-09-03T09:00:00Z",
  },
  {
    id: "p4",
    slug: "cage-escalier-balustrade",
    title: "Balustrades de cage d'escalier",
    description:
      "Balustrades intérieures pour cages d'escalier : lisses polies miroir, barreaux verticaux ou câbles tendus, volutes décoratives sur demande. Chaque modèle est ajusté au relevé exact de l'escalier.",
    category: "Garde-corps",
    location: "Meknès",
    images: [PHOTOS("0057"), PHOTOS("0055"), PHOTOS("0059"), PHOTOS("0054")],
    sort_order: 4,
    published: true,
    created_at: "2026-09-04T09:00:00Z",
  },
  {
    id: "p5",
    slug: "porte-fenetre-alu-look",
    title: "Fenêtres & grilles de défense",
    description:
      "Fenêtres à ossature inox, châssis fixes et ouvrants, grilles de défense pour portes et fenêtres. Quincaillerie adaptée au poids, finitions assorties à la menuiserie existante.",
    category: "Fenêtres",
    location: "Meknès",
    images: [PHOTOS("0062"), PHOTOS("0049")],
    sort_order: 5,
    published: true,
    created_at: "2026-09-05T09:00:00Z",
  },
  {
    id: "p6",
    slug: "chantier-pose-sur-site",
    title: "Fabrication & pose sur site",
    description:
      "De l'atelier au chantier : fabrication sur plans, livraison et pose par nos équipes, réglages et finitions sur site. Un interlocuteur unique du relevé initial à la remise de l'ouvrage.",
    category: "Agencement",
    location: "Meknès",
    images: [PHOTOS("0056"), PHOTOS("0066"), PHOTOS("0065")],
    sort_order: 6,
    published: true,
    created_at: "2026-09-06T09:00:00Z",
  },
  {
    id: "p7",
    slug: "escaliers-decoration-inox",
    title: "Escaliers & motifs décoratifs",
    description:
      "Garde-corps à motifs décoratifs : volutes, éventails et courbes sur mesure pour escaliers d'intérieur. Le métal travaillé comme un élément de design, pas seulement de sécurité.",
    category: "Garde-corps",
    location: "Meknès",
    images: [PHOTOS("0064"), PHOTOS("0053"), PHOTOS("0069"), PHOTOS("0058")],
    sort_order: 7,
    published: true,
    created_at: "2026-09-07T09:00:00Z",
  },
];

const SEED_SERVICES: Service[] = [
  {
    id: "s1",
    name: "Portes & portes-fenêtres",
    description:
      "Portes d'entrée, portes-fenêtres et portes techniques en acier inoxydable, conçues sur mesure, fabriquées en atelier et posées par nos équipes.",
    image: PHOTOS("0047"),
    sort_order: 1,
    published: true,
  },
  {
    id: "s2",
    name: "Fenêtres & ouvrants",
    description:
      "Fenêtres fixes et ouvrants, verrières et châssis sur mesure, avec quincaillerie adaptée au poids et à l'usage.",
    image: PHOTOS("0048"),
    sort_order: 2,
    published: true,
  },
  {
    id: "s3",
    name: "Garde-corps & balustrades",
    description:
      "Garde-corps à barreaux verticaux, lisses inox, câbles tendus ou panneaux verre — pour intérieurs, terrasses et escaliers.",
    image: PHOTOS("0057"),
    sort_order: 3,
    published: true,
  },
  {
    id: "s4",
    name: "Agencement & mobilier",
    description:
      "Habillages, comptoirs, niches, mobilier technique et éléments décoratifs en tôle ou profilés inox.",
    image: PHOTOS("0065"),
    sort_order: 4,
    published: true,
  },
  {
    id: "s5",
    name: "Clôtures & portails",
    description:
      "Portails, clôtures et protection périmétrique en inox, adaptés aux contraintes extérieures et aux accès automatisés.",
    image: PHOTOS("0050"),
    sort_order: 5,
    published: true,
  },
  {
    id: "s6",
    name: "Maintenance & rénovation",
    description:
      "Réglage, réparation, remplacement d'ouvrages existants et remise en état des finitions (décapage, passivation, polissage).",
    image: PHOTOS("0056"),
    sort_order: 6,
    published: true,
  },
];

const SEED_SETTINGS: SiteSettings = {
  hero_title: "L'inox, façonné sur mesure.",
  hero_subtitle:
    "Menuiserie inox sur mesure : conception, fabrication et pose d'ouvrages en acier inoxydable pour particuliers, architectes et professionnels.",
  about_intro:
    "BHAR INOX est l'identité commerciale de la société BHAR INO MAR SARL, immatriculée au registre du commerce de Meknès (N° 54737). L'entreprise est spécialisée dans la conception, la fabrication et la pose de menuiseries en inox, aluminium et verre : portes, fenêtres, garde-corps, verrières et agencements sur mesure.",
  phone: "+212 663-436992 / +212 612-619924",
  email: "contact@bhar-inox.ma",
  address: "Im. 2, Mag. 1, Lot Arryan Bab Bettioui, Meknès",
  hours: "Lun – Sam : 08h30 – 19h00",
  seo_title: "BHAR INOX — Menuiserie inox sur mesure",
  seo_description:
    "Portes, fenêtres, garde-corps et agencements en acier inoxydable, fabriqués sur mesure avec précision.",
  map_lat: MAP_LAT,
  map_lng: MAP_LNG,
  map_zoom: MAP_ZOOM,
};

/* ------------------------------------------------------------
   Forme du fichier de données
   ------------------------------------------------------------ */

export interface StoredFileMeta {
  file_name: string;
  file_size: number;
  file_type: string;
}

interface StoreShape {
  projects: Project[];
  services: Service[];
  settings: SiteSettings;
  quotes: QuoteRequest[];
  messages: ContactMessage[];
  files: Record<string, StoredFileMeta[]>;
}

/* ------------------------------------------------------------
   Chargement / écriture
   ------------------------------------------------------------ */

let cache: StoreShape | null = null;

function load(): StoreShape {
  if (cache) return cache;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      cache = normalize(JSON.parse(raw) as StoreShape);
      if (!Array.isArray(cache.messages)) {
        cache.messages = [];
      }
      return cache;
    }
  } catch (err) {
    console.error("[store] lecture impossible, réinitialisation", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }
  cache = {
    projects: structuredClone(SEED_PROJECTS),
    services: structuredClone(SEED_SERVICES),
    settings: { ...SEED_SETTINGS },
    quotes: [],
    messages: [],
    files: {},
  };
  persist();
  return cache;
}

/**
 * Complète les champs ajoutés après coup dans un fichier de données existant
 * (ex. coordonnées de la carte absentes d'un .data/data.json antérieur) —
 * sans jamais écraser des valeurs déjà enregistrées par l'admin.
 */
function normalize(raw: StoreShape): StoreShape {
  const hasNumber = (v: unknown): v is number =>
    typeof v === "number" && Number.isFinite(v);
  const s = raw.settings;
  raw.settings = {
    ...s,
    map_lat: hasNumber(s?.map_lat) ? s.map_lat : MAP_LAT,
    map_lng: hasNumber(s?.map_lng) ? s.map_lng : MAP_LNG,
    map_zoom: hasNumber(s?.map_zoom)
      ? Math.min(19, Math.max(3, Math.round(s.map_zoom)))
      : MAP_ZOOM,
  };
  return raw;
}

function persist(): void {
  if (!cache) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(cache, null, 2), "utf8");
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error("[store] écriture impossible", {
      message: err instanceof Error ? err.message : "unknown",
    });
  }
}

/* ------------------------------------------------------------
   Accès contenus
   ------------------------------------------------------------ */

export function listProjects(opts?: {
  publishedOnly?: boolean;
  category?: string;
}): Project[] {
  let out = [...load().projects];
  if (opts?.publishedOnly !== false) out = out.filter((p) => p.published);
  if (opts?.category && opts.category !== "Toutes")
    out = out.filter((p) => p.category === opts.category);
  return out.sort((a, b) => a.sort_order - b.sort_order);
}

export function listServices(opts?: { publishedOnly?: boolean }): Service[] {
  let out = [...load().services];
  if (opts?.publishedOnly !== false) out = out.filter((s) => s.published);
  return out.sort((a, b) => a.sort_order - b.sort_order);
}

export function getSettings(): SiteSettings {
  return { ...load().settings };
}

export function updateSettings(patch: Partial<SiteSettings>): void {
  Object.assign(load().settings, patch);
  persist();
}

export function upsertProject(input: Project & { created_at?: string }): string {
  const store = load();
  const i = store.projects.findIndex(
    (p) => p.id === input.id || p.slug === input.slug,
  );
  if (i >= 0) {
    store.projects[i] = {
      ...store.projects[i],
      ...input,
      id: store.projects[i].id,
      created_at: store.projects[i].created_at,
    };
    persist();
    return store.projects[i].id;
  }
  const id = input.id || `p-${Date.now()}`;
  store.projects.push({
    ...input,
    id,
    created_at: input.created_at ?? new Date().toISOString(),
  });
  persist();
  return id;
}

export function deleteProject(id: string): void {
  const store = load();
  store.projects = store.projects.filter((p) => p.id !== id);
  persist();
}

export function upsertService(input: Service): string {
  const store = load();
  const i = store.services.findIndex(
    (s) => s.id === input.id || s.name === input.name,
  );
  if (i >= 0) {
    store.services[i] = { ...store.services[i], ...input, id: store.services[i].id };
    persist();
    return store.services[i].id;
  }
  const id = input.id || `s-${Date.now()}`;
  store.services.push({ ...input, id });
  persist();
  return id;
}

export function deleteService(id: string): void {
  const store = load();
  store.services = store.services.filter((s) => s.id !== id);
  persist();
}

/* ------------------------------------------------------------
   Demandes de devis
   ------------------------------------------------------------ */

function nextReference(): string {
  const year = new Date().getFullYear();
  const prefix = `BI-${year}-`;
  const max = load().quotes.reduce((acc, q) => {
    if (!q.reference.startsWith(prefix)) return acc;
    const n = Number(q.reference.slice(prefix.length));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export function addQuote(
  draft: Record<string, unknown>,
  files: { name: string; size: number; type: string }[],
): { reference: string } {
  const store = load();
  const reference = nextReference();
  const d = draft;
  const quote: QuoteRequest = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
  };
  store.quotes.push(quote);
  if (files.length > 0) {
    store.files[reference] = files.map((f) => ({
      file_name: f.name,
      file_size: f.size,
      file_type: f.type,
    }));
  }
  persist();
  return { reference };
}

export function listQuotes(opts?: {
  status?: QuoteStatus;
  search?: string;
}): QuoteRequest[] {
  let out = [...load().quotes].reverse();
  if (opts?.status) out = out.filter((q) => q.status === opts.status);
  if (opts?.search) {
    const s = opts.search.toLowerCase();
    out = out.filter(
      (q) =>
        q.reference.toLowerCase().includes(s) ||
        q.full_name.toLowerCase().includes(s) ||
        q.email.toLowerCase().includes(s) ||
        q.project_type.toLowerCase().includes(s),
    );
  }
  return out;
}

export function updateQuoteStatus(id: string, status: QuoteStatus): void {
  const store = load();
  const q = store.quotes.find((x) => x.id === id);
  if (!q) throw new Error("Demande introuvable.");
  q.status = status;
  persist();
}

export function listQuoteFiles(reference: string): StoredFileMeta[] {
  return load().files[reference] ?? [];
}

export function addContactMessage(input: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}): { id: string } {
  const store = load();
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item: ContactMessage = {
    id,
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    message: input.message,
    read: false,
    created_at: new Date().toISOString(),
  };
  store.messages.push(item);
  persist();
  return { id };
}

export function listContactMessages(): ContactMessage[] {
  return [...load().messages].reverse();
}

export function deleteContactMessage(id: string): void {
  const store = load();
  store.messages = store.messages.filter((m) => m.id !== id);
  persist();
}

export function markContactMessageRead(id: string, read = true): void {
  const store = load();
  const m = store.messages.find((x) => x.id === id);
  if (m) {
    m.read = read;
    persist();
  }
}

/* Réexport pour la bascule de statut typée */
export { QUOTE_STATUS_ORDER };

