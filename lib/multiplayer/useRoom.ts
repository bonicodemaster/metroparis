"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type {
  RoomState,
  PlayerState,
  MpEvent,
  RoomConfig,
  Phase,
} from "./types";
import type { LineId } from "../data/types";
import type { Identity } from "./identity";
import { createTransport, type Transport } from "./transport";
import { linesById } from "../data/lines";
import { stationsById } from "../data/stations";
import { isPartialMatch } from "../utils/string";

const HEARTBEAT_MS = 2500;
const PRESENCE_TIMEOUT_MS = 8000;

function initialPlayer(id: Identity, isHost: boolean): PlayerState {
  return {
    id: id.id,
    name: id.name,
    color: id.color,
    isHost,
    ready: isHost,
    foundStationIds: [],
    currentStationIndex: 0,
    errors: 0,
    finishedAt: null,
    lastSeenAt: Date.now(),
  };
}

function initialRoom(code: string, hostId: string): RoomState {
  return {
    code,
    hostId,
    config: { mode: "line-order", lineId: "1" },
    phase: "lobby",
    startedAt: null,
    countdownEndsAt: null,
    winnerId: null,
    players: {},
    createdAt: Date.now(),
  };
}

/** Liste ordonnée (dédupliquée) des stations d'une ligne. */
export function getOrderedStations(lineId: LineId) {
  const line = linesById[lineId];
  if (!line) return [];
  const seen = new Set<string>();
  const ordered: (typeof stationsById)[keyof typeof stationsById][] = [];
  const push = (id: string) => {
    if (!seen.has(id) && stationsById[id]) {
      seen.add(id);
      ordered.push(stationsById[id]);
    }
  };
  line.stations.forEach(push);
  line.branches?.forEach((br) => br.stations.forEach(push));
  return ordered;
}

interface UseRoomOptions {
  code: string;
  identity: Identity;
  asHost: boolean;
}

interface UseRoomReturn {
  room: RoomState;
  selfId: string;
  self: PlayerState | undefined;
  isHost: boolean;
  transportKind: "broadcast-channel" | "supabase";
  // actions
  setConfig: (cfg: Partial<RoomConfig>) => void;
  toggleReady: () => void;
  setName: (name: string) => void;
  startGame: () => void;
  resetGame: () => void;
  submitAnswer: (raw: string) => { kind: "ok" | "ko" | "won"; name?: string; reason?: string };
}

/**
 * Hook principal : gère la room, la connexion temps réel, la présence,
 * la machine à états de partie, la validation des réponses.
 */
export function useRoom({ code, identity, asHost }: UseRoomOptions): UseRoomReturn {
  const [room, setRoom] = useState<RoomState>(() => initialRoom(code, asHost ? identity.id : "?"));
  const transportRef = useRef<Transport | null>(null);

  // Ref pour accéder à l'état courant dans les handlers sans recréer le hook.
  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const send = useCallback((e: MpEvent) => {
    transportRef.current?.send(e);
  }, []);

  // ─── Init transport ───
  useEffect(() => {
    const t = createTransport(code);
    transportRef.current = t;

    const unsub = t.subscribe((event) => {
      setRoom((cur) => reduceEvent(cur, event, identity.id));
    });

    // Auto-injection de soi dans la room
    setRoom((cur) => {
      const me = initialPlayer(identity, asHost);
      const players = { ...cur.players, [identity.id]: me };
      // si on est host, on initialise la room avec nous comme host
      const hostId = asHost ? identity.id : cur.hostId;
      return { ...cur, hostId, players };
    });

    // Annonce notre présence
    t.send({ type: "presence:hello", player: initialPlayer(identity, asHost) });

    // Si on n'est pas host, on demande un snapshot
    if (!asHost) {
      t.send({ type: "snapshot:request", from: identity.id });
    }

    return () => {
      t.send({ type: "presence:bye", playerId: identity.id });
      unsub();
      t.close();
      transportRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // ─── Heartbeat + cleanup des joueurs absents ───
  useEffect(() => {
    const id = setInterval(() => {
      const me = roomRef.current.players[identity.id];
      if (me) {
        send({
          type: "presence:heartbeat",
          player: { ...me, lastSeenAt: Date.now() },
        });
      }

      setRoom((cur) => {
        const now = Date.now();
        let changed = false;
        const players = { ...cur.players };
        for (const [pid, p] of Object.entries(cur.players)) {
          if (pid === identity.id) continue;
          if (now - p.lastSeenAt > PRESENCE_TIMEOUT_MS) {
            delete players[pid];
            changed = true;
          }
        }
        if (!changed) return cur;
        // si on perd le host, le plus ancien restant devient host
        let hostId = cur.hostId;
        if (!players[hostId]) {
          const sorted = Object.values(players).sort((a, b) => a.lastSeenAt - b.lastSeenAt);
          hostId = sorted[0]?.id ?? identity.id;
        }
        return { ...cur, players, hostId };
      });
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [identity.id, send]);

  // ─── Si on est host : répondre aux requêtes de snapshot ───
  useEffect(() => {
    const t = transportRef.current;
    if (!t) return;
    const unsub = t.subscribe((event) => {
      if (event.type === "snapshot:request" && roomRef.current.hostId === identity.id) {
        // Petit délai pour s'assurer que l'état est stable
        setTimeout(() => {
          t.send({ type: "snapshot:response", to: event.from, room: roomRef.current });
        }, 50);
      }
    });
    return unsub;
  }, [identity.id]);

  // ─── Countdown → playing ───
  useEffect(() => {
    if (room.phase !== "countdown" || !room.countdownEndsAt) return;
    const remaining = room.countdownEndsAt - Date.now();
    if (remaining <= 0) {
      setRoom((cur) =>
        cur.phase === "countdown"
          ? { ...cur, phase: "playing", startedAt: Date.now(), countdownEndsAt: null }
          : cur
      );
      return;
    }
    const t = setTimeout(() => {
      setRoom((cur) =>
        cur.phase === "countdown"
          ? { ...cur, phase: "playing", startedAt: Date.now(), countdownEndsAt: null }
          : cur
      );
    }, remaining);
    return () => clearTimeout(t);
  }, [room.phase, room.countdownEndsAt]);

  // ─── Actions ───
  const isHost = room.hostId === identity.id;

  const setConfig = useCallback(
    (cfg: Partial<RoomConfig>) => {
      if (!isHost) return;
      const next = { ...roomRef.current.config, ...cfg };
      setRoom((cur) => ({ ...cur, config: next }));
      send({ type: "room:config", config: next });
    },
    [isHost, send]
  );

  const toggleReady = useCallback(() => {
    const cur = roomRef.current.players[identity.id];
    if (!cur) return;
    const ready = !cur.ready;
    setRoom((r) => ({
      ...r,
      players: { ...r.players, [identity.id]: { ...r.players[identity.id], ready } },
    }));
    send({ type: "player:ready", playerId: identity.id, ready });
  }, [identity.id, send]);

  const setName = useCallback(
    (name: string) => {
      const cleaned = name.trim().slice(0, 24);
      if (!cleaned) return;
      setRoom((r) => ({
        ...r,
        players: { ...r.players, [identity.id]: { ...r.players[identity.id], name: cleaned } },
      }));
      send({ type: "player:rename", playerId: identity.id, name: cleaned });
    },
    [identity.id, send]
  );

  const startGame = useCallback(() => {
    if (!isHost) return;
    const countdownEndsAt = Date.now() + 3500;
    setRoom((cur) => ({
      ...cur,
      phase: "countdown",
      countdownEndsAt,
      winnerId: null,
      startedAt: null,
      // reset des progressions
      players: Object.fromEntries(
        Object.entries(cur.players).map(([pid, p]) => [
          pid,
          { ...p, foundStationIds: [], currentStationIndex: 0, errors: 0, finishedAt: null },
        ])
      ),
    }));
    send({ type: "game:start", countdownEndsAt });
  }, [isHost, send]);

  const resetGame = useCallback(() => {
    if (!isHost) return;
    setRoom((cur) => ({
      ...cur,
      phase: "lobby",
      winnerId: null,
      startedAt: null,
      countdownEndsAt: null,
      players: Object.fromEntries(
        Object.entries(cur.players).map(([pid, p]) => [
          pid,
          { ...p, foundStationIds: [], currentStationIndex: 0, errors: 0, finishedAt: null },
        ])
      ),
    }));
    send({ type: "game:reset" });
  }, [isHost, send]);

  const submitAnswer = useCallback(
    (raw: string): { kind: "ok" | "ko" | "won"; name?: string; reason?: string } => {
      const cur = roomRef.current;
      if (cur.phase !== "playing") return { kind: "ko", reason: "Partie non démarrée" };
      const me = cur.players[identity.id];
      if (!me || me.finishedAt) return { kind: "ko", reason: "Déjà terminé" };
      const value = raw.trim();
      if (!value) return { kind: "ko" };

      const ordered = getOrderedStations(cur.config.lineId);
      const total = ordered.length;

      if (cur.config.mode === "line-order") {
        const target = ordered[me.currentStationIndex];
        if (!target) return { kind: "ko" };
        if (isPartialMatch(value, target.name)) {
          const nextIdx = me.currentStationIndex + 1;
          const finished = nextIdx >= total;
          const newFound = [...me.foundStationIds, target.id];
          const update: PlayerState = {
            ...me,
            foundStationIds: newFound,
            currentStationIndex: nextIdx,
            finishedAt: finished ? Date.now() : null,
          };
          setRoom((r) => {
            const players = { ...r.players, [identity.id]: update };
            // si on vient de finir et qu'il n'y a pas encore de vainqueur, on l'est
            let next = { ...r, players };
            if (finished && !r.winnerId) {
              next = { ...next, winnerId: identity.id, phase: "finished" as Phase };
              send({ type: "game:finish", winnerId: identity.id });
            }
            return next;
          });
          send({
            type: "player:answer",
            playerId: identity.id,
            stationId: target.id,
            newIndex: nextIdx,
            errors: me.errors,
            finishedAt: finished ? Date.now() : null,
          });
          return finished
            ? { kind: "won", name: target.name }
            : { kind: "ok", name: target.name };
        } else {
          const errors = me.errors + 1;
          setRoom((r) => ({
            ...r,
            players: { ...r.players, [identity.id]: { ...me, errors } },
          }));
          send({ type: "player:error", playerId: identity.id, errors });
          return { kind: "ko" };
        }
      } else {
        // free-order : on accepte toute station restante qui matche
        const remaining = ordered.filter((s) => !me.foundStationIds.includes(s.id));
        const matches = remaining.filter((s) => isPartialMatch(value, s.name));
        if (matches.length === 1) {
          const hit = matches[0];
          const newFound = [...me.foundStationIds, hit.id];
          const finished = newFound.length >= total;
          const update: PlayerState = {
            ...me,
            foundStationIds: newFound,
            currentStationIndex: newFound.length,
            finishedAt: finished ? Date.now() : null,
          };
          setRoom((r) => {
            const players = { ...r.players, [identity.id]: update };
            let next = { ...r, players };
            if (finished && !r.winnerId) {
              next = { ...next, winnerId: identity.id, phase: "finished" as Phase };
              send({ type: "game:finish", winnerId: identity.id });
            }
            return next;
          });
          send({
            type: "player:answer",
            playerId: identity.id,
            stationId: hit.id,
            newIndex: newFound.length,
            errors: me.errors,
            finishedAt: finished ? Date.now() : null,
          });
          return finished
            ? { kind: "won", name: hit.name }
            : { kind: "ok", name: hit.name };
        } else if (matches.length > 1) {
          return { kind: "ko", reason: `Ambigu (${matches.length})` };
        } else {
          const already = ordered.find((s) => isPartialMatch(value, s.name));
          const errors = me.errors + 1;
          setRoom((r) => ({
            ...r,
            players: { ...r.players, [identity.id]: { ...me, errors } },
          }));
          send({ type: "player:error", playerId: identity.id, errors });
          return {
            kind: "ko",
            reason: already ? "Déjà trouvée" : "Pas sur cette ligne",
          };
        }
      }
    },
    [identity.id, send]
  );

  return {
    room,
    selfId: identity.id,
    self: room.players[identity.id],
    isHost,
    transportKind: transportRef.current?.kind ?? "broadcast-channel",
    setConfig,
    toggleReady,
    setName,
    startGame,
    resetGame,
    submitAnswer,
  };
}

/* ─── Reducer pur ────────────────────────────────────────────────────────── */

function reduceEvent(state: RoomState, e: MpEvent, selfId: string): RoomState {
  switch (e.type) {
    case "presence:hello": {
      const p = e.player;
      if (p.id === selfId) return state;
      const players = { ...state.players, [p.id]: { ...p, lastSeenAt: Date.now() } };
      return { ...state, players };
    }
    case "presence:bye": {
      const players = { ...state.players };
      delete players[e.playerId];
      // si on perd le host, élire un nouveau host (le plus ancien restant)
      let hostId = state.hostId;
      if (e.playerId === state.hostId) {
        const candidates = Object.values(players).sort((a, b) => a.lastSeenAt - b.lastSeenAt);
        hostId = candidates[0]?.id ?? selfId;
      }
      return { ...state, players, hostId };
    }
    case "presence:heartbeat": {
      const incoming = e.player;
      if (incoming.id === selfId) return state;
      const existing = state.players[incoming.id];
      // Si on ne connaissait pas ce joueur (presence:hello raté à la connexion),
      // on le récupère via le heartbeat. Sinon, on conserve notre vue locale
      // de sa progression (qui peut être plus à jour que l'heartbeat lui-même
      // si on a reçu des player:answer entre-temps), on met juste à jour
      // lastSeenAt et les métadonnées d'identité.
      if (!existing) {
        return {
          ...state,
          players: { ...state.players, [incoming.id]: { ...incoming, lastSeenAt: Date.now() } },
        };
      }
      return {
        ...state,
        players: {
          ...state.players,
          [incoming.id]: {
            ...existing,
            name: incoming.name,
            color: incoming.color,
            isHost: incoming.isHost,
            ready: incoming.ready,
            lastSeenAt: Date.now(),
          },
        },
      };
    }
    case "snapshot:response": {
      // on n'écrase que si c'est pour nous
      if (e.to !== selfId) return state;
      // on garde notre propre état local pour éviter de se retrouver effacé
      const mine = state.players[selfId];
      const merged = { ...e.room.players };
      if (mine) merged[selfId] = mine;
      return { ...e.room, players: merged };
    }
    case "snapshot:request":
      return state;
    case "room:config":
      return { ...state, config: e.config };
    case "player:ready": {
      const p = state.players[e.playerId];
      if (!p) return state;
      return {
        ...state,
        players: { ...state.players, [e.playerId]: { ...p, ready: e.ready } },
      };
    }
    case "player:rename": {
      const p = state.players[e.playerId];
      if (!p) return state;
      return {
        ...state,
        players: { ...state.players, [e.playerId]: { ...p, name: e.name } },
      };
    }
    case "game:start":
      return {
        ...state,
        phase: "countdown",
        countdownEndsAt: e.countdownEndsAt,
        winnerId: null,
        startedAt: null,
        players: Object.fromEntries(
          Object.entries(state.players).map(([pid, p]) => [
            pid,
            { ...p, foundStationIds: [], currentStationIndex: 0, errors: 0, finishedAt: null },
          ])
        ),
      };
    case "player:answer": {
      const p = state.players[e.playerId];
      if (!p) return state;
      // best-effort merge — l'auteur a déjà calculé son nouvel état
      const next: PlayerState = {
        ...p,
        foundStationIds: p.foundStationIds.includes(e.stationId)
          ? p.foundStationIds
          : [...p.foundStationIds, e.stationId],
        currentStationIndex: Math.max(p.currentStationIndex, e.newIndex),
        errors: e.errors,
        finishedAt: e.finishedAt ?? p.finishedAt,
      };
      return { ...state, players: { ...state.players, [e.playerId]: next } };
    }
    case "player:error": {
      const p = state.players[e.playerId];
      if (!p) return state;
      return {
        ...state,
        players: { ...state.players, [e.playerId]: { ...p, errors: e.errors } },
      };
    }
    case "game:finish":
      if (state.winnerId) return state; // déjà décidé
      return { ...state, winnerId: e.winnerId, phase: "finished" };
    case "game:reset":
      return {
        ...state,
        phase: "lobby",
        winnerId: null,
        startedAt: null,
        countdownEndsAt: null,
        players: Object.fromEntries(
          Object.entries(state.players).map(([pid, p]) => [
            pid,
            { ...p, foundStationIds: [], currentStationIndex: 0, errors: 0, finishedAt: null },
          ])
        ),
      };
    default:
      return state;
  }
}
