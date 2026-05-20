"use client";

import { useMemo } from "react";
import { stationsById } from "@/lib/data/stations";
import { lines as allLines, linesById } from "@/lib/data/lines";
import type { LineId } from "@/lib/data/types";
import type { PlayerState } from "@/lib/multiplayer/types";
import { project, SVG_VIEWBOX } from "@/lib/map-engine/projection";
import { getOrderedStations } from "@/lib/multiplayer/useRoom";
import { PlayerTrain } from "./PlayerTrain";

interface RaceMapProps {
  lineId: LineId;
  players: PlayerState[];
  selfId: string;
  /** En mode line-order, on cache les noms tant que pas trouvé. */
  hideUnknownNames?: boolean;
  /** Ne révèle les noms des stations trouvées que pour soi (autres joueurs : pas de spoil). */
  revealOnlyOwn?: boolean;
}

/** Construit le path SVG d'une liste de stations (par id). */
function buildPath(stationIds: string[]): string {
  const pts: { x: number; y: number }[] = [];
  for (const id of stationIds) {
    const s = stationsById[id];
    if (!s) continue;
    pts.push(project(s.lat, s.lon));
  }
  if (pts.length === 0) return "";
  return "M " + pts.map((p, i) => `${i === 0 ? "" : "L "}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
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

  // Tracés en gris pâle pour toutes les AUTRES lignes (contexte géographique).
  const otherLinePaths = useMemo(() => {
    const paths: { id: LineId; d: string; branches: string[] }[] = [];
    for (const l of allLines) {
      if (l.id === lineId) continue;
      const d = buildPath(l.stations);
      const branches = (l.branches ?? []).map((br) => buildPath(br.stations)).filter(Boolean);
      if (d) paths.push({ id: l.id as LineId, d, branches });
    }
    return paths;
  }, [lineId]);

  const self = players.find((p) => p.id === selfId);
  const myFound = new Set(self?.foundStationIds ?? []);

  const pathD = useMemo(
    () =>
      "M " +
      points
        .map((p, i) => `${i === 0 ? "" : "L "}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" "),
    [points]
  );

  // Position d'un joueur : snap sur la station correspondant à son index.
  const playerPos = (p: PlayerState) => {
    const idx = Math.min(p.currentStationIndex, points.length - 1);
    return points[idx] ?? points[0];
  };

  if (!line || points.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
      className="w-full h-full bg-cream"
    >
      {/* ── Repères géographiques ─────────────────────────────────── */}
      <SeineAndPeriph />

      {/* ── Autres lignes (gris pâle, tracés uniquement) ──────────── */}
      <g opacity={0.18}>
        {otherLinePaths.map(({ id, d, branches }) => (
          <g key={id}>
            <path
              d={d}
              stroke="#5B6275"
              strokeWidth={3}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {branches.map((bd, i) => (
              <path
                key={i}
                d={bd}
                stroke="#5B6275"
                strokeWidth={3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        ))}
      </g>

      {/* ── Tracé de la ligne active ──────────────────────────────── */}
      <path
        d={pathD}
        stroke={line.color}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Stations de la ligne active ───────────────────────────── */}
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

      {/* ── Terminus ──────────────────────────────────────────────── */}
      {[points[0], points[points.length - 1]].map(
        (p, i) =>
          p && (
            <g key={`terminus-${i}`}>
              <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#0B0F1A" strokeWidth={2} />
            </g>
          )
      )}

      {/* ── Mini-métros 3D des joueurs ────────────────────────────── */}
      {players.map((p) => {
        const pos = playerPos(p);
        return (
          <PlayerTrain
            key={p.id}
            x={pos.x}
            y={pos.y}
            color={p.color}
            name={p.name}
            isSelf={p.id === selfId}
            finished={!!p.finishedAt}
          />
        );
      })}
    </svg>
  );
}

/* ───────────────────────────────────────────────────────────────── */
/**
 * Seine + Périphérique : repères géographiques très épurés.
 * Coordonnées approximées à partir de quelques points-clés réels,
 * projetées avec le même `project()` que les stations.
 */
function SeineAndPeriph() {
  // Waypoints de la Seine d'est en ouest (lat, lon approximatifs).
  const seinePoints = useMemo(
    () =>
      (
        [
          [48.838, 2.430], // Bercy / sortie est
          [48.840, 2.413],
          [48.847, 2.379], // Île Saint-Louis
          [48.852, 2.349], // Notre-Dame
          [48.857, 2.330], // Pont des Arts
          [48.859, 2.317], // Concorde
          [48.862, 2.302], // Pont de l'Alma
          [48.857, 2.292], // Tour Eiffel
          [48.846, 2.275], // Boulogne / Auteuil
          [48.834, 2.250],
        ] as [number, number][]
      ).map(([lat, lon]) => project(lat, lon)),
    []
  );

  const seineD = useMemo(() => {
    if (seinePoints.length < 2) return "";
    // Courbe lisse via interpolation Catmull-Rom → Bézier cubique
    const pts = seinePoints;
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(
        1
      )}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }, [seinePoints]);

  // Périphérique : ellipse approximative encerclant Paris intra-muros.
  // Centre ≈ Île de la Cité ; bornes nord/sud/est/ouest du périph.
  const periph = useMemo(() => {
    const center = project(48.858, 2.347);
    const north = project(48.901, 2.347);
    const south = project(48.815, 2.347);
    const east = project(48.858, 2.413);
    const west = project(48.858, 2.252);
    const rx = (east.x - west.x) / 2;
    const ry = (south.y - north.y) / 2;
    return { cx: center.x, cy: center.y, rx, ry };
  }, []);

  return (
    <g pointerEvents="none">
      {/* Périph : anneau pâle */}
      <ellipse
        cx={periph.cx}
        cy={periph.cy}
        rx={periph.rx}
        ry={periph.ry}
        fill="none"
        stroke="#9CA3AF"
        strokeWidth={1.5}
        strokeDasharray="6 6"
        opacity={0.35}
      />
      {/* Seine : courbe bleu pâle, plus large pour évoquer le fleuve */}
      <path
        d={seineD}
        fill="none"
        stroke="#60A5FA"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.35}
      />
    </g>
  );
}
