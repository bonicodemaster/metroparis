"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";

interface PlayerTrainProps {
  x: number;
  y: number;
  color: string;
  name: string;
  isSelf: boolean;
  finished?: boolean;
  hideLabel?: boolean;
}

/** Renvoie un hex éclairci (+) ou assombri (-) en gardant la teinte. */
function shade(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const adj = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + (percent < 0 ? c : 255 - c) * percent)));
  r = adj(r);
  g = adj(g);
  b = adj(b);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

type TrailSeg = { id: number; x1: number; y1: number; x2: number; y2: number };

/**
 * Petit métro 3D stylisé (semi-cartoon, inspiration Nintendo).
 * - Gradient + gloss pour effet 3D
 * - Outline cartoon noir
 * - Ombre portée au sol
 * - Phare avant
 * - Rotation selon le sens de déplacement
 * - Traînée lumineuse fading derrière
 * - Effet de vitesse (lignes de speed)
 * - Rebond léger à l'arrêt (spring avec overshoot)
 */
export function PlayerTrain({ x, y, color, name, isSelf, finished, hideLabel }: PlayerTrainProps) {
  const mx = useMotionValue(x);
  const my = useMotionValue(y);
  const angle = useMotionValue(0);

  const prevPos = useRef({ x, y });
  const trailIdRef = useRef(0);
  const [trail, setTrail] = useState<TrailSeg[]>([]);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const dx = x - prevPos.current.x;
    const dy = y - prevPos.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.5) {
      const a = (Math.atan2(dy, dx) * 180) / Math.PI;
      animate(angle, a, { type: "spring", stiffness: 220, damping: 18 });
      // Pousse un segment de traînée
      const id = ++trailIdRef.current;
      const seg: TrailSeg = {
        id,
        x1: prevPos.current.x,
        y1: prevPos.current.y,
        x2: x,
        y2: y,
      };
      setTrail((prev) => [...prev.slice(-3), seg]);
      window.setTimeout(() => {
        setTrail((prev) => prev.filter((s) => s.id !== id));
      }, 900);
      setMoving(true);
    }

    const cx = animate(mx, x, {
      type: "spring",
      stiffness: 160,
      damping: 13,
      bounce: 0.45,
    });
    const cy = animate(my, y, {
      type: "spring",
      stiffness: 160,
      damping: 13,
      bounce: 0.45,
    });

    const stopMoving = window.setTimeout(() => setMoving(false), 650);

    prevPos.current = { x, y };
    return () => {
      cx.stop();
      cy.stop();
      window.clearTimeout(stopMoving);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [x, y]);

  const darker = shade(color, -0.32);
  const lighter = shade(color, 0.28);
  const colorKey = color.replace("#", "");
  const gradId = `train-grad-${colorKey}`;
  const glossId = `train-gloss-${colorKey}`;

  return (
    <>
      {/* Defs locales (dédoublonnées implicitement si même couleur) */}
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighter} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={darker} />
        </linearGradient>
        <linearGradient id={glossId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Traînée lumineuse (coords monde, hors transform) */}
      <AnimatePresence>
        {trail.map((s) => (
          <motion.line
            key={s.id}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke={lighter}
            strokeWidth={5}
            strokeLinecap="round"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            style={{ filter: "blur(0.4px)" }}
          />
        ))}
      </AnimatePresence>

      {/* Le train (position animée) */}
      <motion.g style={{ x: mx, y: my }}>
        {/* Ombre au sol (légère, ne tourne pas) */}
        <motion.ellipse
          cx={0}
          cy={9}
          rx={14}
          ry={3}
          fill="#000"
          opacity={0.2}
          animate={moving ? { ry: [3, 2.4, 3] } : { ry: 3 }}
          transition={{ duration: 0.35, repeat: moving ? Infinity : 0 }}
        />

        {/* Corps qui pivote selon le sens + petit dandinement quand ça roule */}
        <motion.g
          style={{ rotate: angle }}
          animate={moving ? { y: [0, -0.8, 0] } : { y: 0 }}
          transition={{ duration: 0.28, repeat: moving ? Infinity : 0 }}
        >
          {/* Lignes de vitesse derrière le train */}
          {moving && (
            <g>
              {[0, 1, 2].map((i) => (
                <motion.line
                  key={i}
                  x1={-14 - i * 3}
                  y1={-3 + i * 3}
                  x2={-24 - i * 5}
                  y2={-3 + i * 3}
                  stroke={lighter}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.85, 0], x: [0, -4, -8] }}
                  transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </g>
          )}

          {/* Outline cartoon */}
          <rect x={-13} y={-7} width={26} height={14} rx={6} ry={6} fill="#0B0F1A" />
          {/* Corps avec dégradé */}
          <rect
            x={-12}
            y={-6}
            width={24}
            height={12}
            rx={5}
            ry={5}
            fill={`url(#${gradId})`}
          />
          {/* Gloss du haut */}
          <rect
            x={-10.5}
            y={-5.5}
            width={21}
            height={5}
            rx={3}
            ry={3}
            fill={`url(#${glossId})`}
          />
          {/* Bandeau sombre du bas pour le contraste 3D */}
          <rect
            x={-12}
            y={4}
            width={24}
            height={2}
            rx={1}
            ry={1}
            fill={darker}
            opacity={0.55}
          />
          {/* Fenêtres */}
          <rect
            x={-7.5}
            y={-3}
            width={4}
            height={4}
            rx={1}
            ry={1}
            fill="#E6F4FF"
            stroke={darker}
            strokeWidth={0.6}
          />
          <rect
            x={-2}
            y={-3}
            width={4}
            height={4}
            rx={1}
            ry={1}
            fill="#E6F4FF"
            stroke={darker}
            strokeWidth={0.6}
          />
          {/* Pare-brise avant (jaune chaud, plus grand) */}
          <rect
            x={3.5}
            y={-3.2}
            width={5}
            height={4.4}
            rx={1.2}
            ry={1.2}
            fill="#FFE9A8"
            stroke={darker}
            strokeWidth={0.6}
          />
          {/* Phare avant qui clignote légèrement quand on roule */}
          <motion.circle
            cx={11.2}
            cy={0}
            r={1.4}
            fill="#FFF6C2"
            stroke="#0B0F1A"
            strokeWidth={0.4}
            animate={moving ? { opacity: [1, 0.6, 1] } : { opacity: 1 }}
            transition={{ duration: 0.4, repeat: moving ? Infinity : 0 }}
          />
          {/* Halo du phare quand on roule */}
          {moving && (
            <motion.circle
              cx={11.2}
              cy={0}
              r={3}
              fill="#FFF6C2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 0.4, repeat: Infinity }}
            />
          )}
        </motion.g>

        {/* Étiquette nom (ne tourne pas) */}
        {!hideLabel && (
          <text
            y={-18}
            fontSize={11}
            textAnchor="middle"
            fill="#0B0F1A"
            style={{ paintOrder: "stroke", stroke: "#FAF8F3", strokeWidth: 3 }}
            className="font-bold"
          >
            {isSelf ? "▶ " : ""}
            {name}
            {finished ? " 🏁" : ""}
          </text>
        )}
      </motion.g>
    </>
  );
}
