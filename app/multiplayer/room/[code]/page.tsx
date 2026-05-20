"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useIdentity } from "@/lib/multiplayer/identity";
import { useRoom, getOrderedStations } from "@/lib/multiplayer/useRoom";
import { Lobby } from "@/components/multiplayer/Lobby";
import { RaceMap } from "@/components/multiplayer/RaceMap";
import { RaceTrack } from "@/components/multiplayer/RaceTrack";
import { PlayerProgressBar } from "@/components/multiplayer/PlayerProgressBar";
import { VictoryScreen } from "@/components/multiplayer/VictoryScreen";
import { LineBadge } from "@/components/LineBadge";
import { linesById } from "@/lib/data/lines";
import { cn } from "@/lib/utils/cn";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams<{ code: string }>();
  const sp = useSearchParams();
  const asHost = sp?.get("host") === "1";
  const code = (params?.code ?? "").toUpperCase();

  const { identity } = useIdentity();

  if (!identity) {
    return <div className="max-w-md mx-auto py-16 text-center text-ink-muted">Chargement…</div>;
  }
  if (!code) {
    return <div className="max-w-md mx-auto py-16 text-center text-ink-muted">Code manquant</div>;
  }

  return <RoomContent code={code} identity={identity} asHost={asHost} />;
}

function RoomContent({
  code,
  identity,
  asHost,
}: {
  code: string;
  identity: ReturnType<typeof useIdentity>["identity"] & {};
  asHost: boolean;
}) {
  const router = useRouter();
  const {
    room,
    selfId,
    self,
    isHost,
    setConfig,
    toggleReady,
    startGame,
    resetGame,
    submitAnswer,
  } = useRoom({ code, identity: identity!, asHost });

  const orderedStations = useMemo(
    () => getOrderedStations(room.config.lineId),
    [room.config.lineId]
  );
  const totalStations = orderedStations.length;

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { kind: "ok" | "ko" | "won"; text: string }>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // focus l'input quand on entre en phase playing
  useEffect(() => {
    if (room.phase === "playing") inputRef.current?.focus();
  }, [room.phase]);

  const submit = () => {
    if (!answer.trim()) return;
    const r = submitAnswer(answer);
    setAnswer("");
    if (r.kind === "ok") setFeedback({ kind: "ok", text: `✓ ${r.name}` });
    else if (r.kind === "won") setFeedback({ kind: "won", text: `🏁 ${r.name} — Terminé !` });
    else setFeedback({ kind: "ko", text: r.reason ? `✗ ${r.reason}` : "✗" });
    setTimeout(() => setFeedback(null), 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // On empêche le comportement par défaut (qui blur l'input sur mobile)
      // et on traite la réponse manuellement — l'input garde son focus.
      e.preventDefault();
      submit();
    }
  };

  const playersArray = useMemo(
    () =>
      Object.values(room.players).sort((a, b) => {
        if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
        if (a.finishedAt) return -1;
        if (b.finishedAt) return 1;
        return b.foundStationIds.length - a.foundStationIds.length;
      }),
    [room.players]
  );

  // ─── LOBBY ───
  if (room.phase === "lobby") {
    return (
      <Lobby
        room={room}
        selfId={selfId}
        isHost={isHost}
        onSetConfig={(cfg) => setConfig(cfg)}
        onToggleReady={toggleReady}
        onStart={startGame}
        onLeave={() => router.push("/multiplayer")}
      />
    );
  }

  // ─── COUNTDOWN ───
  if (room.phase === "countdown") {
    return <Countdown endsAt={room.countdownEndsAt ?? Date.now()} />;
  }

  // ─── FINISHED ───
  if (room.phase === "finished") {
    return (
      <VictoryScreen
        room={room}
        selfId={selfId}
        isHost={isHost}
        totalStations={totalStations}
        onPlayAgain={startGame}
        onBackToLobby={resetGame}
      />
    );
  }

  // ─── PLAYING ───
  const target =
    room.config.mode === "line-order" && self
      ? orderedStations[self.currentStationIndex]
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LineBadge id={room.config.lineId} size="md" />
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-muted">
              {room.config.mode === "line-order" ? "Dans l'ordre" : "Ordre libre"}
            </p>
            <p className="text-sm font-bold text-ink">Course en cours</p>
          </div>
        </div>
        <div className="text-xs text-ink-muted">
          {Object.keys(room.players).length} joueur·s
        </div>
      </div>

      {/* Input — sticky en haut pour rester accessible quand on scroll */}
      <div className="sticky top-14 z-20 bg-cream/95 backdrop-blur rounded-2xl shadow-soft border border-black/5 relative">
        {/* Indicateur cible / compteur intégré dans la barre */}
        <div className="px-4 pt-3 pb-1 border-b border-black/5">
          {room.config.mode === "line-order" && target && (
            <p className="text-xs uppercase tracking-wider text-ink-muted text-center">
              Prochaine station ({(self?.currentStationIndex ?? 0) + 1} / {totalStations})
            </p>
          )}
          {room.config.mode === "free-order" && (
            <p className="text-xs uppercase tracking-wider text-ink-muted text-center">
              Stations trouvées : {self?.foundStationIds.length ?? 0} / {totalStations}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 p-2">
          <input
            ref={inputRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              self?.finishedAt
                ? "Tu as terminé ! Bravo 🎉"
                : "Tape une station…"
            }
            className="flex-1 px-3 py-3 bg-transparent text-lg focus:outline-none disabled:opacity-50"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="send"
            disabled={!!self?.finishedAt}
          />
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={cn(
                "absolute left-3 right-3 top-full mt-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-soft pointer-events-none z-10",
                feedback.kind === "ko"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              )}
            >
              {feedback.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Carte avec overlay de course en haut à gauche */}
      <div className="bg-white rounded-2xl shadow-soft border border-black/5 overflow-hidden relative h-[42vh] min-h-[280px]">
        <RaceMap
          lineId={room.config.lineId}
          players={playersArray}
          selfId={selfId}
          hideUnknownNames
        />
        <div className="absolute top-2 left-2 z-10 w-[210px] sm:w-[240px] pointer-events-none">
          <RaceTrack
            players={playersArray}
            selfId={selfId}
            totalStations={totalStations}
            lineColor={linesById[room.config.lineId]?.color ?? "#0B0F1A"}
            compact
          />
        </div>
      </div>

      {/* Bandeau erreurs (compact, une ligne) */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
        {playersArray.map((p) => (
          <span
            key={p.id}
            className={cn(
              "px-2 py-1 rounded-full bg-white border shadow-soft inline-flex items-center gap-1.5",
              p.id === selfId ? "border-ink/30" : "border-black/5"
            )}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="font-semibold text-ink">{p.name}</span>
            {p.errors > 0 && (
              <span className="text-red-500">· {p.errors} err.</span>
            )}
            {p.finishedAt && <span className="text-yellow-500">🏁</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function Countdown({ endsAt }: { endsAt: number }) {
  const [n, setN] = useState(() => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setN(left);
    }, 100);
    return () => clearInterval(id);
  }, [endsAt]);
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        key={n}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.4, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="text-[10rem] font-extrabold text-ink leading-none"
      >
        {n === 0 ? "GO !" : n}
      </motion.div>
    </div>
  );
}
