"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type SrsCard,
  createCard,
  review,
  masteryScore,
} from "../spaced-repetition/srs";

interface SessionStats {
  totalAnswered: number;
  totalCorrect: number;
  bestStreak: number;
  bySession: Array<{ at: number; mode: string; correct: number; total: number }>;
}

interface ProgressState {
  cards: Record<string, SrsCard>;
  stats: SessionStats;
  // actions
  answerStation: (stationId: string, grade: 0 | 1 | 2 | 3) => void;
  recordSession: (mode: string, correct: number, total: number, bestStreak: number) => void;
  getMastery: (stationId: string) => number;
  reset: () => void;
}

const initialStats: SessionStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  bestStreak: 0,
  bySession: [],
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      cards: {},
      stats: initialStats,
      answerStation: (stationId, grade) =>
        set((state) => {
          const existing = state.cards[stationId] ?? createCard();
          const updated = review(existing, grade);
          return {
            cards: { ...state.cards, [stationId]: updated },
            stats: {
              ...state.stats,
              totalAnswered: state.stats.totalAnswered + 1,
              totalCorrect: state.stats.totalCorrect + (grade > 0 ? 1 : 0),
            },
          };
        }),
      recordSession: (mode, correct, total, bestStreak) =>
        set((state) => ({
          stats: {
            ...state.stats,
            bestStreak: Math.max(state.stats.bestStreak, bestStreak),
            bySession: [
              { at: Date.now(), mode, correct, total },
              ...state.stats.bySession,
            ].slice(0, 50),
          },
        })),
      getMastery: (stationId) => masteryScore(get().cards[stationId]),
      reset: () => set({ cards: {}, stats: initialStats }),
    }),
    {
      name: "metro-paris-progress",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
