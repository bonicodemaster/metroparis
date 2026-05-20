"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MetroMap } from "@/components/MetroMap";
import { QuizHUD } from "@/components/QuizHUD";
import type { Station } from "@/lib/data/types";
import { project } from "@/lib/map-engine/projection";
import { pickQuizStations, computeScore, clickTolerancePx } from "@/lib/quiz-engine/engine";
import { useProgress } from "@/lib/store/useProgress";
import { cn } from "@/lib/utils/cn";

const QUESTION_TIME_MS = 8000;
const TIME_DECAY_PER_LEVEL = 400; // chaque 5 bonnes réponses → -400ms

type Phase = "intro" | "playing" | "done";

export default function SurvivalPage() {
  const { cards, answerStation, recordSession } = useProgress();
  const [phase, setPhase] = useState<Phase>("intro");

  const [stationsQueue, setStationsQueue] = useState<Station[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeftMs, setTimeLeftMs] = useState(QUESTION_TIME_MS);
  const [feedback, setFeedback] = useState<null | "ok" | "ko">(null);

  const startedAt = useRef(0);
  const tickRef = useRef<number | null>(null);

  const current = stationsQueue[index];

  const refill = (start: number) => {
    const batch = pickQuizStations(
      { mode: "survival", count: 30, useSrs: true },
      cards
    );
    setStationsQueue((q) => [...q, ...batch]);
  };

  const start = () => {
    const initial = pickQuizStations(
      { mode: "survival", count: 30, useSrs: true },
      cards
    );
    setStationsQueue(initial);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(3);
    setTimeLeftMs(QUESTION_TIME_MS);
    setFeedback(null);
    startedAt.current = performance.now();
    setPhase("playing");
  };

  // ── timer ──
  useEffect(() => {
    if (phase !== "playing" || feedback) return;
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - startedAt.current;
      const totalForThis = currentTimeBudget(streak);
      const left = totalForThis - elapsed;
      setTimeLeftMs(left);
      if (left <= 0) {
        handleAnswer(false, undefined);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, feedback]);

  // ── refill quand on approche du bout ──
  useEffect(() => {
    if (phase === "playing" && index >= stationsQueue.length - 5) {
      refill(performance.now());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase]);

  function currentTimeBudget(s: number): number {
    return Math.max(2500, QUESTION_TIME_MS - Math.floor(s / 5) * TIME_DECAY_PER_LEVEL);
  }

  const handleMapClick = (pt: { x: number; y: number }) => {
    if (phase !== "playing" || !current || feedback) return;
    const target = project(current.lat, current.lon);
    const dist = Math.hypot(pt.x - target.x, pt.y - target.y);
    const tol = clickTolerancePx(streak >= 10 ? "hard" : streak >= 5 ? "medium" : "easy");
    handleAnswer(dist <= tol, dist);
  };

  const handleAnswer = (ok: boolean, dist?: number) => {
    if (!current) return;
    const elapsed = performance.now() - startedAt.current;
    const points = computeScore({ correct: ok, elapsedMs: elapsed, distancePx: dist, streak });

    if (ok) {
      setScore((s) => s + points);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((bs) => Math.max(bs, ns));
        return ns;
      });
      answerStation(current.id, elapsed < 3000 ? 3 : 2);
    } else {
      setStreak(0);
      setLives((l) => l - 1);
      answerStation(current.id, 0);
    }
    setFeedback(ok ? "ok" : "ko");

    setTimeout(() => {
      setFeedback(null);
      const nextLives = ok ? lives : lives - 1;
      if (nextLives <= 0) {
        recordSession("survival", score, index + 1, bestStreak);
        setPhase("done");
        return;
      }
      setIndex((i) => i + 1);
      startedAt.current = performance.now();
    }, 700);
  };

  if (phase === "intro") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-soft">
          <p className="text-5xl mb-2">🔥</p>
          <h1 className="text-2xl font-extrabold text-ink mb-2">Mode Survie</h1>
          <p className="text-ink-muted">
            3 vies, un timer qui s'accélère. Combien tiens-tu ?
          </p>
          <button
            onClick={start}
            className="w-full mt-6 py-3 rounded-xl bg-ratp-5 text-white font-bold"
          >
            Commencer
          </button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 border border-black/5 shadow-soft"
        >
          <p className="text-5xl mb-2">{bestStreak >= 10 ? "🏆" : "💀"}</p>
          <h1 className="text-2xl font-extrabold text-ink mb-2">Game over</h1>
          <p className="text-ink-muted">Tu as tenu {index} questions</p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-black/[0.03] rounded-xl p-3">
              <p className="text-xs text-ink-muted">Score</p>
              <p className="font-bold text-ink text-lg">{score}</p>
            </div>
            <div className="bg-black/[0.03] rounded-xl p-3">
              <p className="text-xs text-ink-muted">Meilleure série</p>
              <p className="font-bold text-ink text-lg">{bestStreak}</p>
            </div>
          </div>
          <button onClick={start} className="w-full mt-7 py-3 rounded-xl bg-ink text-cream font-bold">
            Rejouer
          </button>
        </motion.div>
      </div>
    );
  }

  const budget = currentTimeBudget(streak);
  const timePct = Math.max(0, Math.min(100, (timeLeftMs / budget) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
      <QuizHUD
        score={score}
        streak={streak}
        questionIndex={index}
        lives={lives}
        timeLeftMs={Math.max(0, timeLeftMs)}
      />

      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full",
            timeLeftMs < 2500 ? "bg-red-500" : "bg-ratp-5"
          )}
          style={{ width: `${timePct}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-black/5 overflow-hidden relative flex-1 min-h-[65vh]">
        <div className="absolute top-4 left-4 right-4 z-10 bg-cream/90 backdrop-blur rounded-xl px-4 py-3 shadow-soft text-center">
          <p className="text-xs uppercase tracking-wider text-ink-muted">Trouve</p>
          <h2 className="text-2xl font-extrabold text-ink">{current?.name}</h2>
        </div>
        <MetroMap labels="none" onMapClick={handleMapClick} focusStationId={feedback ? current?.id : null} />

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full font-bold shadow-soft",
                feedback === "ok" ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}
            >
              {feedback === "ok" ? "✓ Bien joué !" : "✗ Raté"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
