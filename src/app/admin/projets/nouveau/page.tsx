import { redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import ProjectForm from "../ProjectForm";

export default async function NewProjectPage() {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow !text-steel-light">Portfolio</p>
      <h1 className="display mt-2 text-3xl text-white">Nouveau projet</h1>
      <ProjectForm />
    </div>
  );
}
