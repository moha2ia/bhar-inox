"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { QuoteStatus } from "@/lib/types";

export default function StatusChanger({
  quoteId,
  current,
  statuses,
  labels,
}: {
  quoteId: string;
  current: QuoteStatus;
  statuses: QuoteStatus[];
  labels: Record<QuoteStatus, string>;
}) {
  const router = useRouter();
  const [value, setValue] = useState<QuoteStatus>(current);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onChange(next: QuoteStatus) {
    const previous = value;
    setValue(next);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("La mise à jour a échoué.");
      setSaved(true);
      startTransition(() => router.refresh());
    } catch (err) {
      setValue(previous);
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  }

  return (
    <div className="min-w-56">
      <label htmlFor="status-select" className="field-label !text-steel-light">
        Statut de la demande
      </label>
      <div className="flex items-center gap-3">
        <select
          id="status-select"
          value={value}
          onChange={(e) => onChange(e.target.value as QuoteStatus)}
          disabled={pending}
          className="field !w-auto !border-line-dark !bg-charcoal !text-white"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {labels[s]}
            </option>
          ))}
        </select>
        {saved && (
          <span role="status" className="text-xs font-semibold text-white/70">
            Enregistré ✓
          </span>
        )}
      </div>
      {error && (
        <p role="alert" className="error-text mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
