"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Connexion impossible.");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <p className="display text-2xl text-white">BHAR INOX</p>
          <p className="tech-label mt-1 !text-steel-light">
            Espace administrateur
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-8 border border-line-dark bg-charcoal-soft/50 p-8"
        >
          <div>
            <label htmlFor="a-email" className="field-label !text-steel-light">
              Email
            </label>
            <input
              id="a-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="field !border-line-dark !bg-charcoal !text-white"
            />
          </div>
          <div className="mt-5">
            <label htmlFor="a-password" className="field-label !text-steel-light">
              Mot de passe
            </label>
            <input
              id="a-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="field !border-line-dark !bg-charcoal !text-white"
            />
          </div>

          {error && (
            <p role="alert" className="error-text mt-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary mt-6 w-full justify-center"
          >
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
