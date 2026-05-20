"use client";

import type { MpEvent } from "./types";

/**
 * Transport temps réel pour le multijoueur.
 *
 * Abstraction qui permet de swapper entre :
 *  - BroadcastChannelTransport : local (entre onglets du même navigateur)
 *  - SupabaseRealtimeTransport : remote (à activer en V2, voir README)
 *
 * Tous les clients d'une même room écoutent le même channel et émettent
 * des événements typés `MpEvent`.
 */
export interface Transport {
  send(event: MpEvent): void;
  subscribe(handler: (e: MpEvent) => void): () => void;
  close(): void;
  /** Type d'implémentation (debug/UI). */
  readonly kind: "broadcast-channel" | "supabase";
}

/* ─── Implémentation BroadcastChannel (multi-tabs, sans backend) ─────────── */

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

/* ─── Stub Supabase Realtime (V2) ────────────────────────────────────────── */

/**
 * Implémentation à activer en branchant `@supabase/supabase-js`.
 *
 * Étapes pour passer en remote :
 *  1. `npm install @supabase/supabase-js`
 *  2. Créer un projet sur supabase.com
 *  3. Renseigner dans `.env.local` :
 *       NEXT_PUBLIC_SUPABASE_URL=...
 *       NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 *  4. Décommenter le code ci-dessous et recompiler.
 *
 * Le pattern utilise les canaux Realtime de Supabase en mode "broadcast"
 * (sans table) — l'état est partagé via les événements, pas persisté.
 */
/*
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

class SupabaseRealtimeTransport implements Transport {
  readonly kind = "supabase" as const;
  private channel: RealtimeChannel;
  private handlers = new Set<(e: MpEvent) => void>();

  constructor(roomCode: string) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.channel = supabase.channel(`metro-mp:${roomCode}`, {
      config: { broadcast: { self: false } },
    });
    this.channel
      .on("broadcast", { event: "mp" }, (payload) => {
        const data = payload.payload as MpEvent;
        this.handlers.forEach((h) => h(data));
      })
      .subscribe();
  }

  send(event: MpEvent): void {
    this.channel.send({ type: "broadcast", event: "mp", payload: event });
  }

  subscribe(handler: (e: MpEvent) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  close(): void {
    this.handlers.clear();
    this.channel.unsubscribe();
  }
}
*/

/** Factory : choisit le transport selon l'env. */
export function createTransport(roomCode: string): Transport {
  const hasSupabase =
    typeof process !== "undefined" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (hasSupabase) {
    // return new SupabaseRealtimeTransport(roomCode);
    // (laissé en stub — voir bloc commenté plus haut)
  }
  return new BroadcastChannelTransport(roomCode);
}
