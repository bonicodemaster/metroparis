import { cn } from "@/lib/utils/cn";

export function PlayerAvatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  const dims = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold text-white shadow-soft",
        dims[size],
        className
      )}
      style={{ backgroundColor: color }}
      aria-label={name}
    >
      {initial}
    </span>
  );
}
