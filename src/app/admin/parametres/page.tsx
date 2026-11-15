import { redirect } from "next/navigation";
import { checkSession } from "@/lib/admin-session";
import { getSiteSettings, updateSiteSettings } from "@/lib/data";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const session = await checkSession();
  if (!session) redirect("/admin/login");

  const settings = await getSiteSettings();

  async function save(formData: FormData) {
    "use server";
    const session = await checkSession();
    if (!session) redirect("/admin/login");
    const parseCoord = (v: FormDataEntryValue | null, fallback: number) => {
      const n = Number(String(v ?? "").replace(",", "."));
      return Number.isFinite(n) ? n : fallback;
    };
    await updateSiteSettings({
      hero_title: String(formData.get("hero_title") ?? ""),
      hero_subtitle: String(formData.get("hero_subtitle") ?? ""),
      about_intro: String(formData.get("about_intro") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      address: String(formData.get("address") ?? ""),
      hours: String(formData.get("hours") ?? ""),
      seo_title: String(formData.get("seo_title") ?? ""),
      seo_description: String(formData.get("seo_description") ?? ""),
      map_lat: parseCoord(formData.get("map_lat"), settings.map_lat),
      map_lng: parseCoord(formData.get("map_lng"), settings.map_lng),
      map_zoom: Math.min(
        19,
        Math.max(3, Math.round(parseCoord(formData.get("map_zoom"), settings.map_zoom))),
      ),
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <p className="eyebrow !text-steel-light">Configuration</p>
        <h1 className="display mt-2 text-3xl text-white">
          Contenu & paramètres
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/60">
          Ces contenus alimentent la page d&apos;accueil, la page À propos et
          les coordonnées du site. Aucune donnée commerciale ne doit être
          publiée sans validation de BHAR INOX.
        </p>
      </header>

      <SettingsForm initial={settings} action={save} />
    </div>
  );
}
