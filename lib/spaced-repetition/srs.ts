/**
 * Algorithme de répétition espacée — variante simplifiée de SM-2.
 *
 * Pour chaque station, on garde un `card` :
 *  - ease (facteur de facilité, démarre à 2.5)
 *  - intervalDays (intervalle de révision en jours)
 *  - reps (nombre de réussites consécutives)
 *  - dueAt (timestamp ms — quand la station doit être revue)
 *  - history (5 dernières réponses, pour calcul du taux de réussite récent)
 *
 * Grade : 0 = échec, 1 = hésité, 2 = correct, 3 = parfait/rapide.
 */

export interface SrsCard {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
  dueAt: number; // ms epoch
  lastReviewedAt: number | null;
  history: (0 | 1 | 2 | 3)[]; // dernières réponses (cap 10)
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function createCard(now: number = Date.now()): SrsCard {
  return {
    ease: 2.5,
    intervalDays: 0,
    reps: 0,
    lapses: 0,
    dueAt: now,
    lastReviewedAt: null,
    history: [],
  };
}

/** Met à jour une carte après une révision. Retourne une nouvelle carte (immutable). */
export function review(card: SrsCard, grade: 0 | 1 | 2 | 3, now: number = Date.now()): SrsCard {
  const history = [...card.history, grade].slice(-10);

  if (grade === 0) {
    // échec : on reset l'intervalle et on baisse l'ease
    return {
      ...card,
      ease: Math.max(1.3, card.ease - 0.2),
      intervalDays: 0,
      reps: 0,
      lapses: card.lapses + 1,
      dueAt: now + 10 * 60 * 1000, // revoir dans 10 minutes
      lastReviewedAt: now,
      history,
    };
  }

  // SM-2 simplifié
  let newInterval: number;
  if (card.reps === 0) newInterval = 1;
  else if (card.reps === 1) newInterval = 3;
  else newInterval = Math.round(card.intervalDays * card.ease);

  // Ajustement de l'ease selon le grade
  const easeDelta = grade === 1 ? -0.15 : grade === 2 ? 0 : +0.1;
  const newEase = Math.max(1.3, Math.min(3.0, card.ease + easeDelta));

  return {
    ...card,
    ease: newEase,
    intervalDays: newInterval,
    reps: card.reps + 1,
    dueAt: now + newInterval * DAY_MS,
    lastReviewedAt: now,
    history,
  };
}

/** Score de maîtrise en [0..1] basé sur l'historique récent et la stabilité. */
export function masteryScore(card: SrsCard | undefined): number {
  if (!card || card.history.length === 0) return 0;
  const recent = card.history.slice(-5);
  const avg = recent.reduce<number>((a, g) => a + g, 0) / (recent.length * 3); // 0..1
  const stability = Math.min(1, card.intervalDays / 30); // saturé à 30j
  return Math.round((avg * 0.7 + stability * 0.3) * 100) / 100;
}

/** Trie des cartes par priorité de révision (dues d'abord, puis ease faible). */
export function pickDueCards(
  cards: Record<string, SrsCard>,
  candidateIds: string[],
  now: number = Date.now(),
  limit?: number
): string[] {
  const due = candidateIds.filter((id) => {
    const c = cards[id];
    return !c || c.dueAt <= now;
  });
  // priorité aux cartes "à risque" : pas de carte, ou ease faible, ou en lapse
  due.sort((a, b) => {
    const ca = cards[a];
    const cb = cards[b];
    if (!ca && !cb) return 0;
    if (!ca) return -1;
    if (!cb) return 1;
    if (ca.lapses !== cb.lapses) return cb.lapses - ca.lapses;
    return ca.ease - cb.ease;
  });
  return limit ? due.slice(0, limit) : due;
}
