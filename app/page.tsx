import { ModeCard } from "@/components/ModeCard";
import { LineBadge } from "@/components/LineBadge";
import { lines } from "@/lib/data/lines";
import { stations } from "@/lib/data/stations";
import type { LineId } from "@/lib/data/types";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <section className="text-center mb-12 animate-fade-in">
        <p className="text-ratp-14 font-semibold text-sm uppercase tracking-wider mb-3">
          Apprends Paris en t'amusant
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink mb-4">
          Maîtrise toutes les stations <br className="hidden sm:block" />
          du métro parisien
        </h1>
        <p className="text-ink-muted max-w-2xl mx-auto">
          Quiz interactifs, carte dynamique, répétition espacée — apprends
          comme avec Anki, joue comme avec GeoGuessr.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {lines.map((l) => (
            <LineBadge key={l.id} id={l.id as LineId} size="sm" />
          ))}
        </div>

        <p className="text-xs text-ink-muted mt-3">
          {lines.length} lignes · {stations.length} stations · {countCorrespondances()} correspondances
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ModeCard
          href="/learn"
          title="Apprendre par ligne"
          description="Explore chaque ligne, ses stations, ses correspondances. Idéal pour découvrir."
          emoji="🗺️"
          accent="#0064B0"
        />
        <ModeCard
          href="/quiz/name-to-position"
          title="Nom → Position"
          description="On t'annonce une station, tu cliques où elle se trouve. Précision + rapidité."
          emoji="🎯"
          accent="#C04191"
        />
        <ModeCard
          href="/quiz/position-to-name"
          title="Position → Nom"
          description="Une station s'allume. À toi de taper son nom (accents et fautes tolérés)."
          emoji="⌨️"
          accent="#00814F"
        />
        <ModeCard
          href="/quiz/survival"
          title="Mode Survie"
          description="Timer, 3 vies, difficulté croissante. Combien tiens-tu ?"
          emoji="🔥"
          accent="#F28E42"
        />
        <ModeCard
          href="/progress"
          title="Ma progression"
          description="Stats détaillées, stations à revoir, score de maîtrise par station."
          emoji="📈"
          accent="#662483"
        />
        <ModeCard
          href="/learn?map=blank"
          title="Carte vierge"
          description="La carte sans aucun nom. Remplis les stations à la main."
          emoji="🌫️"
          accent="#1A2030"
        />
      </section>

      <section className="mt-16 grid sm:grid-cols-3 gap-6 text-sm text-ink-muted">
        <Feature title="Carte interactive" body="Pan, zoom, focus par ligne, surbrillance des correspondances." />
        <Feature title="Répétition espacée" body="Les stations que tu rates reviennent plus souvent. Algorithme SM-2." />
        <Feature title="Hors-ligne" body="Ta progression est stockée localement. Aucun compte requis pour commencer." />
      </section>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft">
      <h4 className="font-bold text-ink mb-1">{title}</h4>
      <p>{body}</p>
    </div>
  );
}

function countCorrespondances(): number {
  return stations.filter((s) => s.lines.length > 1).length;
}
