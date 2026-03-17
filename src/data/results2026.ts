import type { Team } from './bracket2026'

/**
 * Actual tournament results, keyed by matchup key.
 * Value is the winning team's name (string).
 *
 * Update this object as games are played:
 *   'south-r1-0': 'Florida',
 *   'south-r1-1': 'Clemson',
 *   ...
 */
const results: Record<string, string> = {
  // Round of 64 - South
  // 'south-r1-0': '',  // (1) Florida vs (16) Lehigh
  // 'south-r1-1': '',  // (8) Clemson vs (9) Iowa
  // ...add results as games are played
}

export type TournamentResults = Record<string, string>

export function getResults(): TournamentResults {
  return results
}

export function getResult(matchupKey: string): string | undefined {
  return results[matchupKey]
}

export function hasAnyResults(): boolean {
  return Object.keys(results).length > 0
}

export function isPickCorrect(
  matchupKey: string,
  picks: Record<string, Team>,
): boolean | null {
  const result = results[matchupKey]
  if (!result) return null

  const pick = picks[matchupKey]
  if (!pick) return null

  return pick.name === result
}
