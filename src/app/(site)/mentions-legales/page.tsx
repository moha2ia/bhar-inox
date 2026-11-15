import type { Metadata } from "next";
import { BRAND, LEGAL_INFO } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <div className="pt-18">
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8">
        <p className="eyebrow">Informations légales</p>
        <h1 className="display mt-3 text-4xl text-charcoal sm:text-5xl">
          Mentions légales
        </h1>

        <div className="mt-10 space-y-8 leading-relaxed text-steel">
          <section>
            <h2 className="display text-xl text-charcoal">Éditeur du site</h2>
            <p className="mt-3">
              {LEGAL_INFO.legalName} — forme juridique {LEGAL_INFO.forme},
              opérant sous l&apos;identité {BRAND.name} — menuiserie inox sur
              mesure.
            </p>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-charcoal">Siège social</dt>
                <dd>{LEGAL_INFO.address}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-charcoal">
                  Registre du commerce
                </dt>
                <dd>
                  N° {LEGAL_INFO.rc} (immatriculée le {LEGAL_INFO.rcDate})
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-charcoal">ICE</dt>
                <dd>{LEGAL_INFO.ice}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-charcoal">
                  Identifiant fiscal
                </dt>
                <dd>{LEGAL_INFO.if}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-charcoal">Capital social</dt>
                <dd>{LEGAL_INFO.capital}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-charcoal">Activités</dt>
                <dd>{LEGAL_INFO.activities}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-charcoal">Téléphone</dt>
                <dd>+212 663-436992 / +212 612-619924</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-32 shrink-0 text-charcoal">Email</dt>
                <dd>contact@bhar-inox.ma</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm">
              Pour toute demande ou projet, contactez-nous via le{" "}
              <a href="/contact" className="text-royal hover:underline">
                formulaire de contact
              </a>{" "}
              ou le{" "}
              <a href="/devis" className="text-royal hover:underline">
                formulaire de demande de devis
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="display text-xl text-charcoal">
              Hébergement
            </h2>
            <p className="mt-3">
              Hébergeur : à compléter et valider par BHAR INOX avant la mise en
              production (nom, adresse, coordonnées).
            </p>
          </section>

          <section>
            <h2 className="display text-xl text-charcoal">
              Propriété intellectuelle
            </h2>
            <p className="mt-3">
              L&apos;ensemble des contenus (textes, photographies, logo) est la
              propriété de {BRAND.legalName} sauf mention contraire. Toute
              reproduction sans autorisation est interdite.
            </p>
          </section>

          <section>
            <h2 className="display text-xl text-charcoal">Avertissement</h2>
            <p className="mt-3 text-sm">
              L&apos;identité légale de l&apos;éditeur est vérifiée à partir des
              documents officiels de la société. Les informations commerciales
              encore provisoires (téléphone, email, horaires, références)
              seront validées par {BRAND.name} avant publication définitive,
              conformément au cahier des prescriptions spéciales.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
