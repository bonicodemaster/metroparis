"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { stations, stationsById } from "@/lib/data/stations";
import { lines } from "@/lib/data/lines";
import type { Station, LineId } from "@/lib/data/types";
import { project, SVG_VIEWBOX } from "@/lib/map-engine/projection";
import { cn } from "@/lib/utils/cn";

export interface MetroMapProps {
  /** Lignes affichées en évidence ; les autres sont atténuées. */
  highlightedLines?: LineId[];
  /** Stations à masquer/anonymiser (par id). */
  hiddenLabels?: Set<string>;
  /** Stations à mettre en surbrillance (cible quiz). */
  focusStationId?: string | null;
  /** Stations à colorer en vert (validées). */
  correctStationIds?: Set<string>;
  /** Stations à colorer en rouge (échouées). */
  wrongStationIds?: Set<string>;
  /** Affichage des noms : "all" | "none" | "highlighted-only". */
  labels?: "all" | "none" | "highlighted-only";
  /** Callback quand on clique sur une station. */
  onStationClick?: (station: Station) => void;
  /** Callback générique sur la carte (coords SVG). */
  onMapClick?: (svgPoint: { x: number; y: number }) => void;
  /** Désactive le pan/zoom interne (ex. en mode quiz). */
  staticView?: boolean;
  className?: string;
}

export function MetroMap({
  highlightedLines,
  hiddenLabels,
  focusStationId,
  correctStationIds,
  wrongStationIds,
  labels = "all",
  onStationClick,
  onMapClick,
  staticView = false,
  className,
}: MetroMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; vx: number; vy: number } | null>(
    null
  );

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 8;

  /** Zoom centré sur le point (cx, cy) du conteneur (en pixels écran). */
  const zoomAt = useCallback(
    (factor: number, cx?: number, cy?: number) => {
      setView((v) => {
        const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, v.scale * factor));
        const ratio = nextScale / v.scale;
        if (ratio === 1) return v;
        // si pas de point de pivot, on prend le centre du conteneur
        const rect = containerRef.current?.getBoundingClientRect();
        const px = cx ?? (rect ? rect.width / 2 : 0);
        const py = cy ?? (rect ? rect.height / 2 : 0);
        // pivot autour de (px, py) : x' = px - ratio * (px - x)
        return {
          scale: nextScale,
          x: px - ratio * (px - v.x),
          y: py - ratio * (py - v.y),
        };
      });
    },
    []
  );

  const resetView = useCallback(() => setView({ x: 0, y: 0, scale: 1 }), []);

  const projected = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    stations.forEach((st) => map.set(st.id, project(st.lat, st.lon)));
    return map;
  }, []);

  const linePaths = useMemo(() => {
    return lines.map((line) => {
      const mainPoints = line.stations
        .map((sid) => projected.get(sid))
        .filter(Boolean) as { x: number; y: number }[];
      const branches = (line.branches ?? []).map((br) => {
        const start = projected.get(br.from);
        const pts = br.stations
          .map((sid) => projected.get(sid))
          .filter(Boolean) as { x: number; y: number }[];
        return start ? [start, ...pts] : pts;
      });
      return {
        id: line.id,
        color: line.color,
        mainPoints,
        branches,
      };
    });
  }, [projected]);

  const isHighlighted = (lineId: LineId) =>
    !highlightedLines || highlightedLines.length === 0
      ? true
      : highlightedLines.includes(lineId);

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      if (staticView) return;
      const rect = containerRef.current?.getBoundingClientRect();
      const cx = rect ? e.clientX - rect.left : undefined;
      const cy = rect ? e.clientY - rect.top : undefined;
      const factor = 1 + (-e.deltaY * 0.0015);
      zoomAt(factor, cx, cy);
    },
    [staticView, zoomAt]
  );

  // Empêche le scroll de la page quand on zoome sur la carte (en passive: false)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || staticView) return;
    const onWheel = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [staticView]);

  // Raccourcis clavier : + / - / 0
  useEffect(() => {
    if (staticView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "+" || e.key === "=") zoomAt(1.25);
      else if (e.key === "-" || e.key === "_") zoomAt(1 / 1.25);
      else if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [staticView, zoomAt, resetView]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (staticView) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    panStart.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    setIsPanning(true);
  };
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!panStart.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setView((v) => ({ ...v, x: panStart.current!.vx + dx, y: panStart.current!.vy + dy }));
  };
  const handlePointerUp = () => {
    panStart.current = null;
    setIsPanning(false);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClick || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const transformed = pt.matrixTransform(ctm.inverse());
    onMapClick({ x: transformed.x, y: transformed.y });
  };

  return (
    <div ref={containerRef} className={cn("relative w-full h-full", className)}>
      {!staticView && (
        <div className="absolute right-3 bottom-3 z-20 flex flex-col bg-white rounded-xl shadow-soft border border-black/5 overflow-hidden">
          <button
            type="button"
            onClick={() => zoomAt(1.25)}
            className="w-9 h-9 flex items-center justify-center text-ink hover:bg-black/5 text-lg font-bold"
            aria-label="Zoomer"
            title="Zoomer (+)"
          >
            +
          </button>
          <div className="h-px bg-black/5" />
          <button
            type="button"
            onClick={() => zoomAt(1 / 1.25)}
            className="w-9 h-9 flex items-center justify-center text-ink hover:bg-black/5 text-lg font-bold"
            aria-label="Dézoomer"
            title="Dézoomer (−)"
          >
            −
          </button>
          <div className="h-px bg-black/5" />
          <button
            type="button"
            onClick={resetView}
            className="w-9 h-9 flex items-center justify-center text-ink-muted hover:bg-black/5 text-xs font-semibold"
            aria-label="Réinitialiser le zoom"
            title="Réinitialiser (0)"
          >
            ⤾
          </button>
        </div>
      )}
      <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
      className={cn(
        "w-full h-full select-none touch-none bg-cream",
        isPanning ? "cursor-grabbing" : "cursor-grab"
      )}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleSvgClick}
    >
      <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
        {/* Lignes — tracés */}
        {linePaths.map((lp) => {
          const isOn = isHighlighted(lp.id as LineId);
          const toD = (pts: { x: number; y: number }[]) =>
            pts.length
              ? "M " +
                pts.map((p, i) => `${i === 0 ? "" : "L "}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
              : "";
          return (
            <g key={lp.id} className={isOn ? "" : "dimmed"}>
              <path
                d={toD(lp.mainPoints)}
                stroke={lp.color}
                strokeWidth={isOn ? 6 : 4}
                className="line-path"
              />
              {lp.branches.map((br, i) => (
                <path
                  key={i}
                  d={toD(br)}
                  stroke={lp.color}
                  strokeWidth={isOn ? 5 : 3}
                  strokeDasharray="2 6"
                  className="line-path"
                />
              ))}
            </g>
          );
        })}

        {/* Stations — points */}
        {stations.map((st) => {
          const p = projected.get(st.id);
          if (!p) return null;
          const isCorrespondance = st.lines.length > 1;
          const isFocus = focusStationId === st.id;
          const isCorrect = correctStationIds?.has(st.id);
          const isWrong = wrongStationIds?.has(st.id);
          const anyHighlight = highlightedLines && highlightedLines.length > 0;
          const onHighlighted = !anyHighlight || st.lines.some((l) => isHighlighted(l));

          const fill = isCorrect
            ? "#22c55e"
            : isWrong
            ? "#ef4444"
            : isFocus
            ? "#662483"
            : isCorrespondance
            ? "#0B0F1A"
            : "#FFFFFF";
          const stroke = isCorrespondance ? "#0B0F1A" : "#0B0F1A";

          const radius = isFocus ? 8 : isCorrespondance ? 5 : 3.5;

          const showLabel =
            labels === "all"
              ? !hiddenLabels?.has(st.id)
              : labels === "highlighted-only"
              ? onHighlighted && !hiddenLabels?.has(st.id)
              : false;

          return (
            <g key={st.id} className={onHighlighted ? "" : "dimmed"}>
              <motion.circle
                className="station-dot"
                cx={p.x}
                cy={p.y}
                r={radius}
                fill={fill}
                stroke={stroke}
                strokeWidth={1.5}
                initial={false}
                animate={isFocus ? { r: [8, 11, 8] } : { r: radius }}
                transition={isFocus ? { repeat: Infinity, duration: 1.2 } : { duration: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStationClick?.(st);
                }}
              />
              {showLabel && (
                <text
                  x={p.x + 7}
                  y={p.y - 5}
                  fontSize={9}
                  fill="#0B0F1A"
                  className="pointer-events-none font-medium"
                  style={{ paintOrder: "stroke", stroke: "#FAF8F3", strokeWidth: 2 }}
                >
                  {st.name}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
    </div>
  );
}
