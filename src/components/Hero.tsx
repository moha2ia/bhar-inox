"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Hero({
  title,
  subtitle,
  image,
  imageAlt,
}: {
  title: string;
  subtitle: string;
  /** Photographie d'arrière-plan (réalisation réelle) */
  image?: string;
  imageAlt?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);

  return (
    <section
      ref={ref}
      className="on-dark brushed-dark relative flex min-h-[92svh] items-end overflow-hidden"
      aria-label="Introduction"
    >
      {/* Parallax texture */}
      <motion.div
        style={reduce ? undefined : { y: bgY }}
        aria-hidden
        className="pointer-events-none absolute inset-0"
      >
        {image && (
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        {/* Voile sombre pour la lisibilité (plus dense en bas, côté texte) */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/55 to-charcoal/35" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_10%,rgba(23,22,165,0.28),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 5px)",
          }}
        />
        {/* Fine steel lines evoking profiled sections */}
        <div className="absolute -left-24 top-1/3 h-px w-[140%] bg-white/8" />
        <div className="absolute -left-24 top-1/2 h-px w-[140%] bg-white/5" />
        <div className="absolute -left-24 top-2/3 h-px w-[140%] bg-white/8" />
      </motion.div>

      <motion.div
        style={reduce ? undefined : { y: contentY }}
        className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-40 sm:px-8"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow !text-steel-light"
        >
          Menuiserie inox · Sur mesure
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="display mt-4 max-w-4xl text-5xl text-white sm:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link href="/devis" className="btn btn-primary">
            Demander un devis
          </Link>
          <Link href="/realisations" className="btn btn-outline-light">
            Voir nos réalisations
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-black/40"
      />
    </section>
  );
}
