"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/brand";

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const onDarkHero = pathname === "/";
  const transparent = onDarkHero && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          transparent
            ? "bg-gradient-to-b from-black/80 via-black/50 to-transparent"
            : "border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            aria-label="BHAR INOX — Accueil"
            className="flex items-center"
          >
            <Image
              src="/brand/logo-2x.png"
              alt="BHAR INOX — LA MENUISERIE"
              width={181}
              height={71}
              priority
              className="h-12 w-auto sm:h-14"
            />
          </Link>

          <nav aria-label="Navigation principale" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`text-[0.86rem] font-semibold tracking-wide transition-colors ${
                      transparent
                        ? isActive(link.href)
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                        : isActive(link.href)
                          ? "text-royal"
                          : "text-charcoal/80 hover:text-royal"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block">
            <Link href="/devis" className="btn btn-primary !px-6 !py-3 text-sm">
              Demander un devis
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className={`flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden ${
              transparent ? "text-white" : "text-charcoal"
            }`}
          >
            <span
              className={`h-0.5 w-6 bg-current transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-current transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`h-0.5 w-6 bg-current transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </header>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto border-t border-line bg-white md:hidden"
        >
          <nav aria-label="Navigation mobile" className="px-6 py-8">
            <ul className="space-y-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`block border-b border-line py-4 text-lg font-semibold ${
                      isActive(link.href) ? "text-royal" : "text-charcoal"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/devis"
              className="btn btn-primary mt-8 w-full justify-center"
            >
              Demander un devis
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
