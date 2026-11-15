"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (
      !String(data.name).trim() ||
      !String(data.email).trim() ||
      !String(data.message).trim()
    ) {
      setStatus("error");
      setError("Merci de remplir tous les champs requis.");
      return;
    }

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Échec de l'envoi");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setError(
        "L'envoi a échoué. Merci de réessayer ou de nous joindre par téléphone.",
      );
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="mt-6 border border-line bg-mist p-6">
        <p className="display text-xl text-charcoal">Message envoyé.</p>
        <p className="mt-2 text-sm text-steel">
          Nous vous répondrons dans les meilleurs délais. Pour une demande
          chiffrée, utilisez le{" "}
          <a href="/devis" className="text-royal hover:underline">
            formulaire de devis
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate={false}>
      <div>
        <label htmlFor="c-name" className="field-label">
          Nom et prénom <span aria-hidden>*</span>
        </label>
        <input
          id="c-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="field"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-email" className="field-label">
            Email <span aria-hidden>*</span>
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="c-phone" className="field-label">
            Téléphone (facultatif)
          </label>
          <input
            id="c-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="field"
          />
        </div>
      </div>
      <div>
        <label htmlFor="c-message" className="field-label">
          Message <span aria-hidden>*</span>
        </label>
        <textarea id="c-message" name="message" required rows={5} className="field" />
      </div>

      {status === "error" && error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}
