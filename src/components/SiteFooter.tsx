import Link from "next/link";
import Image from "next/image";
import {
  BRAND,
  CONTACT_PLACEHOLDER,
  LEGAL_INFO,
  MAP_LOCATION,
  mapsDirectionsUrl,
} from "@/lib/brand";

import WhatsAppIcon from "./WhatsAppIcon";

export default function SiteFooter() {
  return (
    <footer className="on-dark brushed-dark text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div>
            <Image
              src="/brand/logo-2x.png"
              alt="BHAR INOX — LA MENUISERIE"
              width={181}
              height={71}
              className="h-14 w-auto"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              Menuiserie inox sur mesure — conception, fabrication et pose
              d&apos;ouvrages en acier inoxydable.
            </p>
          </div>

          <nav aria-label="Liens de pied de page">
            <h2 className="eyebrow !text-white/50">Navigation</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/" className="text-white/80 hover:text-white">Accueil</Link></li>
              <li><Link href="/services" className="text-white/80 hover:text-white">Services</Link></li>
              <li><Link href="/realisations" className="text-white/80 hover:text-white">Réalisations</Link></li>
              <li><Link href="/a-propos" className="text-white/80 hover:text-white">À propos</Link></li>
              <li><Link href="/devis" className="text-white/80 hover:text-white">Demande de devis</Link></li>
              <li><Link href="/contact" className="text-white/80 hover:text-white">Contact</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow !text-white/50">Contact</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li className="flex flex-col gap-1.5">
                {CONTACT_PLACEHOLDER.phoneNumbers.map((p) => (
                  <a
                    key={p.raw}
                    href={`tel:${p.raw}`}
                    className="hover:text-white hover:underline flex items-center gap-1.5"
                  >
                    <span>{p.display}</span>
                  </a>
                ))}
              </li>
              <li>
                <a
                  href={`https://wa.me/212663436992`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#25D366] hover:underline font-medium"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-current" />
                  WhatsApp direct
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_PLACEHOLDER.email}`}
                  className="hover:text-white hover:underline"
                >
                  {CONTACT_PLACEHOLDER.email}
                </a>
              </li>
              <li>
                <a
                  href={mapsDirectionsUrl(MAP_LOCATION.lat, MAP_LOCATION.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white hover:underline"
                >
                  📍 {LEGAL_INFO.address} ↗
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-white/40">
              {CONTACT_PLACEHOLDER.disclaimer}
            </p>
          </div>

          <div>
            <h2 className="eyebrow !text-white/50">Légal</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/mentions-legales" className="text-white/80 hover:text-white">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="text-white/80 hover:text-white">Confidentialité</Link></li>
              <li><Link href="/admin" className="text-white/50 hover:text-white/80">Espace administrateur</Link></li>
            </ul>
          </div>
        </div>

        <hr className="hairline-dark my-10" />

        <div className="grid gap-2 text-xs leading-relaxed text-white/40">
          <p>
            © {new Date().getFullYear()} {LEGAL_INFO.legalName} — Tous droits
            réservés.
          </p>
          <p>
            RC {LEGAL_INFO.rc} · ICE {LEGAL_INFO.ice} · IF {LEGAL_INFO.if} ·
            Capital {LEGAL_INFO.capital}
          </p>
        </div>
        <p className="mt-3 text-xs tracking-widest-xs uppercase text-white/40 sm:text-right">
          {BRAND.baseline}
        </p>
      </div>
    </footer>
  );
}
