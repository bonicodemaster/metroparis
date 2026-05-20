"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useIdentity, generateRoomCode } from "@/lib/multiplayer/identity";
import { PlayerAvatar } from "@/components/multiplayer/PlayerAvatar";
import { cn } from "@/lib/utils/cn";

export default function MultiplayerLandingPage() {
  const router = useRouter();
  const { identity, setName, setColor, COLORS } = useIdentity();
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  if (!identity) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-ink-muted">
        Chargement…
      </div>
    );
  }

  const create = () => {
    const code = generateRoomCode();
    router.push(`/multiplayer/room/${code}?host=1`);
  };

  const join = () => {
    const code = joinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,8}$/.test(code)) {
      setError("Code invalide");
      return;
    }
    router.push(`/multiplayer/room/${code}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-ratp-14 font-semibold text-sm uppercase tracking-wider mb-2">
          Multijoueur
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-2">
          Course de métros entre amis
        </h1>
        <p className="text-ink-muted mb-8">
          Crée une room, partage le code, et défiez-vous sur une ligne complète.
          Tout en local : ouvre 2 onglets pour tester.
        </p>
      </motion.div>

      {/* Identité */}
      <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft mb-6">
        <h2 className="font-semibold text-ink mb-3">Ton avatar</h2>
        <div className="flex items-center gap-4">
          <PlayerAvatar name={identity.name} color={identity.color} size="lg" />
          <input
            value={identity.name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            className="flex-1 px-3 py-2 rounded-xl bg-black/[0.04] focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink/10 font-semibold"
            placeholder="Pseudo"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-6 h-6 rounded-full transition",
                identity.color === c ? "ring-2 ring-offset-2 ring-ink" : "opacity-70 hover:opacity-100"
              )}
              style={{ backgroundColor: c }}
              aria-label={`Couleur ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Créer */}
      <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft mb-4">
        <h2 className="font-semibold text-ink mb-3">Créer une room</h2>
        <p className="text-sm text-ink-muted mb-4">
          Tu seras le host. Partage ensuite le code aux autres joueurs.
        </p>
        <button
          onClick={create}
          className="w-full py-3 rounded-xl bg-ratp-14 text-white font-bold shadow-soft hover:shadow-glow transition"
        >
          Créer une partie
        </button>
      </div>

      {/* Rejoindre */}
      <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-soft">
        <h2 className="font-semibold text-ink mb-3">Rejoindre avec un code</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            join();
          }}
          className="flex gap-2"
        >
          <input
            value={joinCode}
            onChange={(e) => {
              setJoinCode(e.target.value.toUpperCase());
              setError("");
            }}
            placeholder="ABCD12"
            maxLength={8}
            className="flex-1 px-4 py-3 rounded-xl bg-black/[0.04] focus:bg-white focus:outline-none focus:ring-2 focus:ring-ink/10 font-mono tracking-widest text-center text-lg uppercase"
            autoComplete="off"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-ink text-cream font-bold"
          >
            Rejoindre
          </button>
        </form>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      <div className="mt-8 text-xs text-ink-muted bg-black/[0.03] rounded-xl p-4 leading-relaxed">
        <p className="font-semibold text-ink mb-1">Mode local (par défaut)</p>
        <p>
          Le multijoueur utilise actuellement <code>BroadcastChannel</code> : les
          joueurs doivent être sur le même navigateur (onglets multiples ou
          fenêtres séparées). Pour jouer entre appareils différents, configure
          Supabase Realtime — voir <code>README.md</code>.
        </p>
      </div>
    </div>
  );
}
