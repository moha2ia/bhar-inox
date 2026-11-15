"use client";

import { useMemo, useRef, useState } from "react";
import {
  PROJECT_TYPES,
  FINISHES,
  BUDGET_RANGES,
  MAX_FILE_SIZE,
  MAX_FILES,
  ALLOWED_FILE_TYPES,
  formatBytes,
} from "@/lib/quote-schema";

type FileItem = { file: File; error?: string };

const STEPS = ["Projet", "Caractéristiques", "Documents", "Coordonnées", "Vérification"] as const;

interface Draft {
  project_type: string;
  description: string;
  location: string;
  dimensions: string;
  quantity: string;
  finish: string;
  budget: string;
  deadline: string;
  full_name: string;
  company: string;
  phone: string;
  email: string;
  consent: boolean;
}

const EMPTY: Draft = {
  project_type: "",
  description: "",
  location: "",
  dimensions: "",
  quantity: "",
  finish: "",
  budget: "",
  deadline: "",
  full_name: "",
  company: "",
  phone: "",
  email: "",
  consent: false,
};

export default function QuoteWizard({ prefillType }: { prefillType?: string }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    ...EMPTY,
    project_type: prefillType && PROJECT_TYPES.includes(prefillType as (typeof PROJECT_TYPES)[number])
      ? prefillType
      : prefillType ?? "",
  });
  const [files, setFiles] = useState<FileItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (draft.project_type.trim().length < 2)
        e.project_type = "Précisez le type de réalisation.";
      if (draft.description.trim().length < 20)
        e.description = "Décrivez votre besoin en quelques phrases (20 caractères min.).";
      if (draft.location.trim().length < 2)
        e.location = "Indiquez la localisation du projet.";
    }
    if (s === 3) {
      if (draft.full_name.trim().length < 2) e.full_name = "Nom et prénom requis.";
      if (!/^[+\d\s().-]{6,20}$/.test(draft.phone.trim()))
        e.phone = "Numéro de téléphone valide requis.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()))
        e.email = "Adresse email invalide.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming: FileItem[] = [];
    for (const f of Array.from(list)) {
      let error: string | undefined;
      if (f.size > MAX_FILE_SIZE) error = `Fichier trop volumineux (max. ${formatBytes(MAX_FILE_SIZE)}).`;
      else if (!ALLOWED_FILE_TYPES.includes(f.type))
        error = "Format non autorisé (JPG, PNG, WebP ou PDF).";
      incoming.push({ file: f, error });
    }
    setFiles((prev) => {
      const merged = [...prev, ...incoming];
      if (merged.length > MAX_FILES) {
        return merged.slice(0, MAX_FILES).map((it, i) =>
          i >= MAX_FILES - incoming.length && !it.error
            ? { ...it, error: `Maximum ${MAX_FILES} fichiers.` }
            : it,
        );
      }
      return merged;
    });
  }

  const canSubmit = useMemo(
    () => draft.consent && files.every((f) => !f.error),
    [draft.consent, files],
  );

  async function submit() {
    if (!validateStep(3) || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      Object.entries(draft).forEach(([k, v]) => fd.append(k, String(v)));
      files.filter((f) => !f.error).forEach((f) => fd.append("files", f.file));

      const res = await fetch("/api/quote", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.reference) {
        throw new Error(json?.error ?? "Échec de l'enregistrement de la demande.");
      }
      setReference(json.reference);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Merci de réessayer.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- Écran de confirmation ---------- */
  if (reference) {
    return (
      <div role="status" className="panel p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-royal">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="display mt-6 text-3xl text-charcoal">
          Demande enregistrée.
        </h2>
        <p className="mt-4 text-steel">
          Votre référence de suivi est&nbsp;
          <strong className="font-mono text-lg text-royal">{reference}</strong>.
          Conservez-la pour tout échange.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-steel">
          Un accusé de réception vous sera adressé et notre équipe étudiera
          votre projet. Les délais de réponse dépendent des dispositions
          validées par BHAR INOX.
        </p>
        <a href="/" className="btn btn-outline mt-8">
          Retour à l&apos;accueil
        </a>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="panel overflow-hidden">
      {/* Indicateur de progression */}
      <div className="border-b border-line bg-mist px-6 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <ol className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Étapes">
            {STEPS.map((label, i) => (
              <li
                key={label}
                aria-current={i === step ? "step" : undefined}
                className={`text-xs font-semibold tracking-wide ${
                  i === step
                    ? "text-royal"
                    : i < step
                      ? "text-charcoal"
                      : "text-steel-light"
                }`}
              >
                <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>{" "}
                {label}
              </li>
            ))}
          </ol>
          <span className="tech-label hidden sm:block">{Math.round(progress)} %</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden bg-line" role="presentation">
          <div
            className="h-full bg-royal transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-6 sm:p-10">
        {/* ---------- Étape 1 : Projet ---------- */}
        {step === 0 && (
          <fieldset>
            <legend className="display text-2xl text-charcoal">Votre projet</legend>
            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="q-type" className="field-label">
                  Type de réalisation <span aria-hidden>*</span>
                </label>
                <select
                  id="q-type"
                  className="field"
                  value={draft.project_type}
                  onChange={(e) => set("project_type", e.target.value)}
                >
                  <option value="">— Sélectionnez —</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  {prefillType &&
                    !PROJECT_TYPES.includes(prefillType as (typeof PROJECT_TYPES)[number]) && (
                      <option value={prefillType}>{prefillType}</option>
                    )}
                </select>
                {errors.project_type && <p className="error-text">{errors.project_type}</p>}
              </div>

              <div>
                <label htmlFor="q-desc" className="field-label">
                  Description du besoin <span aria-hidden>*</span>
                </label>
                <textarea
                  id="q-desc"
                  rows={5}
                  className="field"
                  placeholder="Ouvrage souhaité, contraintes du site, style, usage…"
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                />
                {errors.description && <p className="error-text">{errors.description}</p>}
              </div>

              <div>
                <label htmlFor="q-loc" className="field-label">
                  Lieu du projet <span aria-hidden>*</span>
                </label>
                <input
                  id="q-loc"
                  type="text"
                  className="field"
                  placeholder="Ville, quartier, nom du chantier…"
                  value={draft.location}
                  onChange={(e) => set("location", e.target.value)}
                />
                {errors.location && <p className="error-text">{errors.location}</p>}
              </div>
            </div>
          </fieldset>
        )}

        {/* ---------- Étape 2 : Caractéristiques ---------- */}
        {step === 1 && (
          <fieldset>
            <legend className="display text-2xl text-charcoal">Caractéristiques</legend>
            <p className="mt-2 text-sm text-steel">
              Tous les champs de cette étape sont facultatifs — les dimensions
              seront prises en mesure si nécessaire.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="q-dim" className="field-label">
                  Dimensions approximatives
                </label>
                <input
                  id="q-dim"
                  type="text"
                  className="field"
                  placeholder="Ex. largeur 3,20 m × hauteur 1,10 m"
                  value={draft.dimensions}
                  onChange={(e) => set("dimensions", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="q-qty" className="field-label">
                  Quantité
                </label>
                <input
                  id="q-qty"
                  type="number"
                  min={1}
                  max={9999}
                  className="field"
                  value={draft.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="q-finish" className="field-label">
                  Finition souhaitée
                </label>
                <select
                  id="q-finish"
                  className="field"
                  value={draft.finish}
                  onChange={(e) => set("finish", e.target.value)}
                >
                  <option value="">— Non définie —</option>
                  {FINISHES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="q-budget" className="field-label">
                  Budget indicatif
                </label>
                <select
                  id="q-budget"
                  className="field"
                  value={draft.budget}
                  onChange={(e) => set("budget", e.target.value)}
                >
                  <option value="">— À définir —</option>
                  {BUDGET_RANGES.slice(1).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="q-deadline" className="field-label">
                  Délai souhaité
                </label>
                <input
                  id="q-deadline"
                  type="text"
                  className="field"
                  placeholder="Ex. avant fin décembre"
                  value={draft.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                />
              </div>
            </div>
          </fieldset>
        )}

        {/* ---------- Étape 3 : Documents ---------- */}
        {step === 2 && (
          <fieldset>
            <legend className="display text-2xl text-charcoal">Documents</legend>
            <p className="mt-2 text-sm text-steel">
              Facultatif : plans, croquis ou photos de référence. Formats JPG,
              PNG, WebP ou PDF — {formatBytes(MAX_FILE_SIZE)} maximum par
              fichier, {MAX_FILES} fichiers maximum.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_FILE_TYPES.join(",")}
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
              aria-hidden
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline mt-6"
            >
              Ajouter des fichiers
            </button>

            {files.length > 0 && (
              <ul className="mt-6 space-y-3">
                {files.map((item, i) => (
                  <li
                    key={`${item.file.name}-${i}`}
                    className="flex items-center justify-between gap-4 border border-line bg-mist px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-charcoal">
                        {item.file.name}
                      </p>
                      <p className="tech-label mt-0.5">
                        {formatBytes(item.file.size)}
                        {item.error && (
                          <span className="ml-2 font-semibold text-[#b42318]">
                            {item.error}
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                      className="shrink-0 text-sm font-semibold text-steel hover:text-royal"
                      aria-label={`Retirer ${item.file.name}`}
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
        )}

        {/* ---------- Étape 4 : Coordonnées ---------- */}
        {step === 3 && (
          <fieldset>
            <legend className="display text-2xl text-charcoal">Vos coordonnées</legend>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="q-name" className="field-label">
                  Nom et prénom <span aria-hidden>*</span>
                </label>
                <input
                  id="q-name"
                  type="text"
                  autoComplete="name"
                  className="field"
                  value={draft.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                />
                {errors.full_name && <p className="error-text">{errors.full_name}</p>}
              </div>
              <div>
                <label htmlFor="q-company" className="field-label">
                  Entreprise (facultatif)
                </label>
                <input
                  id="q-company"
                  type="text"
                  autoComplete="organization"
                  className="field"
                  value={draft.company}
                  onChange={(e) => set("company", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="q-phone" className="field-label">
                  Téléphone <span aria-hidden>*</span>
                </label>
                <input
                  id="q-phone"
                  type="tel"
                  autoComplete="tel"
                  className="field"
                  placeholder="+212 …"
                  value={draft.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {errors.phone && <p className="error-text">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="q-email" className="field-label">
                  Adresse email <span aria-hidden>*</span>
                </label>
                <input
                  id="q-email"
                  type="email"
                  autoComplete="email"
                  className="field"
                  value={draft.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>
            </div>
          </fieldset>
        )}

        {/* ---------- Étape 5 : Vérification ---------- */}
        {step === 4 && (
          <fieldset>
            <legend className="display text-2xl text-charcoal">Vérification</legend>
            <dl className="mt-6 divide-y divide-line border border-line">
              <SummaryRow label="Type de réalisation" value={draft.project_type} />
              <SummaryRow label="Lieu du projet" value={draft.location} />
              <SummaryRow label="Description" value={draft.description} />
              <SummaryRow label="Dimensions" value={draft.dimensions} empty="Non précisées" />
              <SummaryRow label="Quantité" value={draft.quantity} empty="—" />
              <SummaryRow label="Finition" value={draft.finish} empty="Non définie" />
              <SummaryRow label="Budget indicatif" value={draft.budget} empty="À définir" />
              <SummaryRow label="Délai souhaité" value={draft.deadline} empty="—" />
              <SummaryRow label="Fichiers joints" value={files.filter((f) => !f.error).map((f) => f.file.name).join(", ")} empty="Aucun" />
              <SummaryRow label="Nom" value={`${draft.full_name}${draft.company ? ` — ${draft.company}` : ""}`} />
              <SummaryRow label="Téléphone" value={draft.phone} />
              <SummaryRow label="Email" value={draft.email} />
            </dl>

            <div className="mt-6 flex items-start gap-3">
              <input
                id="q-consent"
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[#1716A5]"
                checked={draft.consent}
                onChange={(e) => set("consent", e.target.checked)}
              />
              <label htmlFor="q-consent" className="text-sm leading-relaxed text-steel">
                J&apos;accepte que les informations transmises soient utilisées
                pour traiter ma demande de devis, conformément à la{" "}
                <a href="/confidentialite" className="text-royal hover:underline">
                  politique de confidentialité
                </a>
                .
              </label>
            </div>

            {submitError && (
              <p role="alert" className="error-text mt-4 font-semibold">
                {submitError}
              </p>
            )}
          </fieldset>
        )}

        {/* ---------- Navigation ---------- */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn btn-outline">
              ← Précédent
            </button>
          ) : (
            <span />
          )}

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn btn-primary">
              Continuer →
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !canSubmit}
              className="btn btn-primary"
            >
              {submitting ? "Envoi en cours…" : "Envoyer la demande"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  empty,
}: {
  label: string;
  value?: string;
  empty?: string;
}) {
  const has = value && value.trim().length > 0;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 sm:grid-cols-[180px_1fr]">
      <dt className="field-label !mb-0">{label}</dt>
      <dd className={`whitespace-pre-wrap text-sm ${has ? "text-charcoal" : "text-steel-light"}`}>
        {has ? value : empty}
      </dd>
    </div>
  );
}
