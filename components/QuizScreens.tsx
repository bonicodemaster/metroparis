"use client";

import { motion } from "framer-motion";
import { LineBadge } from "./LineBadge";
import { lines } from "@/lib/data/lines";
import type { LineId } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

export function ConfigScreen({
  title,
  subtitle,
  lineFilter,
  setLineFilter,
  difficulty,
  setDifficulty,
  onStart,
}: {
  title: string;
  subtitle: string;
  lineFilter: LineId[];
  setLineFilter: (v: LineId[]) => void;
  difficulty: "easy" | "medium" | "hard";
  setDifficulty: (d: "easy" | "medium" | "hard") => void;
  onStart: () => void;
}) {
  const toggle = (id: LineId) =>
    setLineFilter(lineFilter.includes(id) ? lineFilter.filter((x) => x !== id) : [...lineFilter, id]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink mb-2">{title}</h1>
      <p className="text-ink-muted mb-8">{subtitle}</p>

      <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft mb-4">
        <h2 className="font-semibold text-ink mb-3">Lignes incluses</h2>
        <p className="text-xs text-ink-muted mb-3">
          Aucune sélection = toutes les lignes.
        </p>
        <div className="flex flex-wrap gap-2">
          {lines.map((l) => {
            const active = lineFilter.includes(l.id as LineId);
            return (
              <button
                key={l.id}
                onClick={() => toggle(l.id as LineId)}
                className={cn(
                  "transition",
                  active ? "ring-2 ring-offset-2 ring-ink rounded-full" : "opacity-60 hover:opacity-100"
                )}
              >
                <LineBadge id={l.id as LineId} size="md" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft mb-6">
        <h2 className="font-semibold text-ink mb-3">Difficulté</h2>
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-semibold transition",
                difficulty === d ? "bg-ink text-cream" : "bg-black/5 text-ink-muted hover:bg-black/10"
              )}
            >
              {d === "easy" ? "Facile" : d === "medium" ? "Moyen" : "Difficile"}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3.5 rounded-xl bg-ratp-14 text-white font-bold text-lg shadow-soft hover:shadow-glow transition"
      >
        Commencer
      </button>
    </div>
  );
}

export function DoneScreen({
  title,
  correct,
  total,
  score,
  bestStreak,
  onRestart,
}: {
  title: string;
  correct: number;
  total: number;
  score: number;
  bestStreak: number;
  onRestart: () => void;
}) {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 border border-black/5 shadow-soft"
      >
        <p className="text-5xl mb-2">{pct >= 80 ? "🏆" : pct >= 50 ? "👏" : "💪"}</p>
        <h1 className="text-2xl font-extrabold text-ink mb-2">{title}</h1>
        <p className="text-ink-muted">
          {correct} / {total} bonnes réponses
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
          <Stat label="Score" value={score} />
          <Stat label="Précision" value={`${pct}%`} />
          <Stat label="Meilleure série" value={bestStreak} />
        </div>

        <button
          onClick={onRestart}
          className="w-full mt-7 py-3 rounded-xl bg-ink text-cream font-bold"
        >
          Rejouer
        </button>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-black/[0.03] rounded-xl p-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="font-bold text-ink text-lg">{value}</p>
    </div>
  );
}
