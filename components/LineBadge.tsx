import type { LineId } from "@/lib/data/types";
import { linesById } from "@/lib/data/lines";
import { cn } from "@/lib/utils/cn";

const TEXT_DARK = new Set<LineId>(["1", "3", "3bis", "5", "8", "9", "10", "13"]);

export function LineBadge({
  id,
  size = "md",
  className,
}: {
  id: LineId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const line = linesById[id];
  if (!line) return null;
  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  } as const;
  const textColor = TEXT_DARK.has(id) ? "text-ink" : "text-white";
  const label = id.replace("bis", "b");
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold shadow-soft",
        sizes[size],
        textColor,
        className
      )}
      style={{ backgroundColor: line.color }}
      aria-label={`Ligne ${id}`}
    >
      {label}
    </span>
  );
}
