import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import { listServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Portes, fenêtres, garde-corps, verrières, agencement et maintenance en acier inoxydable sur mesure — BHAR INOX.",
};

export default async function ServicesPage() {
  const services = await listServices({ publishedOnly: true });

  return (
    <div className="pt-18">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8">
        <Reveal>
          <p className="eyebrow">Services & savoir-faire</p>
          <h1 className="display mt-3 max-w-3xl text-4xl text-charcoal sm:text-6xl">
            Chaque ouvrage est pensé, calculé et fabriqué pour son usage.
          </h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-steel">
            La liste des prestations ci-dessous sera confirmée et enrichie par
            BHAR INOX. Chaque service peut faire l&apos;objet d&apos;une étude
            sur mesure via notre formulaire de devis.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8" aria-label="Liste des services">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={(i % 2) * 0.08}>
              <article className="panel card-hover flex h-full flex-col sm:flex-row">
                <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-mist sm:aspect-auto sm:w-56">
                  <Image
                    src={service.image ?? "/visuels/steel-1.svg"}
                    alt={`${service.name} — illustration`}
                    fill
                    sizes="(max-width: 640px) 100vw, 224px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <span className="tech-label !text-steel-light">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="display mt-3 text-2xl text-charcoal">
                    {service.name}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                    {service.description}
                  </p>
                  <Link
                    href={`/devis?type=${encodeURIComponent(service.name)}`}
                    className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-royal hover:underline"
                  >
                    Demander un devis pour ce service
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
