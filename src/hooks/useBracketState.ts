import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import { projected2026Bracket, type Team, type BracketData } from '../data/bracket2026'

export interface BracketPick {
  matchupKey: string
  winner: Team
}

export interface SavedBracket {
  id: string
  name: string
  createdAt: number
  picks: Record<string, Team>
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

const COLLECTION_KEY = 'mascot_madness_brackets'
const ACTIVE_KEY = 'mascot_madness_active_bracket'
const LEGACY_KEY = 'bracket2026_picks_v3'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function createBracket(name: string, picks: Record<string, Team> = {}): SavedBracket {
  return { id: generateId(), name, createdAt: Date.now(), picks }
}

function loadCollection(): SavedBracket[] {
  try {
    const saved = localStorage.getItem(COLLECTION_KEY)
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }

  // Migrate from legacy single-bracket storage
  try {
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const picks = JSON.parse(legacy)
      const migrated = createBracket('My Bracket', picks)
      return [migrated]
    }
  } catch { /* ignore */ }

  return []
}

function loadActiveId(brackets: SavedBracket[]): string | null {
  try {
    const id = localStorage.getItem(ACTIVE_KEY)
    if (id && brackets.some((b) => b.id === id)) return id
  } catch { /* ignore */ }
  return brackets[0]?.id ?? null
}

function saveCollection(brackets: SavedBracket[]) {
  try {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(brackets))
    // Clean up legacy key after migration
    localStorage.removeItem(LEGACY_KEY)
  } catch { /* ignore */ }
}

function saveActiveId(id: string) {
  try {
    localStorage.setItem(ACTIVE_KEY, id)
  } catch { /* ignore */ }
}

export function useBracketState() {
  const bracket = projected2026Bracket

  // Check for shared picks in URL first
  const [sharedPicks] = useState<Record<string, Team> | null>(() => {
    const params = new URLSearchParams(window.location.search)
    const shared = params.get('picks')
    if (shared) return decodePicksFromUrl(shared, bracket)
    return null
  })

  const [brackets, setBrackets] = useState<SavedBracket[]>(() => {
    if (sharedPicks) return loadCollection()
    return loadCollection()
  })

  const [activeId, setActiveId] = useState<string | null>(() => {
    if (sharedPicks) return null // shared view doesn't select a bracket
    return loadActiveId(brackets)
  })

  // If no brackets exist, create a default one
  useEffect(() => {
    if (brackets.length === 0 && !sharedPicks) {
      const first = createBracket('My Bracket')
      setBrackets([first])
      setActiveId(first.id)
    }
  }, [brackets.length, sharedPicks])

  // Persist collection changes
  useEffect(() => {
    saveCollection(brackets)
  }, [brackets])

  // Persist active bracket ID
  useEffect(() => {
    if (activeId) saveActiveId(activeId)
  }, [activeId])

  const activeBracket = brackets.find((b) => b.id === activeId)
  const picks = sharedPicks ?? activeBracket?.picks ?? {}
  const isSharedView = sharedPicks !== null

  const updateActivePicks = useCallback((updater: (prev: Record<string, Team>) => Record<string, Team>) => {
    if (isSharedView || !activeId) return
    setBrackets((prev) =>
      prev.map((b) => b.id === activeId ? { ...b, picks: updater(b.picks) } : b),
    )
  }, [activeId, isSharedView])

  const makePick = useCallback((matchupKey: string, winner: Team) => {
    updateActivePicks((prev) => ({ ...prev, [matchupKey]: winner }))
  }, [updateActivePicks])

  const clearPicks = useCallback(() => {
    updateActivePicks(() => ({}))
  }, [updateActivePicks])

  const getShareUrl = useCallback(() => {
    const encoded = encodePicksToUrl(picks)
    const url = new URL(window.location.href)
    url.pathname = url.pathname.replace(/#.*$/, '')
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

  // Multi-bracket management
  const createNewBracket = useCallback((name: string) => {
    const newBracket = createBracket(name)
    setBrackets((prev) => [...prev, newBracket])
    setActiveId(newBracket.id)
    return newBracket.id
  }, [])

  const duplicateBracket = useCallback((sourceId: string, newName: string) => {
    const source = brackets.find((b) => b.id === sourceId)
    if (!source) return null
    const dup = createBracket(newName, { ...source.picks })
    setBrackets((prev) => [...prev, dup])
    setActiveId(dup.id)
    return dup.id
  }, [brackets])

  const renameBracket = useCallback((id: string, name: string) => {
    setBrackets((prev) => prev.map((b) => b.id === id ? { ...b, name } : b))
  }, [])

  const deleteBracket = useCallback((id: string) => {
    setBrackets((prev) => {
      const next = prev.filter((b) => b.id !== id)
      if (next.length === 0) {
        const fresh = createBracket('My Bracket')
        setActiveId(fresh.id)
        return [fresh]
      }
      if (activeId === id && next.length > 0) {
        setActiveId(next[0]!.id)
      }
      return next
    })
  }, [activeId])

  const switchBracket = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const importSharedBracket = useCallback((name: string) => {
    if (!sharedPicks) return null
    const imported = createBracket(name, { ...sharedPicks })
    setBrackets((prev) => [...prev, imported])
    setActiveId(imported.id)
    // Clear shared picks from URL
    const url = new URL(window.location.href)
    url.searchParams.delete('picks')
    window.history.replaceState({}, '', url.toString())
    return imported.id
  }, [sharedPicks])

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
    // Multi-bracket
    brackets,
    activeBracketId: activeId,
    activeBracketName: activeBracket?.name ?? '',
    isSharedView,
    createNewBracket,
    duplicateBracket,
    renameBracket,
    deleteBracket,
    switchBracket,
    importSharedBracket,
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
