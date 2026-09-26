import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";

export default function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const img = project.images[0] ?? "/visuels/steel-1.svg";
  return (
    <Link
      href={`/realisations/${project.slug}`}
      className="card-hover group flex h-full flex-col overflow-hidden bg-white border border-line"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-mist">
        <Image
          src={img}
          alt={`${project.title} — ${project.category}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="tech-label absolute left-4 top-4 bg-white/92 px-2.5 py-1 !text-charcoal">
          {project.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="display text-xl text-charcoal transition-colors group-hover:text-royal">
          {project.title}
        </h3>
        {project.location && (
          <p className="tech-label mt-2">{project.location}</p>
        )}
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-steel">
          {project.description}
        </p>
        <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-royal">
          Voir le projet
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
