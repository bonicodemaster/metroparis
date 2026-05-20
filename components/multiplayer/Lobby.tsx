"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { LineBadge } from "@/components/LineBadge";
import { lines } from "@/lib/data/lines";
import type { LineId } from "@/lib/data/types";
import type { RoomState, GameMode } from "@/lib/multiplayer/types";
import { cn } from "@/lib/utils/cn";

interface LobbyProps {
  room: RoomState;
  selfId: string;
  isHost: boolean;
  onSetConfig: (cfg: { mode?: GameMode; lineId?: LineId }) => void;
  onToggleReady: () => void;
  onStart: () => void;
  onLeave: () => void;
}

export function Lobby({ room, selfId, isHost, onSetConfig, onToggleReady, onStart, onLeave }: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const self = room.players[selfId];
  const allReady = Object.values(room.players).every((p) => p.ready);
  const enoughPlayers = Object.keys(room.players).length >= 1;
  const canStart = isHost && allReady && enoughPlayers;

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/multiplayer/room/${room.code}` : "";

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onLeave}
          className="text-sm text-ink-muted hover:text-ink underline underline-offset-2"
        >
          ← Quitter
        </button>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-ink-muted">Code de la room</p>
          <p className="font-mono text-3xl font-bold tracking-widest text-ink">{room.code}</p>
        </div>
      </div>

      <button
        onClick={copyShare}
        className="w-full px-4 py-3 rounded-xl bg-white border border-black/5 shadow-soft text-sm font-semibold text-ink hover:bg-black/5"
      >
        {copied ? "✓ Lien copié !" : "Copier le lien d'invitation"}
      </button>

      {/* Config */}
      <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft">
        <h2 className="font-semibold text-ink mb-3">Configuration</h2>

        <h3 className="text-xs uppercase tracking-wider text-ink-muted mb-2">Mode</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(["line-order", "free-order"] as const).map((m) => (
            <button
              key={m}
              disabled={!isHost}
              onClick={() => onSetConfig({ mode: m })}
              className={cn(
                "text-left p-3 rounded-xl border transition",
                room.config.mode === m
                  ? "bg-ink text-cream border-ink"
                  : "bg-white border-black/10 text-ink",
                !isHost && "opacity-60 cursor-not-allowed"
              )}
            >
              <p className="font-bold text-sm">
                {m === "line-order" ? "Ligne dans l'ordre" : "Ordre libre"}
              </p>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  room.config.mode === m ? "text-cream/80" : "text-ink-muted"
                )}
              >
                {m === "line-order"
                  ? "Départ → terminus, dans l'ordre"
                  : "Toutes les stations, ordre libre"}
              </p>
            </button>
          ))}
        </div>

        <h3 className="text-xs uppercase tracking-wider text-ink-muted mb-2">Ligne</h3>
        <div className="flex flex-wrap gap-2">
          {lines.map((l) => {
            const active = room.config.lineId === l.id;
            return (
              <button
                key={l.id}
                disabled={!isHost}
                onClick={() => onSetConfig({ lineId: l.id as LineId })}
                className={cn(
                  "transition rounded-full",
                  active ? "ring-2 ring-offset-2 ring-ink" : "opacity-70 hover:opacity-100",
                  !isHost && "cursor-not-allowed"
                )}
                title={l.label}
              >
                <LineBadge id={l.id as LineId} size="md" />
              </button>
            );
          })}
        </div>

        {!isHost && (
          <p className="text-xs text-ink-muted mt-3">Seul le host peut modifier les paramètres.</p>
        )}
      </div>

      {/* Joueurs */}
      <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft">
        <h2 className="font-semibold text-ink mb-3">
          Joueurs ({Object.keys(room.players).length})
        </h2>
        <ul className="space-y-2">
          {Object.values(room.players)
            .sort((a, b) => Number(b.isHost) - Number(a.isHost))
            .map((p) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-2 py-1.5"
              >
                <PlayerAvatar name={p.name} color={p.color} size="md" />
                <div className="flex-1">
                  <p className="font-semibold text-ink">
                    {p.name}
                    {p.id === selfId && <span className="text-ink-muted"> (toi)</span>}
                    {p.id === room.hostId && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">
                        HOST
                      </span>
                    )}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs font-bold px-2.5 py-1 rounded-full",
                    p.ready ? "bg-green-100 text-green-700" : "bg-black/5 text-ink-muted"
                  )}
                >
                  {p.ready ? "✓ Prêt" : "En attente"}
                </span>
              </motion.li>
            ))}
        </ul>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggleReady}
          className={cn(
            "flex-1 py-3.5 rounded-xl font-bold shadow-soft transition",
            self?.ready ? "bg-black/10 text-ink" : "bg-green-500 text-white"
          )}
        >
          {self?.ready ? "Annuler" : "Je suis prêt"}
        </button>
        {isHost && (
          <button
            onClick={onStart}
            disabled={!canStart}
            className={cn(
              "flex-1 py-3.5 rounded-xl font-bold shadow-soft transition",
              canStart ? "bg-ratp-14 text-white hover:shadow-glow" : "bg-black/10 text-ink-muted cursor-not-allowed"
            )}
          >
            Lancer la partie
          </button>
        )}
      </div>
    </div>
  );
}
