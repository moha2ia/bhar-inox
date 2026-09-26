export type QuoteStatus =
  | "nouveau"
  | "en_cours"
  | "devis_envoye"
  | "accepte"
  | "refuse"
  | "archive";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  nouveau: "Nouveau",
  en_cours: "En cours",
  devis_envoye: "Devis envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
  archive: "Archivé",
};

export const QUOTE_STATUS_ORDER: QuoteStatus[] = [
  "nouveau",
  "en_cours",
  "devis_envoye",
  "accepte",
  "refuse",
  "archive",
];

/** Couleurs sobres (tokens de la charte ou neutres) pour les pastilles de statut */
export const QUOTE_STATUS_STYLES: Record<QuoteStatus, string> = {
  nouveau: "bg-royal text-white",
  en_cours: "bg-steel text-white",
  devis_envoye: "bg-charcoal text-white",
  accepte: "bg-royal text-white ring-2 ring-royal/30",
  refuse: "bg-white text-charcoal border border-line",
  archive: "bg-mist text-steel border border-line",
};

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  images: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  image: string | null;
  sort_order: number;
  published: boolean;
}

export interface QuoteRequest {
  id: string;
  reference: string;
  project_type: string;
  description: string;
  location: string;
  dimensions: string | null;
  quantity: number | null;
  finish: string | null;
  budget: string | null;
  deadline: string | null;
  full_name: string;
  company: string | null;
  phone: string;
  email: string;
  status: QuoteStatus;
  created_at: string;
}

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  about_intro: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  seo_title: string;
  seo_description: string;
  /** Coordonnées Google Maps de l'atelier (degrés décimaux WGS84) */
  map_lat: number;
  map_lng: number;
  /** Niveau de zoom de la carte embarquée (3–19) */
  map_zoom: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
}


