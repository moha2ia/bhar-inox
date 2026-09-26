import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import QuoteWizard from "./QuoteWizard";

export const metadata: Metadata = {
  title: "Demande de devis",
  description:
    "Décrivez votre projet en inox en quelques étapes guidées : type d'ouvrage, caractéristiques, documents et coordonnées.",
};

export default async function DevisPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; similaire?: string }>;
}) {
  const { type, similaire } = await searchParams;
  const prefillType = type ?? (similaire ? `Ouvrage similaire à : ${similaire}` : undefined);

  return (
    <div className="pt-18">
      <section className="mx-auto max-w-7xl px-5 pb-12 pt-16 sm:px-8">
        <Reveal>
          <p className="eyebrow">Demande de devis</p>
          <h1 className="display mt-3 max-w-3xl text-4xl text-charcoal sm:text-6xl">
            Votre projet, étape par étape.
          </h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-steel">
            Cinq étapes courantes, aucune obligation de tout savoir : décrivez
            votre besoin, nous revenons vers vous avec une proposition. Les
            pièces jointes (plans, croquis, photos) sont facultatives.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <Reveal delay={0.1}>
          <QuoteWizard prefillType={prefillType} />
        </Reveal>
      </section>
    </div>
  );
}
