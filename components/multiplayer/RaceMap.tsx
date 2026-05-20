"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { stationsById } from "@/lib/data/stations";
import { linesById } from "@/lib/data/lines";
import type { LineId } from "@/lib/data/types";
import type { PlayerState } from "@/lib/multiplayer/types";
import { project, SVG_VIEWBOX } from "@/lib/map-engine/projection";
import { getOrderedStations } from "@/lib/multiplayer/useRoom";

interface RaceMapProps {
  lineId: LineId;
  players: PlayerState[];
  selfId: string;
  /** En mode line-order, on cache les noms tant que pas trouvé. */
  hideUnknownNames?: boolean;
  /** Ne révèle les noms des stations trouvées que pour soi (autres joueurs : pas de spoil). */
  revealOnlyOwn?: boolean;
}

export function RaceMap({
  lineId,
  players,
  selfId,
  hideUnknownNames = true,
  revealOnlyOwn = true,
}: RaceMapProps) {
  const line = linesById[lineId];
  const ordered = useMemo(() => getOrderedStations(lineId), [lineId]);

  const points = useMemo(
    () => ordered.map((s) => ({ id: s.id, name: s.name, ...project(s.lat, s.lon) })),
    [ordered]
  );

  const self = players.find((p) => p.id === selfId);
  const myFound = new Set(self?.foundStationIds ?? []);

  const pathD =
    "M " + points.map((p, i) => `${i === 0 ? "" : "L "}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  // Position d'un joueur sur la ligne : on snap sur la station correspondant à son index.
  const playerPos = (p: PlayerState) => {
    const idx = Math.min(p.currentStationIndex, points.length - 1);
    const at = points[idx];
    return at ?? points[0];
  };

  if (!line || points.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
      className="w-full h-full bg-cream"
    >
      {/* tracé */}
      <path d={pathD} stroke={line.color} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* stations */}
      {points.map((p) => {
        const found = myFound.has(p.id);
        const showName = !hideUnknownNames || (revealOnlyOwn ? found : false);
        return (
          <g key={p.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={found ? 6 : 4}
              fill={found ? "#22c55e" : "#FFFFFF"}
              stroke="#0B0F1A"
              strokeWidth={1.5}
            />
            {showName && (
              <text
                x={p.x + 8}
                y={p.y - 6}
                fontSize={10}
                fill="#0B0F1A"
                style={{ paintOrder: "stroke", stroke: "#FAF8F3", strokeWidth: 2 }}
                className="font-medium"
              >
                {p.name}
              </text>
            )}
          </g>
        );
      })}

      {/* terminus markers */}
      {[points[0], points[points.length - 1]].map(
        (p, i) =>
          p && (
            <g key={`terminus-${i}`}>
              <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#0B0F1A" strokeWidth={2} />
            </g>
          )
      )}

      {/* trains des joueurs */}
      {players.map((p) => {
        const pos = playerPos(p);
        return (
          <motion.g
            key={p.id}
            initial={false}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            {/* halo */}
            <circle r={14} fill={p.color} opacity={0.18} />
            {/* corps */}
            <circle r={9} fill={p.color} stroke="#FFFFFF" strokeWidth={2} />
            <text
              y={-16}
              fontSize={11}
              textAnchor="middle"
              fill="#0B0F1A"
              style={{ paintOrder: "stroke", stroke: "#FAF8F3", strokeWidth: 3 }}
              className="font-bold"
            >
              {p.id === selfId ? "▶ " : ""}{p.name}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
