"use client";

import { useState, type FormEvent } from "react";
import type { SiteSettings } from "@/lib/types";

export default function SettingsForm({
  initial,
  action,
}: {
  initial: SiteSettings;
  action: (formData: FormData) => Promise<void>;
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await action(new FormData(e.currentTarget));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setBusy(false);
    }
  }

  const field = "field !border-line-dark !bg-charcoal !text-white";
  const label = "field-label !text-steel-light";

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-8">
      <fieldset className="border border-line-dark p-6">
        <legend className="eyebrow !text-steel-light">Page d&apos;accueil</legend>
        <div className="space-y-5">
          <div>
            <label htmlFor="hero_title" className={label}>Titre du hero</label>
            <input id="hero_title" name="hero_title" defaultValue={initial.hero_title} className={field} />
          </div>
          <div>
            <label htmlFor="hero_subtitle" className={label}>Sous-titre du hero</label>
            <textarea id="hero_subtitle" name="hero_subtitle" rows={3} defaultValue={initial.hero_subtitle} className={field} />
          </div>
          <div>
            <label htmlFor="about_intro" className={label}>
              Introduction « À propos »
            </label>
            <textarea id="about_intro" name="about_intro" rows={4} defaultValue={initial.about_intro} className={field} />
            <p className="tech-label mt-2">
              Ne publier que des éléments validés par BHAR INOX.
            </p>
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-line-dark p-6">
        <legend className="eyebrow !text-steel-light">Coordonnées</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className={label}>Téléphone</label>
            <input id="phone" name="phone" defaultValue={initial.phone} className={field} />
          </div>
          <div>
            <label htmlFor="email" className={label}>Email</label>
            <input id="email" name="email" type="email" defaultValue={initial.email} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className={label}>Adresse</label>
            <input id="address" name="address" defaultValue={initial.address} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="hours" className={label}>Horaires</label>
            <input id="hours" name="hours" defaultValue={initial.hours} className={field} />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-line-dark p-6">
        <legend className="eyebrow !text-steel-light">Localisation (carte)</legend>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="map_lat" className={label}>Latitude</label>
            <input
              id="map_lat"
              name="map_lat"
              type="text"
              inputMode="decimal"
              defaultValue={initial.map_lat}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="map_lng" className={label}>Longitude</label>
            <input
              id="map_lng"
              name="map_lng"
              type="text"
              inputMode="decimal"
              defaultValue={initial.map_lng}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="map_zoom" className={label}>Zoom (3–19)</label>
            <input
              id="map_zoom"
              name="map_zoom"
              type="number"
              min={3}
              max={19}
              step={1}
              defaultValue={initial.map_zoom}
              className={field}
            />
          </div>
        </div>
        <p className="tech-label mt-3">
          Ces coordonnées alimentent la carte intégrée de la page Contact.
          Astuce&nbsp;: clic droit sur Google Maps → «&nbsp;Plus d&apos;info
          sur ce lieu&nbsp;» pour relever latitude / longitude. Format&nbsp;:
          point décimal (ex. 33.867725).
        </p>
      </fieldset>

      <fieldset className="border border-line-dark p-6">
        <legend className="eyebrow !text-steel-light">Référencement (SEO)</legend>
        <div className="space-y-5">
          <div>
            <label htmlFor="seo_title" className={label}>Titre SEO</label>
            <input id="seo_title" name="seo_title" defaultValue={initial.seo_title} className={field} />
          </div>
          <div>
            <label htmlFor="seo_description" className={label}>Description SEO</label>
            <textarea id="seo_description" name="seo_description" rows={3} defaultValue={initial.seo_description} className={field} />
          </div>
        </div>
      </fieldset>

      <div className="flex items-center gap-4 border-t border-line-dark pt-6">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        {saved && (
          <span role="status" className="text-sm font-semibold text-white/80">
            Modifications enregistrées ✓
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
    </form>
  );
}
