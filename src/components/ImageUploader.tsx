"use client";

import { useRef, useState } from "react";

export default function ImageUploader({
  value,
  onChange,
  multiple = true,
  label = "Images",
  hint = "JPG, PNG, WebP ou AVIF — 4 Mo maximum par image.",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pathInput, setPathInput] = useState("");

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;

    const selected = multiple ? Array.from(files) : [files[0]];
    setUploading(true);
    setError(null);

    try {
      const uploaded: string[] = [];

      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.error ?? "Le téléversement a échoué.");
        }
        if (typeof json?.path !== "string") {
          throw new Error("Réponse invalide du serveur.");
        }
        uploaded.push(json.path);
      }

      onChange(multiple ? [...value, ...uploaded] : uploaded.slice(-1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addPath() {
    const path = pathInput.trim();
    if (!path || value.includes(path)) return;
    onChange(multiple ? [...value, path] : [path]);
    setPathInput("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    const next = [...value];
    const [selected] = next.splice(index, 1);
    onChange([selected, ...next]);
  }

  return (
    <div>
      <span className="field-label !text-steel-light">{label}</span>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn btn-primary !px-5 !py-2.5 text-sm"
        >
          {uploading
            ? "Téléversement…"
            : multiple && value.length > 0
              ? "Ajouter une image"
              : value.length > 0
                ? "Remplacer l'image"
                : "Choisir une image"}
        </button>
        <span className="text-xs text-white/50">{hint}</span>
      </div>

      {value.length > 0 && (
        <ul
          className={`mt-4 grid gap-3 ${
            multiple ? "grid-cols-2 sm:grid-cols-3" : "max-w-xs grid-cols-1"
          }`}
        >
          {value.map((src, index) => (
            <li
              key={`${src}-${index}`}
              className="overflow-hidden border border-line-dark bg-charcoal-soft/40"
            >
              <div className="relative aspect-[4/3] bg-charcoal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Aperçu ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {multiple && index === 0 && (
                  <span className="tech-label absolute left-2 top-2 bg-white/90 px-2 py-0.5 !text-charcoal">
                    Couverture
                  </span>
                )}
              </div>
              <div className="space-y-2 p-2">
                <p className="truncate font-mono text-[0.65rem] text-white/60" title={src}>
                  {src}
                </p>
                <div className="flex items-center justify-between gap-2 text-xs">
                  {multiple && index > 0 ? (
                    <button
                      type="button"
                      onClick={() => makeCover(index)}
                      className="font-semibold text-white/60 hover:text-white"
                    >
                      Mettre en couverture
                    </button>
                  ) : (
                    <span className="text-white/35">{multiple ? "Image principale" : "Image du service"}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="shrink-0 font-semibold text-white/60 hover:text-white"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          className="field min-w-0 flex-1 !border-line-dark !bg-charcoal !text-white"
          value={pathInput}
          onChange={(e) => setPathInput(e.target.value)}
          placeholder="ou un chemin existant : /photos/WA0047.jpg"
          aria-label="Chemin d'image existant"
        />
        <button
          type="button"
          onClick={addPath}
          disabled={!pathInput.trim()}
          className="btn btn-outline-light shrink-0 !px-4 !py-2 text-sm"
        >
          Ajouter le chemin
        </button>
      </div>

      {error && (
        <p role="alert" className="error-text mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
