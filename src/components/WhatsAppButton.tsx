"use client";

import { useState, useRef, useEffect } from "react";
import { CONTACT_PLACEHOLDER, getWhatsAppUrl } from "@/lib/brand";

import WhatsAppIcon from "./WhatsAppIcon";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const defaultMsg = "Bonjour BHAR INOX, je souhaite des informations sur vos ouvrages en inox.";

  return (
    <div
      ref={dropdownRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
    >
      {/* Popup Panel */}
      {isOpen && (
        <div className="mb-3 w-72 rounded-xl border border-line bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="font-semibold text-sm text-charcoal">
                Discussion WhatsApp
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-steel hover:text-charcoal p-1"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-steel">
            Contactez directement notre atelier pour vos devis et questions techniques&nbsp;:
          </p>

          <div className="mt-4 space-y-2">
            {CONTACT_PLACEHOLDER.phoneNumbers.map((phone, idx) => (
              <a
                key={phone.raw}
                href={getWhatsAppUrl(phone.raw, defaultMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-line bg-mist/60 px-3 py-2.5 text-xs font-semibold text-charcoal transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <div className="flex items-center gap-2.5">
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  <span>Ligne {idx + 1}&nbsp;: {phone.display}</span>
                </div>
                <span className="text-emerald-600">→</span>
              </a>
            ))}
          </div>

          <p className="mt-3 text-[0.68rem] text-center text-steel-light">
            Réponse rapide · Atelier Meknès
          </p>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Discuter sur WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/30 transition-all duration-300 hover:scale-105 hover:bg-[#20bd5a] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-300"
      >
        {/* Pulse ripple */}
        <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-emerald-400 opacity-30"></span>

        {/* WhatsApp SVG Icon */}
        <svg
          className="h-7 w-7 fill-current"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>

        {/* Hover Badge */}
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-charcoal px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 hidden sm:block">
          WhatsApp Direct
        </span>
      </button>
    </div>
  );
}
