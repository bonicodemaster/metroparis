"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export function QuizHUD({
  score,
  streak,
  questionIndex,
  total,
  lives,
  timeLeftMs,
  className,
}: {
  score: number;
  streak: number;
  questionIndex: number;
  total?: number;
  lives?: number;
  timeLeftMs?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-sm text-ink",
        className
      )}
    >
      <Stat label="Score" value={score} />
      <Stat label="Série" value={streak} accent={streak >= 5 ? "#22c55e" : undefined} />
      <Stat
        label="Question"
        value={total ? `${questionIndex + 1} / ${total}` : `${questionIndex + 1}`}
      />
      {typeof lives === "number" && (
        <Stat label="Vies" value={"♥".repeat(Math.max(0, lives))} accent="#ef4444" />
      )}
      {typeof timeLeftMs === "number" && (
        <Stat
          label="Temps"
          value={`${Math.ceil(timeLeftMs / 1000)}s`}
          accent={timeLeftMs < 5000 ? "#ef4444" : undefined}
        />
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-3 py-1.5 bg-white rounded-full border border-black/5 shadow-soft"
    >
      <span className="text-ink-muted mr-2">{label}</span>
      <span className="font-bold" style={accent ? { color: accent } : undefined}>
        {value}
      </span>
    </motion.div>
  );
}
