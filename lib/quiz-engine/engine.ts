/**
 * Moteur de quiz modulaire.
 *
 * Un quiz est décrit par une `QuizConfig` : type, lignes incluses,
 * stratégie de sélection (SRS-aware ou aléatoire), nombre de questions,
 * temps imparti, etc. Le moteur produit une suite de `Question`s.
 */

import { stations, stationsOnLine } from "../data/stations";
import { lines as ALL_LINES } from "../data/lines";
import type { Station, LineId } from "../data/types";
import { pickDueCards, type SrsCard } from "../spaced-repetition/srs";

export type QuizMode =
  | "name-to-position"
  | "position-to-name"
  | "ordered-line"
  | "survival";

export interface QuizConfig {
  mode: QuizMode;
  lineFilter?: LineId[]; // si vide => toutes les lignes
  count?: number; // nombre de questions (défaut 10)
  useSrs?: boolean; // sélectionner les stations dues en priorité
  timeLimitMs?: number; // par question (mode survie)
  difficulty?: "easy" | "medium" | "hard";
}

export interface Question {
  index: number;
  station: Station;
  // suivant le mode, on stockera l'attente (position cible, nom à taper, etc.)
}

/** Construit la liste des stations candidates en fonction du filtre. */
export function getCandidateStations(filter?: LineId[]): Station[] {
  if (!filter || filter.length === 0) return stations;
  const ids = new Set<string>();
  filter.forEach((lid) => stationsOnLine(lid).forEach((s) => ids.add(s.id)));
  return stations.filter((s) => ids.has(s.id));
}

/** Pioche `count` stations, avec biais SRS si demandé. */
export function pickQuizStations(
  config: QuizConfig,
  cards: Record<string, SrsCard>,
  now: number = Date.now()
): Station[] {
  const candidates = getCandidateStations(config.lineFilter);
  const count = Math.min(config.count ?? 10, candidates.length);

  if (config.useSrs && Object.keys(cards).length > 0) {
    const dueIds = pickDueCards(
      cards,
      candidates.map((s) => s.id),
      now
    );
    const dueSet = new Set(dueIds);
    const due = candidates.filter((s) => dueSet.has(s.id));
    const rest = shuffle(candidates.filter((s) => !dueSet.has(s.id)));
    const ordered = [...due, ...rest];
    return ordered.slice(0, count);
  }
  return shuffle(candidates).slice(0, count);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Tolérance de clic en pixels SVG selon la difficulté. */
export function clickTolerancePx(difficulty: QuizConfig["difficulty"] = "medium"): number {
  switch (difficulty) {
    case "easy":
      return 28;
    case "hard":
      return 10;
    case "medium":
    default:
      return 18;
  }
}

/** Calcul du score : précision + bonus rapidité + bonus série. */
export function computeScore(params: {
  correct: boolean;
  elapsedMs: number;
  distancePx?: number;
  streak: number;
}): number {
  const { correct, elapsedMs, distancePx, streak } = params;
  if (!correct) return 0;
  const base = 100;
  const speedBonus = Math.max(0, 50 - Math.floor(elapsedMs / 200)); // 0..50
  const precisionBonus = distancePx != null ? Math.max(0, 30 - Math.floor(distancePx)) : 0;
  const streakBonus = Math.min(50, streak * 5);
  return base + speedBonus + precisionBonus + streakBonus;
}

/** Pour les tests / debug. */
export function totalStationCount(): number {
  return stations.length;
}
export function totalLineCount(): number {
  return ALL_LINES.length;
}
