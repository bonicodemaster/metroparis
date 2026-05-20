"use client";

import { useMemo } from "react";
import { PlayerTrain } from "./PlayerTrain";
import type { PlayerState } from "@/lib/multiplayer/types";

interface RaceTrackProps {
  players: PlayerState[];
  selfId: string;
  totalStations: number;
  lineColor: string;
}

const ROW_H = 56;
const PAD_X = 60; // marge pour les terminus + place du train
const TRACK_W = 800;
const VIEW_W = TRACK_W + PAD_X * 2;

/**
 * Vue "course" condensée : chaque joueur a son rail horizontal,
 * son mini-métro 3D avance de la gauche (départ) vers la droite (terminus)
 * en fonction du nombre de stations validées. Permet de suivre l'avancement
 * sans surcharger la carte géographique.
 */
export function RaceTrack({ players, selfId, totalStations, lineColor }: RaceTrackProps) {
  const stationXs = useMemo(() => {
    if (totalStations <= 1) return [PAD_X + TRACK_W / 2];
    const step = TRACK_W / (totalStations - 1);
    return Array.from({ length: totalStations }, (_, i) => PAD_X + i * step);
  }, [totalStations]);

  const viewH = Math.max(ROW_H, players.length * ROW_H + 12);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-black/5">
        <p className="text-xs uppercase tracking-wider text-ink-muted font-semibold">
          Course
        </p>
        <p className="text-[11px] text-ink-muted">
          Départ <span className="opacity-50">·</span> {totalStations} stations{" "}
          <span className="opacity-50">·</span> Terminus
        </p>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${viewH}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: 220 }}
      >
        {players.map((p, rowIdx) => {
          const y = rowIdx * ROW_H + ROW_H / 2 + 4;
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
                strokeWidth={6}
                strokeLinecap="round"
              />
              {/* Rail rempli (couleur de la ligne) jusqu'à la progression */}
              <line
                x1={PAD_X}
                y1={y}
                x2={progressX}
                y2={y}
                stroke={lineColor}
                strokeWidth={6}
                strokeLinecap="round"
              />

              {/* Marqueurs de stations */}
              {stationXs.map((sx, i) => {
                const done = i < found;
                const isCurrent = i === progressIdx;
                return (
                  <circle
                    key={i}
                    cx={sx}
                    cy={y}
                    r={done ? 4 : isCurrent ? 4.5 : 2.5}
                    fill={done ? "#22c55e" : isCurrent ? "#FFF" : "#FFF"}
                    stroke={done ? "#16a34a" : isCurrent ? "#0B0F1A" : "#9CA3AF"}
                    strokeWidth={done ? 1.2 : isCurrent ? 1.8 : 1}
                  />
                );
              })}

              {/* Terminus (drapeau implicite à droite) */}
              <circle
                cx={PAD_X + TRACK_W}
                cy={y}
                r={9}
                fill="none"
                stroke="#0B0F1A"
                strokeWidth={1.5}
              />

              {/* Nom du joueur, aligné à gauche */}
              <text
                x={PAD_X - 10}
                y={y + 4}
                fontSize={12}
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
                {p.name}
              </text>

              {/* Compteur à droite */}
              <text
                x={PAD_X + TRACK_W + 14}
                y={y + 4}
                fontSize={11}
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
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
