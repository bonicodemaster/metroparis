/** Normalise une chaîne : minuscules, sans accents, sans ponctuation. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[—–-]/g, " ")
    .replace(/['’`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distance de Levenshtein (utilisée pour tolérer de petites fautes). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp: number[] = Array(b.length + 1)
    .fill(0)
    .map((_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** Réponse considérée correcte si la distance ≤ ~10% de la longueur. */
export function matchAnswer(input: string, target: string): boolean {
  const a = normalize(input);
  const b = normalize(target);
  if (!a || !b) return false;
  if (a === b) return true;
  const tol = Math.max(1, Math.floor(b.length / 10));
  return levenshtein(a, b) <= tol;
}

/**
 * Match plus permissif que `matchAnswer`. Accepte les réponses partielles :
 * - égalité (avec tolérance Levenshtein 10% de la cible)
 * - sous-chaîne ≥ 3 caractères présente dans la cible
 *   ex. "etoile" valide pour "Charles de Gaulle—Étoile"
 *   ex. "champs" valide pour "Champs-Élysées—Clemenceau"
 * - token de la cible (mot ≥ 3 lettres) qui match le input avec 1 typo
 *
 * Renvoie `false` pour les mots vides ou très courts pour éviter les faux
 * positifs.
 */
export function isPartialMatch(input: string, target: string): boolean {
  const a = normalize(input);
  const b = normalize(target);
  if (!a || !b) return false;
  if (a === b) return true;

  // Levenshtein global (chaîne entière)
  const fullTol = Math.max(1, Math.floor(b.length / 10));
  if (levenshtein(a, b) <= fullTol) return true;

  // Sous-chaîne : input présent dans la cible (≥ 3 chars)
  if (a.length >= 3 && b.includes(a)) return true;

  // Token-level : on découpe la cible en mots et on tolère 1 typo par token
  const tokens = b.split(/\s+/).filter((t) => t.length >= 3);
  for (const token of tokens) {
    if (token === a) return true;
    if (a.length >= 3 && Math.abs(token.length - a.length) <= 1 && levenshtein(token, a) <= 1) {
      return true;
    }
  }

  return false;
}
