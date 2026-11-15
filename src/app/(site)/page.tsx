import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import Workbench from "@/components/Workbench";
import { listProjects, listServices, getSiteSettings } from "@/lib/data";

export default async function HomePage() {
  const [projects, services, settings] = await Promise.all([
    listProjects({ publishedOnly: true }),
    listServices({ publishedOnly: true }),
    getSiteSettings(),
  ]);

  const featured = projects.slice(0, 5);

  return (
    <>
      <Workbench />
      <Hero
        title={settings.hero_title}
        subtitle={settings.hero_subtitle}
        image="/photos/ventana-aluminio-1.webp"
        imageAlt="Garde-corps inox BHAR INOX sur terrasse — réalisation"
      />

      {/* Panneaux-échantillons flottant sur l'établi acier */}
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 pb-16 pt-10 sm:gap-8 sm:px-6 sm:pt-14">

      {/* ---------- Métiers ---------- */}
      <section className="sample-plate steel-rule bg-white px-6 py-16 sm:px-10 sm:py-20" aria-labelledby="metiers-title">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Nos métiers</p>
              <h2 id="metiers-title" className="display mt-3 max-w-xl text-4xl text-charcoal sm:text-5xl">
                L&apos;acier inoxydable, maîtrisé de bout en bout.
              </h2>
            </div>
            <Link href="/services" className="btn btn-outline">
              Tous les services
            </Link>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service, i) => (
            <Reveal key={service.id} delay={i * 0.06} className="bg-white">
              <Link
                href="/services"
                className="group flex h-full flex-col p-8 transition-colors hover:bg-mist"
              >
                <span className="tech-label !text-steel-light">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display mt-6 text-2xl text-charcoal group-hover:text-royal">
                  {service.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-steel">
                  {service.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-royal">
                  En savoir plus
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Sélection de réalisations (grille asymétrique) ---------- */}
      <section className="sample-plate steel-rule bg-white px-6 py-16 sm:px-10 sm:py-20" aria-labelledby="realisations-title">
        <div>
          <Reveal>
            <p className="eyebrow">Réalisations</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
              <h2 id="realisations-title" className="display max-w-xl text-4xl text-charcoal sm:text-5xl">
                Des ouvrages dessinés pour durer.
              </h2>
              <Link href="/realisations" className="btn btn-outline">
                Tout le portfolio
              </Link>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {featured[0] && (
              <Reveal className="lg:col-span-2 lg:row-span-2" y={30}>
                <div className="h-full [&>a]:h-full [&>a>div:first-child]:h-[62%]">
                  <ProjectCard project={featured[0]} priority />
                </div>
              </Reveal>
            )}
            {featured.slice(1, 3).map((p, i) => (
              <Reveal key={p.id} delay={0.1 + i * 0.08}>
                <ProjectCard project={p} />
              </Reveal>
            ))}
            {featured.slice(3, 5).map((p, i) => (
              <Reveal key={p.id} delay={0.15 + i * 0.08} className="lg:col-span-3">
                <div className="[&>a]:grid [&>a]:grid-cols-[1.2fr_1fr] [&>a>div:first-child]:order-2">
                  <ProjectCard project={p} />
                </div>
              </Reveal>
            ))}
          </div>

          <p className="tech-label mt-10">
            Photographies de réalisations BHAR INOX — portfolio enrichi au fur
            et à mesure des nouveaux chantiers.
          </p>
        </div>
      </section>

      {/* ---------- Processus ---------- */}
      <section className="sample-plate sample-plate-dark steel-rule on-dark brushed-dark px-6 py-16 sm:px-10 sm:py-20" aria-labelledby="process-title">
        <div>
          <Reveal>
            <p className="eyebrow !text-steel-light">Notre manière de travailler</p>
            <h2 id="process-title" className="display mt-3 max-w-2xl text-4xl text-white sm:text-5xl">
              Un processus précis, du plan à la pose.
            </h2>
          </Reveal>

          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Écoute & relevé", "Analyse du besoin, mesures sur site et faisabilité technique."],
              ["02", "Conception", "Plans d'exécution, choix des profilés et des finitions."],
              ["03", "Fabrication", "Découpe, soudure, polissage et contrôle qualité en atelier."],
              ["04", "Pose & finition", "Installation soignée, réglages et remise de l'ouvrage."],
            ].map(([num, title, text], i) => (
              <Reveal as="li" key={num} delay={i * 0.08}>
                <div className="border-t-2 border-royal pt-6">
                  <span className="display text-4xl text-white/25">{num}</span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Présentation entreprise ---------- */}
      <section className="sample-plate steel-rule bg-white px-6 py-16 sm:px-10 sm:py-20" aria-labelledby="apropos-title">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">L&apos;entreprise</p>
            <h2 id="apropos-title" className="display mt-3 text-4xl text-charcoal sm:text-5xl">
              BHAR INOX
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-steel">
              {settings.about_intro}
            </p>
            <Link href="/a-propos" className="btn btn-outline mt-8">
              Découvrir l&apos;entreprise
            </Link>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="steel-rule relative aspect-[4/3] overflow-hidden border border-line bg-white">
              <Image
                src="/photos/WA0065.jpg"
                alt="Pose d'un garde-corps inox par l'équipe BHAR INOX"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="sample-plate sample-plate-dark steel-rule on-dark bg-royal px-6 py-14 sm:px-10 sm:py-16" aria-labelledby="cta-title">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <Reveal>
            <h2 id="cta-title" className="display max-w-xl text-3xl text-white sm:text-4xl">
              Un projet en inox ? Parlons-en.
            </h2>
            <p className="mt-3 text-white/70">
              Décrivez votre besoin en quelques étapes guidées — notre équipe
              revient vers vous avec une proposition.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/devis"
              className="btn border-white/30 bg-white text-royal hover:bg-white/90"
            >
              Demander un devis
            </Link>
          </Reveal>
        </div>
      </section>
      </div>
    </>
  );
}
