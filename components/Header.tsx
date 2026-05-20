"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/learn", label: "Apprendre" },
  { href: "/quiz/name-to-position", label: "Quiz position" },
  { href: "/quiz/position-to-name", label: "Quiz nom" },
  { href: "/quiz/survival", label: "Survie" },
  { href: "/multiplayer", label: "Multijoueur" },
  { href: "/progress", label: "Progression" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink">
          <span className="inline-flex w-7 h-7 rounded-full bg-ratp-14 text-white items-center justify-center text-sm">
            M
          </span>
          <span className="hidden sm:inline">Métro Paris</span>
        </Link>
        <nav className="flex-1 overflow-x-auto">
          <ul className="flex items-center gap-1 text-sm">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3 py-1.5 rounded-full whitespace-nowrap transition",
                      active
                        ? "bg-ink text-cream"
                        : "text-ink-muted hover:bg-black/5 hover:text-ink"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
