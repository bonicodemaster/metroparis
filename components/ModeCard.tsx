"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export function ModeCard({
  href,
  title,
  description,
  emoji,
  accent = "#662483",
  className,
}: {
  href: string;
  title: string;
  description: string;
  emoji: string;
  accent?: string;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={cn("group", className)}
    >
      <Link
        href={href}
        className="block bg-white rounded-2xl p-6 shadow-soft border border-black/5 h-full"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
          aria-hidden
        >
          {emoji}
        </div>
        <h3 className="font-bold text-lg text-ink mb-1">{title}</h3>
        <p className="text-ink-muted text-sm leading-relaxed">{description}</p>
        <div
          className="mt-4 text-sm font-semibold inline-flex items-center gap-1 transition-transform group-hover:translate-x-0.5"
          style={{ color: accent }}
        >
          Commencer →
        </div>
      </Link>
    </motion.div>
  );
}
