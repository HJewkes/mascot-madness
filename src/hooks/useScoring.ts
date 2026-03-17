import { useMemo } from 'react'
import type { Team } from '../data/bracket2026'
import { getResults, hasAnyResults, isPickCorrect } from '../data/results2026'

const ROUND_POINTS: Record<string, number> = {
  r1: 10,
  r2: 20,
  s16: 40,
  e8: 80,
  ff: 160,
  championship: 320,
}

const ROUND_LABELS: Record<string, string> = {
  r1: 'Round of 64',
  r2: 'Round of 32',
  s16: 'Sweet 16',
  e8: 'Elite 8',
  ff: 'Final Four',
  championship: 'Championship',
}

function getRoundKey(matchupKey: string): string {
  if (matchupKey === 'championship') return 'championship'
  if (matchupKey.startsWith('ff-')) return 'ff'

  // Regional keys: {region}-{round}-{index} or {region}-e8
  const parts = matchupKey.split('-')
  // parts[0] = region, parts[1] = round identifier
  const roundPart = parts[1]
  if (roundPart && ROUND_POINTS[roundPart] !== undefined) return roundPart
  return 'r1'
}

function getPointsForMatchup(matchupKey: string): number {
  return ROUND_POINTS[getRoundKey(matchupKey)] ?? 10
}

export interface RoundScore {
  label: string
  correct: number
  total: number
  points: number
  maxPoints: number
}

export interface ScoringResult {
  score: number
  maxPossibleScore: number
  correctPicks: number
  incorrectPicks: number
  pendingPicks: number
  roundScores: RoundScore[]
  hasResults: boolean
  getPickStatus: (matchupKey: string) => 'correct' | 'incorrect' | 'pending' | 'none'
}

export function useScoring(picks: Record<string, Team>): ScoringResult {
  return useMemo(() => {
    const results = getResults()
    const resultsExist = hasAnyResults()

    const roundData: Record<string, { correct: number; incorrect: number; pending: number; total: number }> = {}

    for (const key of ['r1', 'r2', 's16', 'e8', 'ff', 'championship']) {
      roundData[key] = { correct: 0, incorrect: 0, pending: 0, total: 0 }
    }

    // Count total games per round (4 regions)
    roundData.r1!.total = 32
    roundData.r2!.total = 16
    roundData.s16!.total = 8
    roundData.e8!.total = 4
    roundData.ff!.total = 2
    roundData.championship!.total = 1

    // Evaluate each pick
    let score = 0
    let correctPicks = 0
    let incorrectPicks = 0
    let pendingPicks = 0

    for (const matchupKey of Object.keys(picks)) {
      const roundKey = getRoundKey(matchupKey)
      const points = getPointsForMatchup(matchupKey)
      const correct = isPickCorrect(matchupKey, picks)

      if (correct === null) {
        // Game not played yet
        pendingPicks++
        if (roundData[roundKey]) roundData[roundKey].pending++
      } else if (correct) {
        score += points
        correctPicks++
        if (roundData[roundKey]) roundData[roundKey].correct++
      } else {
        incorrectPicks++
        if (roundData[roundKey]) roundData[roundKey].incorrect++
      }
    }

    // Calculate max possible: current score + points from pending picks + points from unplayed rounds where pick could still be right
    let maxPossibleScore = score
    for (const [roundKey, data] of Object.entries(roundData)) {
      const pts = ROUND_POINTS[roundKey] ?? 10
      maxPossibleScore += data.pending * pts
      // Games with no pick yet and no result yet can still be picked correctly
      const unpicked = data.total - data.correct - data.incorrect - data.pending
      if (unpicked > 0) {
        // Only count unpicked games that also have no result yet
        // (If a result exists but no pick was made, 0 points)
        maxPossibleScore += unpicked * pts
      }
    }

    // But for unpicked games that DO have results, subtract those back out
    for (const matchupKey of Object.keys(results)) {
      if (!picks[matchupKey]) {
        const pts = getPointsForMatchup(matchupKey)
        maxPossibleScore -= pts
      }
    }

    const roundScores: RoundScore[] = ['r1', 'r2', 's16', 'e8', 'ff', 'championship'].map((key) => {
      const data = roundData[key]!
      const pts = ROUND_POINTS[key] ?? 10
      return {
        label: ROUND_LABELS[key] ?? key,
        correct: data.correct,
        total: data.total,
        points: data.correct * pts,
        maxPoints: data.total * pts,
      }
    })

    function getPickStatus(matchupKey: string): 'correct' | 'incorrect' | 'pending' | 'none' {
      if (!picks[matchupKey]) return 'none'
      const correct = isPickCorrect(matchupKey, picks)
      if (correct === null) return 'pending'
      return correct ? 'correct' : 'incorrect'
    }

    return {
      score,
      maxPossibleScore,
      correctPicks,
      incorrectPicks,
      pendingPicks,
      roundScores,
      hasResults: resultsExist,
      getPickStatus,
    }
  }, [picks])
}
