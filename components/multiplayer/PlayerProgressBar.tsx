"use client";

import { motion } from "framer-motion";
import { PlayerAvatar } from "./PlayerAvatar";
import { cn } from "@/lib/utils/cn";

export function PlayerProgressBar({
  name,
  color,
  found,
  total,
  errors,
  isSelf,
  isWinner,
  finishedAt,
}: {
  name: string;
  color: string;
  found: number;
  total: number;
  errors: number;
  isSelf: boolean;
  isWinner?: boolean;
  finishedAt?: number | null;
}) {
  const pct = total > 0 ? Math.min(100, (found / total) * 100) : 0;
  return (
    <div
      className={cn(
        "flex items-center gap-3 bg-white rounded-xl px-3 py-2 border shadow-soft",
        isSelf ? "border-ink/30" : "border-black/5",
        isWinner && "ring-2 ring-yellow-400"
      )}
    >
      <PlayerAvatar name={name} color={color} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-semibold text-ink truncate">
            {name} {isSelf && <span className="text-ink-muted">(toi)</span>}
          </p>
          <p className="text-xs text-ink-muted tabular-nums ml-auto whitespace-nowrap">
            {found} / {total}
            {errors > 0 && <span className="text-red-500 ml-1.5">· {errors} err.</span>}
          </p>
        </div>
        <div className="relative h-2.5 mt-1 bg-black/5 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
          />
          {/* petit "train" qui glisse */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md ring-2 ring-white"
            style={{ backgroundColor: color, left: `calc(${pct}% - 6px)` }}
            initial={false}
            animate={{ left: `calc(${pct}% - 6px)` }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
          />
        </div>
      </div>
      {finishedAt && (
        <span className="text-yellow-500 text-xl" title="Arrivé">
          🏁
        </span>
      )}
    </div>
  );
}
