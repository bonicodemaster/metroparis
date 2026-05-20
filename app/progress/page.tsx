"use client";

import { useMemo } from "react";
import { useProgress } from "@/lib/store/useProgress";
import { stations, stationsById } from "@/lib/data/stations";
import { LineBadge } from "@/components/LineBadge";
import { masteryScore } from "@/lib/spaced-repetition/srs";

export default function ProgressPage() {
  const { cards, stats, reset } = useProgress();

  const data = useMemo(() => {
    const list = stations.map((st) => ({
      st,
      mastery: masteryScore(cards[st.id]),
      card: cards[st.id],
    }));
    const learned = list.filter((d) => d.mastery >= 0.7).length;
    const learning = list.filter((d) => d.mastery > 0 && d.mastery < 0.7).length;
    const unknown = list.filter((d) => d.mastery === 0).length;
    const weakest = [...list]
      .filter((d) => d.card)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 10);
    return { list, learned, learning, unknown, weakest };
  }, [cards]);

  const accuracy = stats.totalAnswered
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-extrabold text-ink mb-6">Ma progression</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Stations maîtrisées" value={data.learned} accent="#22c55e" />
        <Stat label="En cours" value={data.learning} accent="#F28E42" />
        <Stat label="À découvrir" value={data.unknown} />
        <Stat label="Précision globale" value={`${accuracy}%`} accent="#0064B0" />
      </div>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft">
          <h2 className="font-bold text-ink mb-3">À revoir en priorité</h2>
          {data.weakest.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Joue quelques quiz pour voir ici les stations à retravailler.
            </p>
          ) : (
            <ul className="space-y-2">
              {data.weakest.map((d) => (
                <li
                  key={d.st.id}
                  className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-black/[0.03]"
                >
                  <MasteryBar value={d.mastery} />
                  <span className="flex-1 truncate text-sm text-ink">{d.st.name}</span>
                  <div className="flex gap-0.5">
                    {d.st.lines.slice(0, 3).map((l) => (
                      <LineBadge key={l} id={l} size="sm" />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft">
          <h2 className="font-bold text-ink mb-3">Sessions récentes</h2>
          {stats.bySession.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucune session pour l'instant.</p>
          ) : (
            <ul className="divide-y divide-black/5">
              {stats.bySession.slice(0, 10).map((s, i) => (
                <li key={i} className="py-2 flex items-center gap-3 text-sm">
                  <span className="text-ink-muted text-xs w-24">
                    {new Date(s.at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="flex-1 capitalize">{s.mode.replace(/-/g, " ")}</span>
                  <span className="font-semibold">
                    {s.correct} / {s.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="mt-8 text-right">
        <button
          onClick={() => {
            if (confirm("Supprimer toute la progression ?")) reset();
          }}
          className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
        >
          Réinitialiser ma progression
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "#0B0F1A",
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-soft">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="font-extrabold text-2xl mt-1" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}

function MasteryBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.7 ? "#22c55e" : value >= 0.3 ? "#F28E42" : "#ef4444";
  return (
    <div className="w-16 h-1.5 bg-black/5 rounded-full overflow-hidden" aria-label={`Maîtrise : ${pct}%`}>
      <div className="h-full" style={{ width: `${Math.max(6, pct)}%`, backgroundColor: color }} />
    </div>
  );
}
