"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MetroMap } from "@/components/MetroMap";
import { QuizHUD } from "@/components/QuizHUD";
import { LineBadge } from "@/components/LineBadge";
import { lines } from "@/lib/data/lines";
import type { LineId, Station } from "@/lib/data/types";
import { pickQuizStations, computeScore, clickTolerancePx } from "@/lib/quiz-engine/engine";
import { project } from "@/lib/map-engine/projection";
import { useProgress } from "@/lib/store/useProgress";
import { ConfigScreen, DoneScreen } from "@/components/QuizScreens";
import { cn } from "@/lib/utils/cn";

const TOTAL_QUESTIONS = 10;

type Phase = "config" | "playing" | "done";

export default function NameToPositionPage() {
  const { cards, answerStation, recordSession } = useProgress();
  const [phase, setPhase] = useState<Phase>("config");
  const [lineFilter, setLineFilter] = useState<LineId[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const [questions, setQuestions] = useState<Station[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctSet, setCorrectSet] = useState<Set<string>>(new Set());
  const [wrongSet, setWrongSet] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<null | { kind: "ok" | "ko"; dist: number }>(null);
  const startedAt = useRef<number>(0);

  const current = questions[index];
  const tolerance = clickTolerancePx(difficulty);

  const start = () => {
    const sel = pickQuizStations(
      { mode: "name-to-position", lineFilter, count: TOTAL_QUESTIONS, useSrs: true, difficulty },
      cards
    );
    setQuestions(sel);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectSet(new Set());
    setWrongSet(new Set());
    setFeedback(null);
    startedAt.current = performance.now();
    setPhase("playing");
  };

  const handleMapClick = (pt: { x: number; y: number }) => {
    if (phase !== "playing" || !current || feedback) return;
    const target = project(current.lat, current.lon);
    const dist = Math.hypot(pt.x - target.x, pt.y - target.y);
    const ok = dist <= tolerance;
    const elapsed = performance.now() - startedAt.current;
    const points = computeScore({ correct: ok, elapsedMs: elapsed, distancePx: dist, streak });

    if (ok) {
      setScore((s) => s + points);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((bs) => Math.max(bs, ns));
        return ns;
      });
      setCorrectSet((set) => new Set(set).add(current.id));
      answerStation(current.id, elapsed < 3000 ? 3 : 2);
    } else {
      setStreak(0);
      setWrongSet((set) => new Set(set).add(current.id));
      answerStation(current.id, 0);
    }
    setFeedback({ kind: ok ? "ok" : "ko", dist });

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= questions.length) {
        setPhase("done");
        recordSession(
          "name-to-position",
          correctSet.size + (ok ? 1 : 0),
          questions.length,
          Math.max(bestStreak, ok ? streak + 1 : streak)
        );
      } else {
        setIndex((i) => i + 1);
        startedAt.current = performance.now();
      }
    }, 950);
  };

  // ─── Config ───
  if (phase === "config") {
    return (
      <ConfigScreen
        title="Quiz : Nom → Position"
        subtitle="On t'annonce une station, clique au bon endroit sur la carte."
        lineFilter={lineFilter}
        setLineFilter={setLineFilter}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onStart={start}
      />
    );
  }

  // ─── Done ───
  if (phase === "done") {
    return (
      <DoneScreen
        title="Quiz terminé"
        correct={correctSet.size}
        total={questions.length}
        score={score}
        bestStreak={bestStreak}
        onRestart={start}
      />
    );
  }

  // ─── Playing ───
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <QuizHUD
          score={score}
          streak={streak}
          questionIndex={index}
          total={questions.length}
        />
        <div className="flex items-center gap-2">
          {current?.lines.map((l) => (
            <LineBadge key={l} id={l} size="sm" />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-black/5 overflow-hidden relative flex-1 min-h-[65vh]">
        <div className="absolute top-4 left-4 right-4 z-10 bg-cream/90 backdrop-blur rounded-xl px-4 py-3 shadow-soft text-center">
          <p className="text-xs uppercase tracking-wider text-ink-muted">Où se trouve</p>
          <h2 className="text-2xl font-extrabold text-ink">{current?.name}</h2>
        </div>

        <MetroMap
          highlightedLines={lineFilter.length ? lineFilter : undefined}
          labels="none"
          onMapClick={handleMapClick}
          correctStationIds={correctSet}
          wrongStationIds={wrongSet}
          focusStationId={feedback ? current?.id : null}
        />

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full font-bold shadow-soft",
                feedback.kind === "ok" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}
            >
              {feedback.kind === "ok"
                ? `✓ Bien joué ! ${Math.round(feedback.dist)}px d'écart`
                : `✗ Pas tout à fait — ${Math.round(feedback.dist)}px d'écart`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

