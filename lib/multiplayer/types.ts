import type { LineId } from "../data/types";

export type GameMode = "line-order" | "free-order";
export type Phase = "lobby" | "countdown" | "playing" | "finished";

export interface PlayerState {
  id: string;
  name: string;
  color: string; // hex
  isHost: boolean;
  ready: boolean;
  // game state
  foundStationIds: string[];
  /** Index dans la liste ordonnée de la ligne (mode line-order) */
  currentStationIndex: number;
  errors: number;
  finishedAt: number | null;
  lastSeenAt: number;
}

export interface RoomConfig {
  mode: GameMode;
  lineId: LineId;
}

export interface RoomState {
  code: string;
  hostId: string;
  config: RoomConfig;
  phase: Phase;
  startedAt: number | null;
  countdownEndsAt: number | null;
  winnerId: string | null;
  players: Record<string, PlayerState>;
  createdAt: number;
}

// ─── Événements échangés sur le canal temps réel ────────────────────────────
export type MpEvent =
  | { type: "presence:hello"; player: PlayerState }
  | { type: "presence:bye"; playerId: string }
  | { type: "presence:heartbeat"; player: PlayerState }
  | { type: "snapshot:request"; from: string }
  | { type: "snapshot:response"; to: string; room: RoomState }
  | { type: "room:config"; from: string; config: RoomConfig }
  | { type: "player:ready"; playerId: string; ready: boolean }
  | { type: "player:rename"; playerId: string; name: string }
  | { type: "game:start"; from: string; countdownEndsAt: number }
  | {
      type: "player:answer";
      playerId: string;
      stationId: string;
      newIndex: number; // pour line-order
      errors: number;
      finishedAt?: number | null;
    }
  | { type: "player:error"; playerId: string; errors: number }
  | { type: "game:finish"; winnerId: string }
  | { type: "game:reset"; from: string };
