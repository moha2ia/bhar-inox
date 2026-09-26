import type { Metadata } from "next";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { getSiteSettings } from "@/lib/data";
import { BRAND, LEGAL_INFO } from "@/lib/brand";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Présentation de BHAR INOX : approche, processus de travail et savoir-faire en menuiserie inox sur mesure.",
};

const PROCESS = [
  ["01", "Écoute & relevé", "Analyse du besoin, mesures précises sur site et étude de faisabilité technique."],
  ["02", "Conception", "Plans d'exécution détaillés, choix des profilés, fixations et finitions."],
  ["03", "Fabrication", "Usinage, soudure TIG, polissage et contrôle qualité en atelier."],
  ["04", "Pose & finition", "Installation, réglages, nettoyage et remise de l'ouvrage avec ses consignes d'entretien."],
];

export default async function AProposPage() {
  const settings = await getSiteSettings();

  return (
    <div className="pt-18">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8">
        <Reveal>
          <p className="eyebrow">À propos</p>
          <h1 className="display mt-3 max-w-3xl text-4xl text-charcoal sm:text-6xl">
            BHAR INOX
          </h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-steel">
            {settings.about_intro}
          </p>
        </Reveal>
      </section>

      <section className="bg-white py-20" aria-labelledby="process-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <p className="eyebrow">Processus de travail</p>
            <h2 id="process-title" className="display mt-3 text-4xl text-charcoal">
              Du premier contact à la livraison.
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map(([num, title, text], i) => (
              <Reveal as="li" key={num} delay={i * 0.08}>
                <div className="border-t-2 border-royal pt-6">
                  <span className="display text-4xl text-charcoal/15">{num}</span>
                  <h3 className="mt-4 text-lg font-semibold text-charcoal">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Sur le chantier ---------- */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8" aria-labelledby="chantier-title">
        <Reveal>
          <p className="eyebrow">Sur le chantier</p>
          <h2 id="chantier-title" className="display mt-3 max-w-2xl text-3xl text-charcoal sm:text-4xl">
            Nos équipes à l&apos;ouvrage, du relevé à la finition.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              src: "/photos/WA0056.jpg",
              alt: "Pose d'un garde-corps inox en façade par un technicien BHAR INOX",
              caption: "Pose en façade",
            },
            {
              src: "/photos/WA0066.jpg",
              alt: "Réglage et fixation d'une balustrade inox sur chantier",
              caption: "Réglages & fixations",
            },
            {
              src: "/photos/WA0069.jpg",
              alt: "Escalier inox en finition, avant remise de l'ouvrage",
              caption: "Finition avant remise",
            },
          ].map((img, i) => (
            <Reveal key={img.src} delay={i * 0.08}>
              <figure className="group">
                <div className="relative aspect-[3/4] overflow-hidden border border-line bg-mist">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <figcaption className="tech-label mt-3">{img.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Reveal>
          <div className="panel border-l-4 border-l-royal p-8">
            <h2 className="display text-xl text-charcoal">
              Identité de l&apos;entreprise
            </h2>
            <p className="mt-2 text-sm text-steel">
              Informations d&apos;identification vérifiées à partir des
              documents officiels de la société (registre du commerce,
              certificat ICE, identification fiscale).
            </p>
            <dl className="mt-6 grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2">
              <div className="flex gap-3">
                <dt className="w-36 shrink-0 text-charcoal">Dénomination</dt>
                <dd className="text-steel">{LEGAL_INFO.legalName}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-36 shrink-0 text-charcoal">Forme juridique</dt>
                <dd className="text-steel">{LEGAL_INFO.forme}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-36 shrink-0 text-charcoal">Siège social</dt>
                <dd className="text-steel">{LEGAL_INFO.address}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-36 shrink-0 text-charcoal">Capital social</dt>
                <dd className="text-steel">{LEGAL_INFO.capital}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-36 shrink-0 text-charcoal">
                  Registre du commerce
                </dt>
                <dd className="text-steel">
                  N° {LEGAL_INFO.rc} — immatriculée le {LEGAL_INFO.rcDate}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-36 shrink-0 text-charcoal">ICE</dt>
                <dd className="text-steel">{LEGAL_INFO.ice}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-36 shrink-0 text-charcoal">
                  Identifiant fiscal
                </dt>
                <dd className="text-steel">{LEGAL_INFO.if}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-36 shrink-0 text-charcoal">Activités</dt>
                <dd className="text-steel">{LEGAL_INFO.activities}</dd>
              </div>
            </dl>
            <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-steel">
              Historique détaillé, effectif, certifications et références
              clients ne sont pas affichés : ils seront publiés uniquement
              après validation par {BRAND.name}, conformément au cahier des
              prescriptions spéciales.
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
