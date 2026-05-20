"use client";

import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";
import type { MpEvent } from "./types";

/**
 * Transport temps réel pour le multijoueur.
 *
 * Deux implémentations :
 *  - SupabaseRealtimeTransport : remote, cross-device (par défaut si env configuré)
 *  - BroadcastChannelTransport : local, multi-tabs (fallback uniquement)
 *
 * Tous les clients d'une même room écoutent le même channel et émettent
 * des événements typés `MpEvent` (mode "broadcast" — pas de persistance).
 */
export interface Transport {
  send(event: MpEvent): void;
  subscribe(handler: (e: MpEvent) => void): () => void;
  close(): void;
  readonly kind: "broadcast-channel" | "supabase";
}

/* ─── BroadcastChannel (fallback local, dev sans Supabase) ────────────────── */

class BroadcastChannelTransport implements Transport {
  readonly kind = "broadcast-channel" as const;
  private channel: BroadcastChannel;
  private handlers = new Set<(e: MpEvent) => void>();

  constructor(roomCode: string) {
    this.channel = new BroadcastChannel(`metro-mp:${roomCode}`);
    this.channel.onmessage = (ev) => {
      const data = ev.data as MpEvent;
      this.handlers.forEach((h) => h(data));
    };
  }

  send(event: MpEvent): void {
    this.channel.postMessage(event);
  }

  subscribe(handler: (e: MpEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  close(): void {
    this.handlers.clear();
    this.channel.close();
  }
}

/* ─── Supabase Realtime (cross-device, principal) ─────────────────────────── */

// Singleton client : un seul WebSocket pour toute l'app.
let supabaseSingleton: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (supabaseSingleton) return supabaseSingleton;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase non configuré. Renseigne NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
    );
  }
  supabaseSingleton = createClient(url, key, {
    realtime: { params: { eventsPerSecond: 30 } },
  });
  return supabaseSingleton;
}

class SupabaseRealtimeTransport implements Transport {
  readonly kind = "supabase" as const;
  private channel: RealtimeChannel;
  private handlers = new Set<(e: MpEvent) => void>();
  private ready = false;
  private outbox: MpEvent[] = [];

  constructor(roomCode: string) {
    const supabase = getSupabase();
    this.channel = supabase.channel(`metro-mp:${roomCode}`, {
      config: { broadcast: { self: false, ack: false } },
    });
    this.channel
      .on("broadcast", { event: "mp" }, (payload) => {
        const data = payload.payload as MpEvent;
        this.handlers.forEach((h) => h(data));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          this.ready = true;
          // Flush des messages envoyés avant que le channel ne soit prêt.
          const pending = this.outbox.splice(0);
          for (const ev of pending) {
            this.channel.send({ type: "broadcast", event: "mp", payload: ev });
          }
        }
      });
  }

  send(event: MpEvent): void {
    if (!this.ready) {
      this.outbox.push(event);
      return;
    }
    this.channel.send({ type: "broadcast", event: "mp", payload: event });
  }

  subscribe(handler: (e: MpEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  close(): void {
    this.handlers.clear();
    this.outbox = [];
    this.channel.unsubscribe();
  }
}

/* ─── Factory ─────────────────────────────────────────────────────────────── */

function hasSupabaseEnv(): boolean {
  return (
    typeof process !== "undefined" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function createTransport(roomCode: string): Transport {
  if (hasSupabaseEnv()) {
    return new SupabaseRealtimeTransport(roomCode);
  }
  if (typeof window !== "undefined") {
    console.warn(
      "[multijoueur] Supabase non configuré — fallback BroadcastChannel (même navigateur uniquement)."
    );
  }
  return new BroadcastChannelTransport(roomCode);
}

export function isRemoteMultiplayerAvailable(): boolean {
  return hasSupabaseEnv();
}
