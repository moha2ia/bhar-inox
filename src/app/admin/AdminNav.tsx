"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Vue d'ensemble" },
  { href: "/admin/devis", label: "Demandes de devis" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/parametres", label: "Contenu & paramètres" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation administration" className="p-4">
      <ul className="space-y-1">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block border-l-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-royal bg-white/5 text-white"
                    : "border-transparent text-white/60 hover:border-line-dark hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 border-t border-line-dark pt-4">
        <Link
          href="/"
          className="block px-4 py-2 text-xs text-white/40 hover:text-white/80"
        >
          ← Retour au site
        </Link>
      </div>
    </nav>
  );
}
