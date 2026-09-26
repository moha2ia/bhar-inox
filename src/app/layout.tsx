import type { Metadata, Viewport } from "next";
import { LEGAL_INFO } from "@/lib/brand";
import "./globals.css";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BHAR INOX",
  legalName: LEGAL_INFO.legalName,
  description:
    "Menuiserie inox sur mesure : conception, fabrication et pose d'ouvrages en acier inoxydable — portes, fenêtres, garde-corps, verrières et agencements.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Im. 2, Mag. 1, Lot Arryan Bab Bettioui",
    addressLocality: "Meknès",
    addressCountry: "MA",
  },
  identifier: [
    { "@type": "PropertyValue", propertyID: "RC", value: "54737 Meknès" },
    { "@type": "PropertyValue", propertyID: "ICE", value: LEGAL_INFO.ice },
    { "@type": "PropertyValue", propertyID: "IF", value: LEGAL_INFO.if },
  ],
  knowsAbout: [
    "Menuiserie inox",
    "Garde-corps inox",
    "Portes en acier inoxydable",
    "Verrières",
    "Agencement inox",
  ],
};

export const metadata: Metadata = {
  title: {
    default: "BHAR INOX — L'inox, façonné sur mesure",
    template: "%s · BHAR INOX",
  },
  description:
    "BHAR INOX — menuiserie inox sur mesure : portes, fenêtres, garde-corps, balustrades et agencements en acier inoxydable, fabriqués avec précision.",
  keywords: [
    "inox",
    "menuiserie inox",
    "acier inoxydable",
    "sur mesure",
    "garde-corps inox",
    "BHAR INOX",
  ],
  openGraph: {
    title: "BHAR INOX — L'inox, façonné sur mesure",
    description:
      "Menuiserie inox sur mesure : conception, fabrication et pose d'ouvrages en acier inoxydable.",
    type: "website",
    locale: "fr_FR",
    siteName: "BHAR INOX",
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BHAR INOX — Menuiserie inox sur mesure, Meknès",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BHAR INOX — L'inox, façonné sur mesure",
    description:
      "Menuiserie inox sur mesure : conception, fabrication et pose d'ouvrages en acier inoxydable.",
    images: ["/brand/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1716A5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/png" href="/brand/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
