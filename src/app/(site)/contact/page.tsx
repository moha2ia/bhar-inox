import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ContactForm from "./ContactForm";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import {
  CONTACT_PLACEHOLDER,
  MAP_LOCATION,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  getWhatsAppUrl,
} from "@/lib/brand";
import { getSiteSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez BHAR INOX pour votre projet en acier inoxydable : téléphone, email, carte Google Maps et formulaire de contact.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  /* Coordonnées de la carte : valeurs administrables, repli sur la
     constante de la charte si la base ne les renvoie pas. */
  const lat = Number.isFinite(settings.map_lat)
    ? settings.map_lat
    : MAP_LOCATION.lat;
  const lng = Number.isFinite(settings.map_lng)
    ? settings.map_lng
    : MAP_LOCATION.lng;
  const zoom =
    Number.isFinite(settings.map_zoom) &&
    settings.map_zoom >= 3 &&
    settings.map_zoom <= 19
      ? settings.map_zoom
      : MAP_LOCATION.zoom;

  const phone = settings.phone || CONTACT_PLACEHOLDER.phone;
  const email = settings.email || CONTACT_PLACEHOLDER.email;
  const address = settings.address || CONTACT_PLACEHOLDER.address;
  const hours = settings.hours || CONTACT_PLACEHOLDER.hours;

  return (
    <div className="pt-18">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8">
        <Reveal>
          <p className="eyebrow">Contact</p>
          <h1 className="display mt-3 max-w-3xl text-4xl text-charcoal sm:text-6xl">
            Parlons de votre projet.
          </h1>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-12 sm:px-8 lg:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <div className="panel h-full p-8">
            <h2 className="display text-2xl text-charcoal">Coordonnées</h2>
            <dl className="mt-6 space-y-6 text-sm">
              <div>
                <dt className="field-label">Téléphone</dt>
                <dd className="flex flex-col gap-1.5">
                  {phone.split("/").map((num) => {
                    const trimmed = num.trim();
                    const raw = trimmed.replace(/\s+/g, "");
                    return (
                      <a
                        key={raw}
                        href={`tel:${raw}`}
                        className="font-semibold text-royal hover:underline"
                      >
                        {trimmed}
                      </a>
                    );
                  })}
                </dd>
              </div>
              <div>
                <dt className="field-label">Email</dt>
                <dd>
                  <a
                    href={`mailto:${email}`}
                    className="font-semibold text-royal hover:underline"
                  >
                    {email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="field-label">Adresse</dt>
                <dd className="text-steel">{address}</dd>
              </div>
              <div>
                <dt className="field-label">Horaires</dt>
                <dd className="text-steel">{hours}</dd>
              </div>
            </dl>
            <div className="mt-8 border-t border-line pt-6">
              <a
                href={getWhatsAppUrl(CONTACT_PLACEHOLDER.phoneNumbers[0].raw, "Bonjour BHAR INOX, je souhaite des renseignements sur vos réalisations.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn inline-flex items-center gap-2.5 !bg-[#25D366] !text-white hover:!bg-[#20bd5a] !border-transparent text-sm font-semibold"
              >
                <WhatsAppIcon className="h-5 w-5 fill-current" />
                Discuter sur WhatsApp
              </a>
            </div>
            <p className="mt-6 border-l-2 border-line pl-4 text-xs leading-relaxed text-steel">
              {CONTACT_PLACEHOLDER.disclaimer}
            </p>
            <p className="tech-label mt-6">
              Pour une demande chiffrée, préférez le
              <a href="/devis" className="text-royal hover:underline"> formulaire de devis</a>.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="panel h-full p-8">
            <h2 className="display text-2xl text-charcoal">Écrivez-nous</h2>
            <ContactForm />
          </div>
        </Reveal>
      </section>

      {/* Carte Google Maps — pleine largeur */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <Reveal delay={0.05}>
          <div className="panel overflow-hidden">
            <div className="flex flex-wrap items-baseline justify-between gap-3 px-8 pt-8">
              <h2 className="display text-2xl text-charcoal">Nous trouver</h2>
              <p className="tech-label">
                Atelier &amp; showroom — Meknès
              </p>
            </div>
            <p className="mt-2 px-8 text-sm text-steel">{address}</p>
            <div
              className="mt-6 border-y border-line bg-mist"
              style={{ aspectRatio: "21 / 9" }}
            >
              <iframe
                src={mapsEmbedUrl(lat, lng, zoom)}
                title="Carte Google Maps — BHAR INOX, Meknès"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-6">
              <p className="text-xs text-steel">
                Coordonnées GPS&nbsp;: {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
              <a
                href={mapsDirectionsUrl(lat, lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Itinéraire Google Maps ↗
              </a>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-steel">
            La position exacte est confirmée par BHAR INOX ; un signalement
            Google Maps « BHAR INOX » complète la publication.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
