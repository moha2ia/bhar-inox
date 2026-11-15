"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Row {
  id: string;
  slug: string;
  title: string;
  category: string;
  sort_order: number;
  published: boolean;
}

export default function ProjectsManager({ projects }: { projects: Row[] }) {
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("La suppression a échoué.");
      setConfirmId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      {error && (
        <p role="alert" className="error-text mb-4">
          {error}
        </p>
      )}
      <div className="overflow-x-auto border border-line-dark">
        <table className="w-full min-w-[680px] text-left text-sm">
          <caption className="sr-only">Projets du portfolio</caption>
          <thead>
            <tr className="border-b border-line-dark bg-charcoal-soft/70 text-steel-light">
              <th scope="col" className="px-5 py-3 font-semibold">Titre</th>
              <th scope="col" className="px-5 py-3 font-semibold">Catégorie</th>
              <th scope="col" className="px-5 py-3 font-semibold">Ordre</th>
              <th scope="col" className="px-5 py-3 font-semibold">Publié</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-dark">
            {projects.map((p) => (
              <tr key={p.id} className="bg-charcoal-soft/30">
                <td className="px-5 py-4 font-medium text-white">{p.title}</td>
                <td className="px-5 py-4 text-white/70">{p.category}</td>
                <td className="px-5 py-4 font-mono text-xs text-steel-light">
                  {p.sort_order}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide ${
                      p.published
                        ? "bg-white text-charcoal"
                        : "border border-line-dark text-white/50"
                    }`}
                  >
                    {p.published ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {confirmId === p.id ? (
                    <span className="flex items-center justify-end gap-3 text-xs">
                      <span className="text-white/60">Supprimer ?</span>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        disabled={busy}
                        className="font-semibold text-white underline"
                      >
                        {busy ? "…" : "Confirmer"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="text-white/50 hover:text-white"
                      >
                        Annuler
                      </button>
                    </span>
                  ) : (
                    <span className="flex items-center justify-end gap-4 text-xs">
                      <Link
                        href={`/admin/projets/${p.id}`}
                        className="font-semibold hover:underline"
                        style={{ color: "#9aa8ff" }}
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmId(p.id)}
                        className="font-semibold text-white/50 hover:text-white"
                      >
                        Supprimer
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
