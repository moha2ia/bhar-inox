import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getProjectBySlug, listProjects } from "@/lib/data";
import { getWhatsAppUrl, CONTACT_PLACEHOLDER } from "@/lib/brand";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Projet introuvable" };
  return {
    title: project.title,
    description: project.description.slice(0, 160),
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const others = (await listProjects({ publishedOnly: true }))
    .filter((p) => p.id !== project.id)
    .slice(0, 3);

  return (
    <div className="pt-18">
      <article>
        {/* En-tête éditorial */}
        <header className="mx-auto max-w-7xl px-5 pb-12 pt-14 sm:px-8">
          <Reveal>
            <nav aria-label="Fil d'ariane" className="tech-label">
              <Link href="/realisations" className="hover:text-royal">
                Réalisations
              </Link>
              <span aria-hidden className="mx-2">/</span>
              <span>{project.category}</span>
            </nav>
            <h1 className="display mt-6 max-w-4xl text-4xl text-charcoal sm:text-6xl">
              {project.title}
            </h1>
            {project.location && (
              <p className="tech-label mt-4">{project.location}</p>
            )}
          </Reveal>
        </header>

        {/* Image principale */}
        <Reveal y={30} className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="steel-rule relative aspect-[4/3] overflow-hidden border border-line bg-mist sm:aspect-[16/10]">
            <Image
              src={project.images[0] ?? "/visuels/steel-1.svg"}
              alt={project.title}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover"
            />
          </div>
        </Reveal>

        {/* Texte + galerie */}
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <p className="eyebrow">Le projet</p>
              <p className="mt-5 leading-relaxed text-steel">
                {project.description}
              </p>
              <hr className="hairline my-8" />
              <p className="tech-label">
                Réalisation BHAR INOX — pose et finitions assurées par nos
                équipes.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href={`/devis?similaire=${encodeURIComponent(project.title)}`} className="btn btn-primary">
                  Demander un devis similaire
                </Link>
                <a
                  href={getWhatsAppUrl(
                    CONTACT_PLACEHOLDER.phoneNumbers[0].raw,
                    `Bonjour BHAR INOX, je souhaite des renseignements concernant votre réalisation : ${project.title}`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn inline-flex items-center justify-center gap-2 !bg-[#25D366] !text-white hover:!bg-[#20bd5a] !border-transparent text-sm font-semibold"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-current" />
                  WhatsApp
                </a>
              </div>
            </div>
          </Reveal>

          <div className="columns-1 gap-6 sm:columns-2 [&>*]:mb-6">
            {project.images.slice(1).map((img, i) => (
              <Reveal key={img + i} delay={i * 0.08} className="break-inside-avoid">
                <div className="relative aspect-[3/4] overflow-hidden border border-line bg-mist">
                  <Image
                    src={img}
                    alt={`${project.title} — vue ${i + 2}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </article>

      {/* Autres projets */}
      {others.length > 0 && (
        <section className="bg-white py-20" aria-labelledby="others-title">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <h2 id="others-title" className="eyebrow">Autres réalisations</h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.07}>
                  <Link
                    href={`/realisations/${p.slug}`}
                    className="card-hover group block border border-line bg-white"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-mist">
                      <Image
                        src={p.images[0] ?? "/visuels/steel-1.svg"}
                        alt={p.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="display text-lg text-charcoal group-hover:text-royal">
                        {p.title}
                      </h3>
                      <p className="tech-label mt-1">{p.category}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
