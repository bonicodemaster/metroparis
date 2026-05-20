"use client";

import { useMemo } from "react";
import { PlayerTrain } from "./PlayerTrain";
import type { PlayerState } from "@/lib/multiplayer/types";

interface RaceTrackProps {
  players: PlayerState[];
  selfId: string;
  totalStations: number;
  lineColor: string;
  /** Mode compact pour overlay sur la carte. */
  compact?: boolean;
}

/**
 * Vue "course" condensée : chaque joueur a son rail horizontal,
 * son mini-métro 3D avance de la gauche (départ) vers la droite (terminus)
 * en fonction du nombre de stations validées. Permet de suivre l'avancement
 * sans surcharger la carte géographique.
 */
export function RaceTrack({
  players,
  selfId,
  totalStations,
  lineColor,
  compact = false,
}: RaceTrackProps) {
  const ROW_H = compact ? 26 : 56;
  const PAD_X = compact ? 48 : 60;
  const TRACK_W = compact ? 200 : 800;
  const VIEW_W = TRACK_W + PAD_X * 2 + (compact ? 36 : 60);
  const railW = compact ? 4 : 6;
  const stationXs = useMemo(() => {
    if (totalStations <= 1) return [PAD_X + TRACK_W / 2];
    const step = TRACK_W / (totalStations - 1);
    return Array.from({ length: totalStations }, (_, i) => PAD_X + i * step);
  }, [totalStations, PAD_X, TRACK_W]);

  const viewH = Math.max(ROW_H, players.length * ROW_H + (compact ? 8 : 12));

  return (
    <div
      className={
        compact
          ? "bg-cream/95 backdrop-blur rounded-xl shadow-soft border border-black/10 overflow-hidden"
          : "bg-white rounded-2xl shadow-soft border border-black/5 overflow-hidden"
      }
    >
      <div
        className={
          compact
            ? "flex items-center justify-between px-2.5 pt-1.5 pb-1 border-b border-black/5"
            : "flex items-center justify-between px-4 pt-3 pb-2 border-b border-black/5"
        }
      >
        <p className="text-[10px] uppercase tracking-wider text-ink-muted font-semibold">
          Course
        </p>
        {!compact && (
          <p className="text-[11px] text-ink-muted">
            Départ <span className="opacity-50">·</span> {totalStations} stations{" "}
            <span className="opacity-50">·</span> Terminus
          </p>
        )}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${viewH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: compact ? 140 : 220 }}
      >
        {players.map((p, rowIdx) => {
          const y = rowIdx * ROW_H + ROW_H / 2 + (compact ? 2 : 4);
          const found = p.foundStationIds.length;
          const progressIdx = Math.min(
            Math.max(p.currentStationIndex, found),
            Math.max(0, totalStations - 1)
          );
          const trainX = stationXs[progressIdx] ?? stationXs[0];
          const progressX =
            stationXs[Math.min(found, totalStations - 1)] ?? stationXs[0];

          return (
            <g key={p.id}>
              {/* Rail de fond gris pâle */}
              <line
                x1={PAD_X}
                y1={y}
                x2={PAD_X + TRACK_W}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth={railW}
                strokeLinecap="round"
              />
              {/* Rail rempli (couleur de la ligne) jusqu'à la progression */}
              <line
                x1={PAD_X}
                y1={y}
                x2={progressX}
                y2={y}
                stroke={lineColor}
                strokeWidth={railW}
                strokeLinecap="round"
              />

              {/* Marqueurs de stations (cachés en compact si trop nombreux) */}
              {(!compact || totalStations <= 18) &&
                stationXs.map((sx, i) => {
                  const done = i < found;
                  const isCurrent = i === progressIdx;
                  const r = compact
                    ? done
                      ? 2.4
                      : isCurrent
                      ? 2.8
                      : 1.4
                    : done
                    ? 4
                    : isCurrent
                    ? 4.5
                    : 2.5;
                  return (
                    <circle
                      key={i}
                      cx={sx}
                      cy={y}
                      r={r}
                      fill={done ? "#22c55e" : "#FFF"}
                      stroke={done ? "#16a34a" : isCurrent ? "#0B0F1A" : "#9CA3AF"}
                      strokeWidth={done ? 1 : isCurrent ? 1.4 : 0.8}
                    />
                  );
                })}

              {/* Terminus (drapeau implicite à droite) */}
              <circle
                cx={PAD_X + TRACK_W}
                cy={y}
                r={compact ? 5 : 9}
                fill="none"
                stroke="#0B0F1A"
                strokeWidth={1.5}
              />

              {/* Nom du joueur, aligné à gauche */}
              <text
                x={PAD_X - (compact ? 6 : 10)}
                y={y + (compact ? 3 : 4)}
                fontSize={compact ? 9 : 12}
                textAnchor="end"
                fill={p.id === selfId ? "#0B0F1A" : "#475569"}
                style={{
                  paintOrder: "stroke",
                  stroke: "#FFF",
                  strokeWidth: 2,
                }}
                className="font-bold"
              >
                {p.id === selfId ? "▶ " : ""}
                {compact && p.name.length > 8 ? p.name.slice(0, 7) + "…" : p.name}
              </text>

              {/* Compteur à droite */}
              <text
                x={PAD_X + TRACK_W + (compact ? 10 : 14)}
                y={y + (compact ? 3 : 4)}
                fontSize={compact ? 9 : 11}
                fill="#475569"
                className="font-semibold"
              >
                {found}/{totalStations}
                {p.finishedAt ? " 🏁" : ""}
              </text>

              {/* Le train du joueur */}
              <PlayerTrain
                x={trainX}
                y={y}
                color={p.color}
                name=""
                isSelf={p.id === selfId}
                finished={!!p.finishedAt}
                hideLabel
                scale={compact ? 0.55 : 1}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
