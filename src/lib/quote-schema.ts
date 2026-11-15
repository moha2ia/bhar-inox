import { z } from "zod";

export const quoteDraftSchema = z.object({
  // Étape 1 — Projet
  project_type: z.string().min(2, "Précisez le type de réalisation."),
  description: z
    .string()
    .min(20, "Décrivez votre besoin en quelques phrases (20 caractères min.)."),
  location: z.string().min(2, "Indiquez la localisation du projet."),
  // Étape 2 — Caractéristiques
  dimensions: z.string().optional().default(""),
  quantity: z
    .union([z.coerce.number().int().min(1).max(9999), z.literal("")])
    .optional(),
  finish: z.string().optional().default(""),
  budget: z.string().optional().default(""),
  deadline: z.string().optional().default(""),
  // Étape 4 — Coordonnées
  full_name: z.string().min(2, "Nom et prénom requis."),
  company: z.string().optional().default(""),
  phone: z
    .string()
    .min(6, "Numéro de téléphone requis.")
    .regex(/^[+\d\s().-]{6,20}$/, "Format de téléphone invalide."),
  email: z.string().email("Adresse email invalide."),
  // Étape 5 — Consentement
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Vous devez accepter le traitement de vos données.",
    }),
  }),
});

export type QuoteDraft = z.infer<typeof quoteDraftSchema>;

export const PROJECT_TYPES = [
  "Porte d'entrée",
  "Porte-fenêtre",
  "Fenêtre",
  "Garde-corps / balustrade",
  "Main courante",
  "Verrière / skylight",
  "Cage d'escalier",
  "Clôture / portail",
  "Mobilier & agencement",
  "Autre ouvrage inox",
] as const;

export const FINISHES = [
  "Brossé satiné",
  "Miroir poli",
  "Scotch-Brite",
  "Thermolaqué",
  "Non défini — à l'étude",
] as const;

export const BUDGET_RANGES = [
  "À définir",
  "Moins de 10 000 MAD",
  "10 000 – 30 000 MAD",
  "30 000 – 60 000 MAD",
  "Plus de 60 000 MAD",
] as const;

/** Limite des pièces jointes : 10 Mo par fichier, 5 fichiers max. */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_FILES = 5;
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
