"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MetroMap } from "@/components/MetroMap";
import { LineBadge } from "@/components/LineBadge";
import { lines, linesById } from "@/lib/data/lines";
import { stationsById } from "@/lib/data/stations";
import type { LineId, Station } from "@/lib/data/types";
import { isPartialMatch } from "@/lib/utils/string";
import { useProgress } from "@/lib/store/useProgress";
import { computeScore } from "@/lib/quiz-engine/engine";
import { cn } from "@/lib/utils/cn";

type Phase = "config" | "playing" | "done";
type FillMode = "ordered" | "free";

export default function PositionToNamePage() {
  const { answerStation, recordSession } = useProgress();
  const [phase, setPhase] = useState<Phase>("config");
  const [selectedLine, setSelectedLine] = useState<LineId | null>(null);
  const [fillMode, setFillMode] = useState<FillMode>("ordered");

  const [foundIds, setFoundIds] = useState<Set<string>>(new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set()); // affichées via "passer"
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | {
    kind: "ok" | "ko" | "found";
    text: string;
  }>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const startedAt = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Liste ordonnée des stations de la ligne sélectionnée
  const lineStations: Station[] = useMemo(() => {
    if (!selectedLine) return [];
    const line = linesById[selectedLine];
    if (!line) return [];
    const ids = new Set<string>();
    const ordered: Station[] = [];
    const pushIfNew = (id: string) => {
      if (!ids.has(id) && stationsById[id]) {
        ids.add(id);
        ordered.push(stationsById[id]);
      }
    };
    line.stations.forEach(pushIfNew);
    line.branches?.forEach((br) => br.stations.forEach(pushIfNew));
    return ordered;
  }, [selectedLine]);

  // Station courante en mode ordonné = première non trouvée et non révélée
  const currentStation: Station | null = useMemo(() => {
    if (fillMode !== "ordered") return null;
    return (
      lineStations.find((s) => !foundIds.has(s.id) && !revealedIds.has(s.id)) ??
      null
    );
  }, [fillMode, lineStations, foundIds, revealedIds]);

  const totalCount = lineStations.length;
  const foundCount = foundIds.size;
  const remainingStations = useMemo(
    () => lineStations.filter((s) => !foundIds.has(s.id) && !revealedIds.has(s.id)),
    [lineStations, foundIds, revealedIds]
  );

  const start = () => {
    if (!selectedLine) return;
    setFoundIds(new Set());
    setRevealedIds(new Set());
    setAnswer("");
    setFeedback(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setWrongAttempts(0);
    startedAt.current = performance.now();
    setPhase("playing");
  };

  useEffect(() => {
    if (phase === "playing") inputRef.current?.focus();
  }, [phase, foundIds.size, revealedIds.size]);

  // Auto-fin quand toutes les stations sont trouvées ou révélées
  useEffect(() => {
    if (phase !== "playing") return;
    if (foundCount + revealedIds.size >= totalCount && totalCount > 0) {
      recordSession(
        `position-to-name:${selectedLine}:${fillMode}`,
        foundCount,
        totalCount,
        bestStreak
      );
      setPhase("done");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundCount, revealedIds.size, totalCount, phase]);

  const submit = (raw?: string) => {
    if (phase !== "playing" || feedback) return;
    const value = (raw ?? answer).trim();
    if (!value) return;

    const elapsed = performance.now() - startedAt.current;

    if (fillMode === "ordered") {
      if (!currentStation) return;
      const ok = isPartialMatch(value, currentStation.name);
      if (ok) {
        const pts = computeScore({ correct: true, elapsedMs: elapsed, streak });
        setScore((s) => s + pts);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((bs) => Math.max(bs, ns));
          return ns;
        });
        setFoundIds((prev) => new Set(prev).add(currentStation.id));
        answerStation(currentStation.id, elapsed < 4000 ? 3 : 2);
        setFeedback({ kind: "ok", text: `✓ ${currentStation.name}` });
      } else {
        setStreak(0);
        setWrongAttempts((n) => n + 1);
        answerStation(currentStation.id, 0);
        setFeedback({ kind: "ko", text: `✗ Ce n'est pas ça…` });
      }
    } else {
      // mode libre : on cherche n'importe quelle station restante
      const matches = remainingStations.filter((s) => isPartialMatch(value, s.name));
      if (matches.length === 1) {
        const hit = matches[0];
        const pts = computeScore({ correct: true, elapsedMs: elapsed, streak });
        setScore((s) => s + pts);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((bs) => Math.max(bs, ns));
          return ns;
        });
        setFoundIds((prev) => new Set(prev).add(hit.id));
        answerStation(hit.id, elapsed < 4000 ? 3 : 2);
        startedAt.current = performance.now();
        setFeedback({ kind: "found", text: `✓ ${hit.name}` });
      } else if (matches.length > 1) {
        // Ambiguïté : plusieurs stations restantes correspondent
        setStreak(0);
        setWrongAttempts((n) => n + 1);
        setFeedback({
          kind: "ko",
          text: `Ambigu (${matches.length} possibles), sois plus précis`,
        });
      } else {
        // déjà trouvée ?
        const already = lineStations.find((s) => isPartialMatch(value, s.name));
        setStreak(0);
        setWrongAttempts((n) => n + 1);
        setFeedback({
          kind: "ko",
          text: already ? "Déjà trouvée !" : "Pas sur cette ligne",
        });
      }
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswer("");
      if (fillMode === "ordered") {
        startedAt.current = performance.now();
      }
    }, 800);
  };

  const skipCurrent = () => {
    if (fillMode !== "ordered" || !currentStation) return;
    setRevealedIds((prev) => new Set(prev).add(currentStation.id));
    setStreak(0);
    setFeedback({ kind: "ko", text: `→ ${currentStation.name}` });
    setTimeout(() => {
      setFeedback(null);
      setAnswer("");
      startedAt.current = performance.now();
    }, 1000);
  };

  const revealAll = () => {
    if (!confirm("Afficher toutes les stations restantes et terminer la session ?")) return;
    setRevealedIds((prev) => {
      const next = new Set(prev);
      remainingStations.forEach((s) => next.add(s.id));
      return next;
    });
  };

  // ─── Config ───
  if (phase === "config") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold text-ink mb-2">
          Quiz : Nom des stations
        </h1>
        <p className="text-ink-muted mb-8">
          Choisis une ligne et remplis toutes ses stations. En mode <b>Ordre</b>,
          du départ jusqu'au terminus, une à la fois. En mode <b>Libre</b>, dans
          n'importe quel ordre.
        </p>

        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft mb-4">
          <h2 className="font-semibold text-ink mb-3">Ligne</h2>
          <div className="flex flex-wrap gap-2">
            {lines.map((l) => {
              const active = selectedLine === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setSelectedLine(l.id as LineId)}
                  className={cn(
                    "transition rounded-full",
                    active
                      ? "ring-2 ring-offset-2 ring-ink"
                      : "opacity-70 hover:opacity-100"
                  )}
                  aria-pressed={active}
                  title={l.label}
                >
                  <LineBadge id={l.id as LineId} size="md" />
                </button>
              );
            })}
          </div>
          {selectedLine && (
            <p className="text-xs text-ink-muted mt-3">
              {linesById[selectedLine].label} ·{" "}
              {linesById[selectedLine].stations.length} stations
              {linesById[selectedLine].branches?.length
                ? " (+ branche)"
                : ""}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft mb-6">
          <h2 className="font-semibold text-ink mb-3">Mode de saisie</h2>
          <div className="grid grid-cols-2 gap-2">
            <ModePill
              active={fillMode === "ordered"}
              onClick={() => setFillMode("ordered")}
              title="Dans l'ordre"
              subtitle="Du départ au terminus, une station à la fois"
            />
            <ModePill
              active={fillMode === "free"}
              onClick={() => setFillMode("free")}
              title="Ordre libre"
              subtitle="Tape les stations dans n'importe quel ordre"
            />
          </div>
        </div>

        <button
          onClick={start}
          disabled={!selectedLine}
          className={cn(
            "w-full py-3.5 rounded-xl font-bold text-lg shadow-soft transition",
            selectedLine
              ? "bg-ratp-14 text-white hover:shadow-glow"
              : "bg-black/10 text-ink-muted cursor-not-allowed"
          )}
        >
          Commencer
        </button>
      </div>
    );
  }

  // ─── Done ───
  if (phase === "done") {
    const success = revealedIds.size === 0;
    const pct = totalCount ? Math.round((foundCount / totalCount) * 100) : 0;
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 border border-black/5 shadow-soft"
        >
          <p className="text-5xl mb-2">
            {success ? "🏆" : pct >= 80 ? "👏" : "💪"}
          </p>
          <h1 className="text-2xl font-extrabold text-ink mb-2">
            {success ? "Ligne complétée !" : "Session terminée"}
          </h1>
          <p className="text-ink-muted">
            {foundCount} / {totalCount} stations trouvées
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <Stat label="Score" value={score} />
            <Stat label="Précision" value={`${pct}%`} />
            <Stat label="Meilleure série" value={bestStreak} />
          </div>
          <div className="mt-7 flex gap-2">
            <button
              onClick={() => setPhase("config")}
              className="flex-1 py-3 rounded-xl bg-black/5 text-ink font-bold"
            >
              Changer de ligne
            </button>
            <button
              onClick={start}
              className="flex-1 py-3 rounded-xl bg-ink text-cream font-bold"
            >
              Rejouer
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Playing ───
  const wrongSetForMap = revealedIds; // affichés rouge sur la carte

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {selectedLine && <LineBadge id={selectedLine} size="md" />}
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted">
              {fillMode === "ordered" ? "Dans l'ordre" : "Ordre libre"}
            </p>
            <p className="text-lg font-bold text-ink leading-tight">
              {foundCount} / {totalCount} stations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Pill label="Score" value={score} />
          <Pill label="Série" value={streak} />
          <Pill label="Erreurs" value={wrongAttempts} accent={wrongAttempts > 0 ? "#ef4444" : undefined} />
          <button
            onClick={() => setPhase("config")}
            className="ml-2 text-xs text-ink-muted hover:text-ink underline underline-offset-2"
          >
            Changer
          </button>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-green-500"
          style={{ width: `${totalCount ? (foundCount / totalCount) * 100 : 0}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-black/5 overflow-hidden relative flex-1 min-h-[55vh]">
        {/* Bandeau du haut (mode ordonné) */}
        {fillMode === "ordered" && currentStation && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-cream/90 backdrop-blur rounded-xl px-4 py-3 shadow-soft text-center">
            <p className="text-xs uppercase tracking-wider text-ink-muted">
              Station n°{lineStations.indexOf(currentStation) + 1}
            </p>
            <p className="text-sm text-ink-muted">
              Quel est le nom de la station en surbrillance ?
            </p>
          </div>
        )}

        <MetroMap
          highlightedLines={selectedLine ? [selectedLine] : undefined}
          labels="none"
          focusStationId={fillMode === "ordered" ? currentStation?.id ?? null : null}
          correctStationIds={foundIds}
          wrongStationIds={wrongSetForMap}
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="bg-white rounded-2xl shadow-soft border border-black/5 relative"
      >
        <div className="flex items-center gap-2 p-2">
          <input
            ref={inputRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={
              fillMode === "ordered"
                ? "Tape le nom de cette station…"
                : `Une station de la ligne ${selectedLine}…`
            }
            className="flex-1 px-3 py-3 bg-transparent text-lg focus:outline-none"
            autoComplete="off"
            spellCheck={false}
            disabled={!!feedback}
          />
          {fillMode === "ordered" ? (
            <button
              type="button"
              onClick={skipCurrent}
              className="px-3 py-2 text-sm text-ink-muted hover:text-ink rounded-lg hover:bg-black/5"
              title="Afficher la réponse et passer"
            >
              Passer
            </button>
          ) : (
            <button
              type="button"
              onClick={revealAll}
              className="px-3 py-2 text-sm text-ink-muted hover:text-ink rounded-lg hover:bg-black/5"
              title="Afficher toutes les stations restantes"
            >
              Abandonner
            </button>
          )}
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "mx-3 mb-3 px-4 py-2 rounded-xl text-sm font-semibold",
                feedback.kind === "ok" || feedback.kind === "found"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <StationsTable
        stations={lineStations}
        foundIds={foundIds}
        revealedIds={revealedIds}
        currentId={currentStation?.id ?? null}
      />
    </div>
  );
}

// Tableau récapitulatif des stations de la ligne (sous la carte)
function StationsTable({
  stations,
  foundIds,
  revealedIds,
  currentId,
}: {
  stations: Station[];
  foundIds: Set<string>;
  revealedIds: Set<string>;
  currentId: string | null;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-black/5 p-3">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="font-semibold text-ink text-sm">Stations de la ligne</h3>
        <span className="text-xs text-ink-muted">
          {foundIds.size} trouvées · {revealedIds.size} révélées · {stations.length} au total
        </span>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3">
        {stations.map((st, i) => {
          const found = foundIds.has(st.id);
          const revealed = revealedIds.has(st.id);
          const isCurrent = currentId === st.id;
          return (
            <li
              key={st.id}
              className={cn(
                "text-sm py-1 px-2 rounded flex items-center gap-2 leading-tight",
                isCurrent && "bg-ratp-14/10 ring-1 ring-ratp-14/30"
              )}
            >
              <span className="text-xs text-ink-muted w-6 shrink-0 tabular-nums">
                {i + 1}.
              </span>
              {found ? (
                <span className="flex-1 text-green-700 font-medium truncate">
                  <span aria-hidden>✓ </span>
                  {st.name}
                </span>
              ) : revealed ? (
                <span className="flex-1 text-red-700 italic truncate">
                  {st.name}
                </span>
              ) : (
                <span
                  className={cn(
                    "flex-1 truncate",
                    isCurrent ? "text-ratp-14 font-semibold" : "text-ink-muted/50"
                  )}
                >
                  {isCurrent ? "← à trouver" : "▁▁▁▁▁▁▁▁"}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Sous-composants locaux
// ──────────────────────────────────────────────────────────────────────────────

function ModePill({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left p-4 rounded-xl border transition",
        active
          ? "border-ink bg-ink text-cream shadow-soft"
          : "border-black/10 bg-white hover:border-black/30"
      )}
    >
      <p className="font-bold">{title}</p>
      <p className={cn("text-xs mt-1", active ? "text-cream/80" : "text-ink-muted")}>
        {subtitle}
      </p>
    </button>
  );
}

function Pill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="px-3 py-1.5 bg-white rounded-full border border-black/5 shadow-soft text-xs">
      <span className="text-ink-muted mr-1.5">{label}</span>
      <span className="font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
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
