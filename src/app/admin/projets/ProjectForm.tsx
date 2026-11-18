"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";

export interface ProjectFormValues {
  id?: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  location: string;
  images: string[];
  sort_order: number;
  published: boolean;
}

const EMPTY: ProjectFormValues = {
  slug: "",
  title: "",
  description: "",
  category: "Portes",
  location: "",
  images: [],
  sort_order: 1,
  published: false,
};

const CATEGORIES = [
  "Portes",
  "Fenêtres",
  "Garde-corps",
  "Verrières",
  "Agencement",
  "Clôtures",
  "Autre",
];

export default function ProjectForm({ initial }: { initial?: ProjectFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<ProjectFormValues>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ProjectFormValues>(k: K, v: ProjectFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  function slugify(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = { ...values, slug: values.slug || slugify(values.title) };
      const res = await fetch(
        initial?.id ? `/api/admin/projects/${initial.id}` : "/api/admin/projects",
        {
          method: initial?.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "L'enregistrement a échoué.");
      router.push("/admin/projets");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-3xl space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="p-title" className="field-label !text-steel-light">
            Titre du projet <span aria-hidden>*</span>
          </label>
          <input
            id="p-title"
            required
            className="field !border-line-dark !bg-charcoal !text-white"
            value={values.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!initial?.id)
                set("slug", slugify(e.target.value));
            }}
          />
        </div>
        <div>
          <label htmlFor="p-slug" className="field-label !text-steel-light">
            Identifiant URL (slug)
          </label>
          <input
            id="p-slug"
            className="field font-mono !text-sm !border-line-dark !bg-charcoal !text-white"
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="p-cat" className="field-label !text-steel-light">
            Catégorie
          </label>
          <select
            id="p-cat"
            className="field !border-line-dark !bg-charcoal !text-white"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-loc" className="field-label !text-steel-light">
            Localisation (si autorisée)
          </label>
          <input
            id="p-loc"
            className="field !border-line-dark !bg-charcoal !text-white"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Laisser vide si non autorisée"
          />
        </div>
        <div>
          <label htmlFor="p-order" className="field-label !text-steel-light">
            Ordre d&apos;affichage
          </label>
          <input
            id="p-order"
            type="number"
            min={0}
            className="field !border-line-dark !bg-charcoal !text-white"
            value={values.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="p-desc" className="field-label !text-steel-light">
            Description <span aria-hidden>*</span>
          </label>
          <textarea
            id="p-desc"
            required
            rows={5}
            className="field !border-line-dark !bg-charcoal !text-white"
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <ImageUploader
            value={values.images}
            onChange={(images) => set("images", images)}
            multiple
            label="Images du projet (la première sert de couverture)"
            hint="Téléversez depuis votre appareil : JPG, PNG, WebP ou AVIF — 10 Mo max."
          />
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#1716A5]"
            checked={values.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          Publier ce projet (visible sur le site public)
        </label>
      </div>

      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      <div className="flex gap-3 border-t border-line-dark pt-6">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projets")}
          className="btn btn-outline-light"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
