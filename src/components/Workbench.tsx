"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Établi d'atelier — fond en acier brossé fixe derrière la page d'accueil.
 *
 * Deux reflets (lumière blanche + lueur bleu royal) balaient la tôle au
 * fil du défilement, le grain brossé glisse en léger parallaxe : les
 * panneaux de contenu flottent au-dessus comme des échantillons posés.
 *
 * Couche strictement décorative : aria-hidden, pointer-events-none,
 * et statique si l'utilisateur préfère les animations réduites.
 */
export default function Workbench() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Balayage principal : traverse la page sur toute la hauteur du scroll.
  const sweepX = useTransform(scrollYProgress, [0, 1], ["-50vw", "155vw"]);
  // Reflet secondaire : marche en sens inverse, croise le premier.
  const counterX = useTransform(scrollYProgress, [0, 1], ["150vw", "-50vw"]);
  // Grain : très léger recul pour la profondeur.
  const grainY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);

  const BRUSHED_FINE =
    "repeating-linear-gradient(0deg, rgba(23,25,27,0.055) 0 1px, rgba(23,25,27,0) 1px 3px)";
  const BRUSHED_LIGHT =
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.8) 0 2px, rgba(255,255,255,0) 2px 9px)";
  const BRUSHED_STREAKS =
    "repeating-linear-gradient(0deg, rgba(23,25,27,0.05) 0 1px, rgba(23,25,27,0) 1px 23px)";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Tôle de base */}
      <div className="absolute inset-0 bg-[linear-gradient(178deg,#e9ecee_0%,#f4f6f6_38%,#e7eaeb_100%)]" />

      {/* Grain brossé (léger parallaxe vertical) */}
      <motion.div
        style={reduce ? undefined : { y: grainY }}
        className="absolute inset-x-0 -top-[8%] h-[116%]"
      >
        <div className="absolute inset-0" style={{ backgroundImage: BRUSHED_FINE }} />
        <div className="absolute inset-0 opacity-70" style={{ backgroundImage: BRUSHED_LIGHT }} />
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: BRUSHED_STREAKS }} />
      </motion.div>

      {/* Reflet principal — balayé par le défilement */}
      <motion.div
        style={reduce ? { left: "22%" } : { x: sweepX }}
        className={`absolute -top-[30%] h-[160%] w-[55vw] ${reduce ? "" : "left-0"}`}
      >
        <div
          className="absolute inset-0 rotate-[-18deg] mix-blend-overlay"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.95) 55%, rgba(255,255,255,0) 100%)",
          }}
        />
      </motion.div>

      {/* Reflet secondaire — contre-marche, teinté bleu charte */}
      <motion.div
        style={reduce ? { left: "58%" } : { x: counterX }}
        className={`absolute -top-[25%] h-[150%] w-[38vw] ${reduce ? "" : "left-0"}`}
      >
        <div
          className="absolute inset-0 rotate-[-18deg] mix-blend-overlay"
          style={{
            background:
              "linear-gradient(90deg, rgba(23,22,165,0) 0%, rgba(23,22,165,0.38) 50%, rgba(23,22,165,0) 100%)",
          }}
        />
      </motion.div>

      {/* Vignettage : resserre les bords pour faire ressortir les panneaux */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 38%, rgba(23,25,27,0) 55%, rgba(23,25,27,0.10) 100%)",
        }}
      />
    </div>
  );
}
