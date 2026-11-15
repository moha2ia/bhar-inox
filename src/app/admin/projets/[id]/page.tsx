import { notFound, redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import { listProjects } from "@/lib/data";
import ProjectForm from "../ProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const projects = await listProjects({ publishedOnly: false });
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow !text-steel-light">Portfolio</p>
      <h1 className="display mt-2 text-3xl text-white">Modifier le projet</h1>
      <ProjectForm
        initial={{
          id: project.id,
          slug: project.slug,
          title: project.title,
          description: project.description,
          category: project.category,
          location: project.location ?? "",
          images: project.images,
          sort_order: project.sort_order,
          published: project.published,
        }}
      />
    </div>
  );
}
