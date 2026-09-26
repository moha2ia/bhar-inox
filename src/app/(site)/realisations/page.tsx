import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ProjectCard from "@/components/ProjectCard";
import { listProjects, listCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "Réalisations",
  description:
    "Portfolio des réalisations BHAR INOX : portes, garde-corps, verrières et agencements en inox sur mesure.",
};

export default async function RealisationsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const [categories, projects] = await Promise.all([
    listCategories(),
    listProjects({ publishedOnly: true, category: cat }),
  ]);

  return (
    <div className="pt-18">
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8">
        <Reveal>
          <p className="eyebrow">Portfolio</p>
          <h1 className="display mt-3 max-w-3xl text-4xl text-charcoal sm:text-6xl">
            Réalisations en acier inoxydable.
          </h1>
          <p className="tech-label mt-6 max-w-2xl">
            Photographies authentiques des réalisations BHAR INOX : portes,
            garde-corps, verrières, fenêtres et agencements en inox sur mesure.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <nav aria-label="Filtrer par catégorie" className="mt-10 flex flex-wrap gap-2">
            <Link
              href="/realisations"
              aria-current={!cat ? "true" : undefined}
              className={`border px-4 py-2 text-sm font-semibold transition-colors ${
                !cat
                  ? "border-royal bg-royal text-white"
                  : "border-line bg-white text-charcoal hover:border-steel"
              }`}
            >
              Toutes
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={`/realisations?cat=${encodeURIComponent(c)}`}
                aria-current={cat === c ? "true" : undefined}
                className={`border px-4 py-2 text-sm font-semibold transition-colors ${
                  cat === c
                    ? "border-royal bg-royal text-white"
                    : "border-line bg-white text-charcoal hover:border-steel"
                }`}
              >
                {c}
              </Link>
            ))}
          </nav>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8" aria-label="Galerie des réalisations">
        {projects.length === 0 ? (
          <div className="panel mt-6 p-16 text-center">
            <p className="display text-2xl text-charcoal">
              Aucune réalisation dans cette catégorie pour le moment.
            </p>
            <p className="mt-3 text-sm text-steel">
              Revenez bientôt — le portfolio est enrichi au fur et à mesure des
              publications validées.
            </p>
            <Link href="/realisations" className="btn btn-outline mt-8">
              Voir toutes les réalisations
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.07}>
                <ProjectCard project={p} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
