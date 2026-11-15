import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: false },
};

export default function ConfidentialitePage() {
  return (
    <div className="pt-18">
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-16 sm:px-8">
        <p className="eyebrow">Confidentialité</p>
        <h1 className="display mt-3 text-4xl text-charcoal sm:text-5xl">
          Politique de confidentialité
        </h1>

        <div className="mt-10 space-y-8 leading-relaxed text-steel">
          <section>
            <h2 className="display text-xl text-charcoal">
              Données collectées
            </h2>
            <p className="mt-3">
              Via les formulaires de contact et de demande de devis, nous
              collectons uniquement les informations nécessaires au traitement
              de votre demande : identité, coordonnées, description du projet et
              documents que vous joignez facultativement.
            </p>
          </section>

          <section>
            <h2 className="display text-xl text-charcoal">Finalité</h2>
            <p className="mt-3">
              Ces données servent exclusivement à répondre à vos demandes,
              établir des devis et assurer le suivi commercial. Elles ne sont ni
              vendues ni cédées à des tiers.
            </p>
          </section>

          <section>
            <h2 className="display text-xl text-charcoal">
              Durée de conservation
            </h2>
            <p className="mt-3">
              Durée de conservation : à compléter et valider par {BRAND.name}{" "}
              avant la mise en production, conformément à la réglementation
              applicable.
            </p>
          </section>

          <section>
            <h2 className="display text-xl text-charcoal">Vos droits</h2>
            <p className="mt-3">
              Vous disposez de droits d&apos;accès, de rectification et de
              suppression de vos données. Pour les exercer, contactez-nous via
              les coordonnées de la page Contact.
            </p>
          </section>

          <section>
            <h2 className="display text-xl text-charcoal">Pièces jointes</h2>
            <p className="mt-3 text-sm">
              Les plans, croquis et documents transmis avec une demande de devis
              sont stockés dans un espace privé, accessibles uniquement aux
              personnes autorisées de {BRAND.name}.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
