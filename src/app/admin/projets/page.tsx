import Link from "next/link";
import { redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import { listProjects } from "@/lib/data";
import ProjectsManager from "./ProjectsManager";

export default async function AdminProjectsPage() {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  const projects = await listProjects({ publishedOnly: false });

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow !text-steel-light">Portfolio</p>
          <h1 className="display mt-2 text-3xl text-white">Projets</h1>
        </div>
        <Link href="/admin/projets/nouveau" className="btn btn-primary">
          + Nouveau projet
        </Link>
      </header>

      {projects.length === 0 ? (
        <p className="mt-10 border border-line-dark bg-charcoal-soft/40 p-10 text-center text-sm text-white/50">
          Aucun projet. Créez le premier projet du portfolio.
        </p>
      ) : (
        <ProjectsManager
          projects={projects.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            category: p.category,
            sort_order: p.sort_order,
            published: p.published,
          }))}
        />
      )}
    </div>
  );
}
