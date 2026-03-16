import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { projected2026Bracket, type Team, type BracketData } from '../data/bracket2026'

export interface BracketPick {
  matchupKey: string
  winner: Team
}

export interface BracketState {
  picks: Record<string, Team>
  bracket: BracketData
}

function encodePicksToUrl(picks: Record<string, Team>): string {
  const entries = Object.entries(picks).map(([key, team]) => `${key}:${team.name}`)
  return btoa(entries.join('|'))
}

function decodePicksFromUrl(encoded: string, bracket: BracketData): Record<string, Team> {
  try {
    const decoded = atob(encoded)
    const allTeams = Object.values(bracket.regions).flatMap((r) =>
      r.matchups.flatMap((m) => [m.top, m.bottom].filter(Boolean) as Team[]),
    )
    const picks: Record<string, Team> = {}
    decoded.split('|').forEach((entry) => {
      const [key, name] = entry.split(':')
      const team = allTeams.find((t) => t.name === name)
      if (key && team) picks[key] = team
    })
    return picks
  } catch {
    return {}
  }
}

const STORAGE_KEY = 'bracket2026_picks_v3'

function loadPicks(bracket: BracketData): Record<string, Team> {
  const params = new URLSearchParams(window.location.search)
  const shared = params.get('picks')
  if (shared) return decodePicksFromUrl(shared, bracket)

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return {}
}

export function useBracketState() {
  const bracket = projected2026Bracket
  const [picks, setPicks] = useState<Record<string, Team>>(() => loadPicks(bracket))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks))
    } catch { /* ignore */ }
  }, [picks])

  const makePick = useCallback((matchupKey: string, winner: Team) => {
    setPicks((prev) => ({ ...prev, [matchupKey]: winner }))
  }, [])

  const clearPicks = useCallback(() => {
    setPicks({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const getShareUrl = useCallback(() => {
    const encoded = encodePicksToUrl(picks)
    const url = new URL(window.location.href)
    url.pathname = '/'
    url.searchParams.set('picks', encoded)
    return url.toString()
  }, [picks])

  const getMatchups = useCallback(
    (regionKey: string) => {
      const region = bracket.regions[regionKey]
      if (!region) return []
      return region.matchups
    },
    [bracket],
  )

  const getWinner = useCallback(
    (matchupKey: string): Team | undefined => picks[matchupKey],
    [picks],
  )

  const getRound2Matchups = useCallback(
    (regionKey: string) => {
      const r1 = bracket.regions[regionKey]?.matchups ?? []
      const round2: { key: string; top: Team | undefined; bottom: Team | undefined }[] = []
      for (let i = 0; i < r1.length; i += 2) {
        const topWinner = picks[`${regionKey}-r1-${i}`]
        const bottomWinner = picks[`${regionKey}-r1-${i + 1}`]
        round2.push({
          key: `${regionKey}-r2-${Math.floor(i / 2)}`,
          top: topWinner,
          bottom: bottomWinner,
        })
      }
      return round2
    },
    [bracket, picks],
  )

  const getSweet16Matchups = useCallback(
    (regionKey: string) => {
      const r2 = getRound2Matchups(regionKey)
      const s16: { key: string; top: Team | undefined; bottom: Team | undefined }[] = []
      for (let i = 0; i < r2.length; i += 2) {
        const topKey = r2[i]?.key
        const bottomKey = r2[i + 1]?.key
        const topWinner = topKey ? picks[topKey] : undefined
        const bottomWinner = bottomKey ? picks[bottomKey] : undefined
        s16.push({
          key: `${regionKey}-s16-${Math.floor(i / 2)}`,
          top: topWinner,
          bottom: bottomWinner,
        })
      }
      return s16
    },
    [getRound2Matchups, picks],
  )

  const getElite8Matchup = useCallback(
    (regionKey: string) => {
      const s16 = getSweet16Matchups(regionKey)
      const topKey = s16[0]?.key
      const bottomKey = s16[1]?.key
      const topWinner = topKey ? picks[topKey] : undefined
      const bottomWinner = bottomKey ? picks[bottomKey] : undefined
      return {
        key: `${regionKey}-e8`,
        top: topWinner,
        bottom: bottomWinner,
      }
    },
    [getSweet16Matchups, picks],
  )

  const getFinalFourMatchups = useCallback(() => {
    const regionPairs = [
      ['south', 'west'],
      ['midwest', 'east'],
    ] as const
    return regionPairs.map(([r1, r2], i) => ({
      key: `ff-${i}`,
      top: picks[`${r1}-e8`],
      bottom: picks[`${r2}-e8`],
    }))
  }, [picks])

  const getChampionship = useCallback(() => {
    const ff = getFinalFourMatchups()
    return {
      key: 'championship',
      top: ff[0]?.key ? picks[ff[0].key] : undefined,
      bottom: ff[1]?.key ? picks[ff[1].key] : undefined,
    }
  }, [getFinalFourMatchups, picks])

  const totalPicks = Object.keys(picks).length
  const totalGames = 63

  return {
    bracket,
    picks,
    makePick,
    clearPicks,
    getShareUrl,
    getMatchups,
    getWinner,
    getRound2Matchups,
    getSweet16Matchups,
    getElite8Matchup,
    getFinalFourMatchups,
    getChampionship,
    totalPicks,
    totalGames,
    progress: totalPicks / totalGames,
  }
}

export type BracketStateType = ReturnType<typeof useBracketState>

const BracketContext = createContext<BracketStateType | null>(null)

export const BracketProvider = BracketContext.Provider

export function useBracketContext(): BracketStateType {
  const ctx = useContext(BracketContext)
  if (!ctx) throw new Error('useBracketContext must be used within BracketProvider')
  return ctx
}
