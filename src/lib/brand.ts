export const BRAND = {
  name: "BHAR INOX",
  legalName: "STE BHAR INO MAR — SARL",
  tagline: "L'inox, façonné sur mesure.",
  baseline: "LA MENUISERIE",
} as const;

/**
 * Identité légale vérifiée à partir des documents officiels de la société
 * (registre de commerce, certificat ICE, bulletin d'identification fiscale).
 * Données publiques d'identification : publiables dans les mentions légales.
 * Toute donnée personnelle (gérant, CIN, domicile) est volontairement exclue.
 */
export const LEGAL_INFO = {
  /** Dénomination telle qu'au registre du commerce */
  legalName: "BHAR INO MAR SARL",
  /** Registre du commerce — tribunal de commerce de Meknès */
  rc: "54737 — Meknès",
  /** Identifiant commun de l'entreprise */
  ice: "002934714000038",
  /** Identifiant fiscal */
  if: "50633872",
  /** Siège social (registre du commerce) */
  address: "Im. 2, Mag. 1, Lot Arryan Bab Bettioui, Meknès",
  /** Capital social (registre du commerce) */
  capital: "100 000,00 MAD",
  /** Forme juridique */
  forme: "Société à responsabilité limitée (SARL)",
  /** Date d'immatriculation au registre du commerce */
  rcDate: "22/11/2021",
  /** Activités principales telles qu'au registre du commerce */
  activities:
    "Menuiseries d'inox, aluminium et verre ; travaux divers ou constructions ; import et export.",
} as const;

/**
 * Coordonnées commerciales et contact BHAR INOX.
 */
export const CONTACT_PLACEHOLDER = {
  phone: "+212 663-436992 / +212 612-619924",
  phoneNumbers: [
    { display: "+212 663-436992", raw: "+212663436992" },
    { display: "+212 612-619924", raw: "+212612619924" },
  ],
  phoneLabel: "+212 663-436992 / +212 612-619924",
  email: "contact@bhar-inox.ma",
  emailLabel: "contact@bhar-inox.ma",
  address: LEGAL_INFO.address,
  hours: "Lun – Sam : 08h30 – 19h00",
  disclaimer:
    "Atelier & showroom à Meknès. Devis gratuit et accompagnement personnalisé.",
} as const;

/**
 * Position GPS de l'atelier (source : Google Maps, lien fourni par BHAR INOX).
 * Utilisée par la carte intégrée de la page Contact et par les liens d'itinéraire.
 * Peut être ajustée depuis l'administration (Contenu & paramètres → Localisation).
 */
export const MAP_LOCATION = {
  lat: 33.86772537231445,
  lng: -5.565772533416748,
  zoom: 16,
  /** Lien Google Maps public partagé par l'entreprise */
  shareUrl:
    "https://maps.google.com/maps?q=loc:33.86772537231445,-5.565772533416748",
} as const;

/** Construit l'URL de la carte Google Maps intégrée (aucune clé API requise). */
export function mapsEmbedUrl(
  lat: number,
  lng: number,
  zoom: number,
): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

/** Lien « itinéraire » — ouvre Google Maps avec le point de départ libre. */
export function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Lien direct vers WhatsApp API / Click to Chat */
export function getWhatsAppUrl(
  phone = "212663436992",
  message = "Bonjour BHAR INOX, je souhaite des informations sur vos ouvrages en inox.",
): string {
  const clean = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}


export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/realisations", label: "Réalisations" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
] as const;
