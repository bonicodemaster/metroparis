"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MetroMap } from "@/components/MetroMap";
import { LineBadge } from "@/components/LineBadge";
import { lines, linesById } from "@/lib/data/lines";
import { stationsById } from "@/lib/data/stations";
import type { LineId, Station } from "@/lib/data/types";
import { cn } from "@/lib/utils/cn";

export default function LearnPage() {
  const [selectedLines, setSelectedLines] = useState<LineId[]>([]);
  const [focusedStation, setFocusedStation] = useState<Station | null>(null);
  const [labels, setLabels] = useState<"all" | "highlighted-only" | "none">("highlighted-only");

  const toggleLine = (id: LineId) => {
    setSelectedLines((cur) => (cur.includes(id) ? [] : [id]));
  };

  const orderedStations = useMemo(() => {
    if (selectedLines.length !== 1) return null;
    const lid = selectedLines[0];
    const line = linesById[lid];
    if (!line) return null;
    return line.stations.map((sid) => stationsById[sid]).filter(Boolean);
  }, [selectedLines]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6">
      {/* Sidebar lignes */}
      <aside className="lg:w-72 shrink-0">
        <div className="bg-white rounded-2xl p-4 shadow-soft border border-black/5">
          <h2 className="font-bold text-ink mb-3">Lignes</h2>
          <div className="flex flex-wrap gap-2">
            {lines.map((l) => {
              const active = selectedLines.includes(l.id as LineId);
              return (
                <button
                  key={l.id}
                  onClick={() => toggleLine(l.id as LineId)}
                  className={cn(
                    "transition rounded-full",
                    active ? "ring-2 ring-offset-2 ring-ink" : "opacity-80 hover:opacity-100"
                  )}
                  aria-pressed={active}
                  title={l.label}
                >
                  <LineBadge id={l.id as LineId} size="md" />
                </button>
              );
            })}
          </div>
          {selectedLines.length > 0 && (
            <button
              onClick={() => setSelectedLines([])}
              className="text-xs text-ink-muted hover:text-ink mt-3 underline underline-offset-2"
            >
              Tout afficher
            </button>
          )}

          <div className="mt-5 pt-5 border-t border-black/5">
            <h3 className="font-semibold text-sm text-ink mb-2">Affichage des noms</h3>
            <div className="flex gap-1 text-xs">
              {(["all", "highlighted-only", "none"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLabels(opt)}
                  className={cn(
                    "px-2.5 py-1 rounded-full",
                    labels === opt ? "bg-ink text-cream" : "bg-black/5 text-ink-muted"
                  )}
                >
                  {opt === "all" ? "Tous" : opt === "highlighted-only" ? "Sélection" : "Aucun"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des stations de la ligne sélectionnée */}
        {orderedStations && (
          <div className="bg-white rounded-2xl p-4 shadow-soft border border-black/5 mt-4 max-h-[60vh] overflow-auto">
            <h2 className="font-bold text-ink mb-3">
              {linesById[selectedLines[0]].label}
            </h2>
            <ol className="space-y-1">
              {orderedStations.map((st, i) => (
                <li key={st.id}>
                  <button
                    onClick={() => setFocusedStation(st)}
                    className={cn(
                      "w-full text-left text-sm py-1.5 px-2 rounded-md flex items-center gap-2",
                      focusedStation?.id === st.id ? "bg-black/5 text-ink" : "text-ink-muted hover:bg-black/5"
                    )}
                  >
                    <span className="text-xs text-ink-muted w-5">{i + 1}</span>
                    <span className="flex-1 truncate">{st.name}</span>
                    {st.lines.length > 1 && (
                      <span className="flex gap-0.5">
                        {st.lines
                          .filter((l) => l !== selectedLines[0])
                          .slice(0, 3)
                          .map((l) => (
                            <LineBadge key={l} id={l} size="sm" />
                          ))}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </aside>

      {/* Carte */}
      <div className="flex-1 bg-white rounded-2xl shadow-soft border border-black/5 overflow-hidden min-h-[70vh] relative">
        <MetroMap
          highlightedLines={selectedLines}
          focusStationId={focusedStation?.id ?? null}
          labels={labels}
          onStationClick={setFocusedStation}
        />

        <AnimatePresence>
          {focusedStation && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm bg-white border border-black/5 shadow-soft rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-ink">{focusedStation.name}</h3>
                  <p className="text-xs text-ink-muted">
                    {focusedStation.lat.toFixed(4)}, {focusedStation.lon.toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={() => setFocusedStation(null)}
                  className="text-ink-muted hover:text-ink"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {focusedStation.lines.map((l) => (
                  <LineBadge key={l} id={l} size="sm" />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
