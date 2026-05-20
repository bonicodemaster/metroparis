"use client";

import { motion } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import type { RoomState } from "@/lib/multiplayer/types";
import { cn } from "@/lib/utils/cn";

export function VictoryScreen({
  room,
  selfId,
  isHost,
  totalStations,
  onPlayAgain,
  onBackToLobby,
}: {
  room: RoomState;
  selfId: string;
  isHost: boolean;
  totalStations: number;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}) {
  const winner = room.winnerId ? room.players[room.winnerId] : null;
  const podium = Object.values(room.players)
    .map((p) => ({
      ...p,
      progress: p.foundStationIds.length,
      done: p.finishedAt != null,
    }))
    .sort((a, b) => {
      if (a.done && b.done) return (a.finishedAt ?? 0) - (b.finishedAt ?? 0);
      if (a.done) return -1;
      if (b.done) return 1;
      return b.progress - a.progress;
    });

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 relative">
      <Confetti />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 border border-black/5 shadow-soft text-center relative z-10"
      >
        <motion.p
          initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="text-6xl mb-2"
        >
          🏆
        </motion.p>
        {winner ? (
          <>
            <h1 className="text-2xl font-extrabold text-ink mb-1">
              {winner.id === selfId ? "Tu as gagné !" : `${winner.name} a gagné !`}
            </h1>
            <p className="text-ink-muted">
              {room.config.mode === "line-order" ? "Toute la ligne dans l'ordre 🎯" : "Toutes les stations trouvées 🎉"}
            </p>
          </>
        ) : (
          <h1 className="text-2xl font-extrabold text-ink mb-1">Partie terminée</h1>
        )}

        <ul className="mt-6 space-y-2 text-left">
          {podium.map((p, i) => (
            <li
              key={p.id}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl border",
                i === 0 ? "border-yellow-300 bg-yellow-50" : "border-black/5 bg-black/[0.02]"
              )}
            >
              <span className="font-bold text-lg w-6 text-center">
                {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
              </span>
              <PlayerAvatar name={p.name} color={p.color} size="sm" />
              <span className="flex-1 font-semibold text-ink truncate">
                {p.name}
                {p.id === selfId && <span className="text-ink-muted"> (toi)</span>}
              </span>
              <span className="text-sm text-ink-muted tabular-nums">
                {p.progress} / {totalStations}
                {p.errors > 0 && <span className="text-red-500 ml-1">· {p.errors} err.</span>}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-7 flex gap-2">
          <button
            onClick={onBackToLobby}
            className="flex-1 py-3 rounded-xl bg-black/5 text-ink font-bold"
          >
            Retour au lobby
          </button>
          {isHost && (
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 rounded-xl bg-ink text-cream font-bold"
            >
              Rejouer
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 30 });
  const colors = ["#FFCD00", "#C04191", "#0064B0", "#22c55e", "#F28E42", "#662483"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.2;
        const dur = 2 + Math.random() * 1.5;
        const color = colors[i % colors.length];
        const rot = Math.random() * 360;
        return (
          <motion.div
            key={i}
            className="absolute top-0 w-2 h-3 rounded-sm"
            style={{ left: `${left}%`, backgroundColor: color }}
            initial={{ y: -20, rotate: 0, opacity: 0 }}
            animate={{ y: "100vh", rotate: rot, opacity: [0, 1, 1, 0] }}
            transition={{ duration: dur, delay, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
