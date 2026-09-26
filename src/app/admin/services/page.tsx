import { redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import { listServices } from "@/lib/data";
import ServicesManager from "./ServicesManager";

export default async function AdminServicesPage() {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  const services = await listServices({ publishedOnly: false });

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="eyebrow !text-steel-light">Catalogue</p>
        <h1 className="display mt-2 text-3xl text-white">Services</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/60">
          Le catalogue publié alimente la page Services du site. Les libellés
          définitifs seront validés par BHAR INOX.
        </p>
      </header>

      <ServicesManager
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          sort_order: s.sort_order,
          published: s.published,
        }))}
      />
    </div>
  );
}
