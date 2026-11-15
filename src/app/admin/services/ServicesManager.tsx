"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Row {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  published: boolean;
}

export default function ServicesManager({ services: initial }: { services: Row[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(row: Partial<Row> & { id?: string }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        row.id ? `/api/admin/services/${row.id}` : "/api/admin/services",
        {
          method: row.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "L'enregistrement a échoué.");
      setEditing(null);
      setCreating(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
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

      {creating ? (
        <ServiceEditor
          onCancel={() => setCreating(false)}
          onSave={(row) => save(row)}
          busy={busy}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn btn-primary"
        >
          + Nouveau service
        </button>
      )}

      <ul className="mt-8 divide-y divide-line-dark border border-line-dark">
        {initial.map((s) =>
          editing?.id === s.id ? (
            <li key={s.id} className="bg-charcoal-soft/50 p-6">
              <ServiceEditor
                initial={s}
                onCancel={() => setEditing(null)}
                onSave={(row) => save({ ...row, id: s.id })}
                busy={busy}
              />
            </li>
          ) : (
            <li key={s.id} className="bg-charcoal-soft/30 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-steel-light">
                  {String(s.sort_order).padStart(2, "0")}
                </span>
                <span className="flex-1 font-medium text-white">{s.name}</span>
                <span
                  className={`px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide ${
                    s.published
                      ? "bg-white text-charcoal"
                      : "border border-line-dark text-white/50"
                  }`}
                >
                  {s.published ? "Publié" : "Brouillon"}
                </span>
                {confirmId === s.id ? (
                  <span className="flex items-center gap-3 text-xs">
                    <span className="text-white/60">Supprimer ?</span>
                    <button
                      type="button"
                      onClick={() => remove(s.id)}
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
                  <span className="flex gap-4 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditing(s)}
                      className="font-semibold hover:underline"
                      style={{ color: "#9aa8ff" }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(s.id)}
                      className="font-semibold text-white/50 hover:text-white"
                    >
                      Supprimer
                    </button>
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/50">
                {s.description}
              </p>
            </li>
          ),
        )}
        {initial.length === 0 && (
          <li className="bg-charcoal-soft/30 p-8 text-center text-sm text-white/50">
            Aucun service. Ajoutez le premier.
          </li>
        )}
      </ul>
    </div>
  );
}

function ServiceEditor({
  initial,
  onSave,
  onCancel,
  busy,
}: {
  initial?: Row;
  onSave: (row: Partial<Row>) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sort_order, setOrder] = useState(initial?.sort_order ?? initial?.sort_order ?? 1);
  const [published, setPublished] = useState(initial?.published ?? false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, description, sort_order, published });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
        <div>
          <label htmlFor="s-name" className="field-label !text-steel-light">
            Nom du service
          </label>
          <input
            id="s-name"
            required
            className="field !border-line-dark !bg-charcoal !text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="s-order" className="field-label !text-steel-light">
            Ordre
          </label>
          <input
            id="s-order"
            type="number"
            min={0}
            className="field !border-line-dark !bg-charcoal !text-white"
            value={sort_order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>
      </div>
      <div>
        <label htmlFor="s-desc" className="field-label !text-steel-light">
          Description
        </label>
        <textarea
          id="s-desc"
          required
          rows={3}
          className="field !border-line-dark !bg-charcoal !text-white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-white/80">
        <input
          type="checkbox"
          className="h-4 w-4 accent-[#1716A5]"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Publier ce service
      </label>
      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary !px-5 !py-2.5 text-sm">
          {busy ? "…" : "Enregistrer"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline-light !px-5 !py-2.5 text-sm">
          Annuler
        </button>
      </div>
    </form>
  );
}
