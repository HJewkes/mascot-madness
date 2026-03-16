import { useState, useMemo } from 'react'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, RotateCcw, Share2 } from 'lucide-react'
import { useBracketContext } from '../../hooks/useBracketState'
import { mascotProfiles, type MascotProfile } from '../../data/mascots'
import { mascotGroundedImages } from '../../data/mascotGrounded'
import type { Team } from '../../data/bracket2026'

interface MascotMatchup {
  key: string
  top: Team
  bottom: Team
  topMascot: MascotProfile
  bottomMascot: MascotProfile
  region: string
}

function MascotImage({ team, className = '', size = 'md' }: { team: Team; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const grounded = mascotGroundedImages[team.name]
  const src = grounded?.startsWith('/') ? import.meta.env.BASE_URL + grounded.slice(1) : grounded
  const [loaded, setLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)

  // Reset loaded state when team changes
  if (src !== currentSrc) {
    setCurrentSrc(src)
    setLoaded(false)
  }

  const sizes = {
    sm: { container: 'w-14 h-14' },
    md: { container: 'w-32 h-40' },
    lg: { container: 'w-40 h-48' },
  }
  const s = sizes[size]

  if (src) {
    return (
      <div
        className={`${s.container} rounded-xl overflow-hidden ${className}`}
        style={{ background: `linear-gradient(135deg, #${team.color}30, #${team.altColor}20)` }}
      >
        <img
          src={src}
          alt=""
          className={`w-full h-full object-cover object-top transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
      </div>
    )
  }

  // Fallback for any team missing a grounded image
  return (
    <div className={`flex items-center justify-center rounded-xl ${s.container} ${className}`}
      style={{ background: `linear-gradient(135deg, #${team.color}30, #${team.altColor}20)` }}
    >
      {team.logo
        ? <img src={team.logo} alt="" className="w-3/4 h-3/4 object-contain" loading="lazy" />
        : <span className="font-heading text-2xl font-bold text-text-secondary">{team.name.charAt(0)}</span>
      }
    </div>
  )
}

function MascotCard({
  team,
  mascot,
  onPick,
}: {
  team: Team
  mascot: MascotProfile
  onPick: () => void
}) {
  return (
    <motion.button
      onClick={onPick}
      className="flex-1 flex flex-col rounded-xl border-2 border-border hover:border-brand-primary transition-colors cursor-pointer group overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Mascot image header */}
      <div
        className="relative px-4 pt-2 pb-2"
        style={{
          background: `linear-gradient(135deg, #${team.color}40, #${team.altColor}25)`,
        }}
      >
        <div className="text-[10px] font-bold text-text-tertiary text-center mb-1">
          #{team.seed} {team.name} {team.mascot}
        </div>
        <MascotImage team={team} size="lg" className="mx-auto mb-1" />
        <h3 className="font-heading text-lg font-bold text-text-primary leading-tight text-center">
          {mascot.mascotName}
        </h3>
        <p className="text-xs text-text-secondary text-center">{mascot.species}</p>
      </div>

      <div className="p-4 pt-3 space-y-3 text-left flex-1">
        <p className="text-sm text-text-secondary leading-relaxed">{mascot.description}</p>

        <div className="bg-surface-base rounded-lg p-2">
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
            Battle Cry
          </div>
          <div className="text-sm font-bold text-brand-primary italic">
            &ldquo;{mascot.battleCry}&rdquo;
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
            Strengths
          </div>
          <div className="flex flex-wrap gap-1">
            {mascot.strengths.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-0.5 rounded-full bg-status-success/10 text-status-success"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
            Weakness
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-status-error/10 text-status-error">
            {mascot.weakness}
          </span>
        </div>

        <div className="bg-surface-base rounded-lg p-2">
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">
            Fun Fact
          </div>
          <p className="text-xs text-text-secondary">{mascot.funFact}</p>
        </div>
      </div>

      <div className="p-3 pt-0">
        <div className="w-full py-2 rounded-lg bg-brand-primary/10 text-brand-primary text-sm font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity">
          Pick {mascot.mascotName}!
        </div>
      </div>
    </motion.button>
  )
}

function SwipeMascotCard({
  matchup,
  onPick,
}: {
  matchup: MascotMatchup
  onPick: (team: Team) => void
}) {
  const [dragDir, setDragDir] = useState<'left' | 'right' | null>(null)
  const [showingTeam, setShowingTeam] = useState<'top' | 'bottom'>('top')
  const [isDragging, setIsDragging] = useState(false)

  const currentTeam = showingTeam === 'top' ? matchup.top : matchup.bottom
  const currentMascot = showingTeam === 'top' ? matchup.topMascot : matchup.bottomMascot
  const otherTeam = showingTeam === 'top' ? matchup.bottom : matchup.top
  const otherMascot = showingTeam === 'top' ? matchup.bottomMascot : matchup.topMascot

  // Preload both images so flip is instant
  const topImg = mascotGroundedImages[matchup.top.name]
  const bottomImg = mascotGroundedImages[matchup.bottom.name]
  const preloadSrc = (p: string | undefined) =>
    p?.startsWith('/') ? import.meta.env.BASE_URL + p.slice(1) : p

  const handleDragStart = () => setIsDragging(true)

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100) onPick(currentTeam)
    else if (info.offset.x < -100) onPick(otherTeam)
    setDragDir(null)
    setTimeout(() => setIsDragging(false), 50)
  }

  const handleDrag = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 40) setDragDir('right')
    else if (info.offset.x < -40) setDragDir('left')
    else setDragDir(null)
  }

  const handleTap = () => {
    if (!isDragging) {
      setShowingTeam((s) => (s === 'top' ? 'bottom' : 'top'))
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Preload both mascot images */}
      {topImg && <img src={preloadSrc(topImg)!} alt="" className="hidden" />}
      {bottomImg && <img src={preloadSrc(bottomImg)!} alt="" className="hidden" />}

      {/* Toggle to see other mascot — at top */}
      <button
        onClick={() => setShowingTeam((s) => (s === 'top' ? 'bottom' : 'top'))}
        className="w-full mb-2 py-1.5 text-sm text-brand-primary font-medium text-center"
      >
        Tap card or here to see {otherMascot.mascotName} →
      </button>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        className="touch-pan-y"
      >
        <div className="bg-surface-elevated rounded-xl border border-border overflow-hidden relative">
          <AnimatePresence>
            {dragDir === 'right' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-status-success/20 z-10 flex items-start justify-center pt-[50px] pointer-events-none"
              >
                <span className="text-2xl font-heading font-bold text-status-success" style={{ textShadow: '0 0 20px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.9)' }}>
                  Pick {currentMascot.mascotName}! →
                </span>
              </motion.div>
            )}
            {dragDir === 'left' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-status-error/20 z-10 flex items-start justify-center pt-[50px] pointer-events-none"
              >
                <span className="text-2xl font-heading font-bold text-status-error" style={{ textShadow: '0 0 20px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.9)' }}>
                  ← Pick {otherMascot.mascotName}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="p-6 pb-4"
            style={{
              background: `linear-gradient(135deg, #${currentTeam.color}40, #${currentTeam.altColor}25)`,
            }}
          >
            <div className="text-[10px] font-bold text-text-tertiary text-center mb-1">
              #{currentTeam.seed} {currentTeam.name} {currentTeam.mascot}
            </div>
            <MascotImage team={currentTeam} size="lg" className="mx-auto mb-2" />
            <h3 className="font-heading text-xl font-bold text-text-primary text-center">
              {currentMascot.mascotName}
            </h3>
            <p className="text-xs text-text-secondary text-center">{currentMascot.species}</p>
          </div>

          <div className="p-4 space-y-3">
            <p className="text-sm text-text-secondary">{currentMascot.description}</p>
            <div className="text-sm font-bold text-brand-primary italic text-center">
              &ldquo;{currentMascot.battleCry}&rdquo;
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {currentMascot.strengths.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-status-success/10 text-status-success">
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-text-tertiary text-center">{currentMascot.funFact}</p>
          </div>

          <div className="p-3 flex items-center justify-center gap-2 text-xs text-text-tertiary">
            <ChevronLeft size={14} />
            <span>← {otherMascot.mascotName} · {currentMascot.mascotName} →</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface RoundDef {
  name: string
  matchups: MascotMatchup[]
}

function toMascotMatchup(m: { key: string; top: Team | undefined; bottom: Team | undefined }, region: string): MascotMatchup | null {
  if (!m.top || !m.bottom) return null
  const topMascot = mascotProfiles[m.top.name]
  const bottomMascot = mascotProfiles[m.bottom.name]
  if (!topMascot || !bottomMascot) return null
  return { key: m.key, top: m.top, bottom: m.bottom, topMascot, bottomMascot, region }
}

export function MascotBattle() {
  const state = useBracketContext()
  const { bracket, picks, makePick, getShareUrl, clearPicks,
    getMatchups, getRound2Matchups, getSweet16Matchups, getElite8Matchup,
    getFinalFourMatchups, getChampionship } = state
  const [copied, setCopied] = useState(false)

  const regionKeys = ['south', 'midwest', 'west', 'east'] as const
  const regionNames: Record<string, string> = {
    south: 'South', west: 'West', midwest: 'Midwest', east: 'East',
  }

  const allRounds = useMemo(() => {
    const rounds: RoundDef[] = []

    // Round of 64
    const r64: MascotMatchup[] = []
    for (const key of regionKeys) {
      const matchups = getMatchups(key)
      matchups.forEach((m, i) => {
        const mm = toMascotMatchup({ key: `${key}-r1-${i}`, top: m.top ?? undefined, bottom: m.bottom ?? undefined }, regionNames[key] ?? key)
        if (mm) r64.push(mm)
      })
    }
    rounds.push({ name: 'Round of 64', matchups: r64 })

    // Round of 32
    const r32: MascotMatchup[] = []
    for (const key of regionKeys) {
      for (const m of getRound2Matchups(key)) {
        const mm = toMascotMatchup(m, regionNames[key] ?? key)
        if (mm) r32.push(mm)
      }
    }
    rounds.push({ name: 'Round of 32', matchups: r32 })

    // Sweet 16
    const s16: MascotMatchup[] = []
    for (const key of regionKeys) {
      for (const m of getSweet16Matchups(key)) {
        const mm = toMascotMatchup(m, regionNames[key] ?? key)
        if (mm) s16.push(mm)
      }
    }
    rounds.push({ name: 'Sweet 16', matchups: s16 })

    // Elite 8
    const e8: MascotMatchup[] = []
    for (const key of regionKeys) {
      const m = getElite8Matchup(key)
      const mm = toMascotMatchup(m, regionNames[key] ?? key)
      if (mm) e8.push(mm)
    }
    rounds.push({ name: 'Elite 8', matchups: e8 })

    // Final Four
    const ff: MascotMatchup[] = []
    for (const m of getFinalFourMatchups()) {
      const mm = toMascotMatchup(m, 'Final Four')
      if (mm) ff.push(mm)
    }
    rounds.push({ name: 'Final Four', matchups: ff })

    // Championship
    const champ = getChampionship()
    const champMM = toMascotMatchup(champ, 'Championship')
    if (champMM) rounds.push({ name: 'Championship', matchups: [champMM] })

    return rounds
  }, [bracket, picks])

  // Find current round and matchup
  let currentRound: RoundDef | undefined
  let currentMatchup: MascotMatchup | undefined
  for (const round of allRounds) {
    const pending = round.matchups.find((m) => !picks[m.key])
    if (pending) {
      currentRound = round
      currentMatchup = pending
      break
    }
  }

  // Count completed in current round
  const completedInRound = currentRound
    ? currentRound.matchups.filter((m) => picks[m.key]).length
    : 0
  const totalInRound = currentRound?.matchups.length ?? 0

  const [isMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640,
  )

  const handlePick = (team: Team) => {
    if (currentMatchup) {
      makePick(currentMatchup.key, team)
    }
  }

  const handleShare = async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      prompt('Copy this link:', url)
    }
  }

  // Check for champion
  const champion = state.getWinner('championship')

  if (champion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <MascotImage team={champion} size="lg" className="mb-4" />
        <h2 className="font-heading text-2xl font-bold text-text-primary mb-1">
          {mascotProfiles[champion.name]?.mascotName ?? champion.name} Wins!
        </h2>
        <p className="text-text-secondary mb-6">
          The {champion.name} {champion.mascot} are your Mascot Madness champions!
        </p>
        <div className="flex gap-3">
          <button onClick={clearPicks} className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-status-error border border-border rounded-lg hover:bg-interactive-hover transition-colors">
            <RotateCcw size={16} /> Battle Again
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-primary text-on-brand-primary rounded-lg hover:bg-brand-primary-hover transition-colors">
            <Share2 size={16} /> {copied ? 'Link Copied!' : 'Share Results'}
          </button>
        </div>
      </div>
    )
  }

  if (!currentMatchup || !currentRound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-6xl mb-4">🏀</div>
        <h2 className="font-heading text-2xl font-bold text-text-primary mb-2">
          Waiting for matchups...
        </h2>
        <p className="text-text-secondary mb-6">
          Complete the current round to unlock the next one.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-3xl mx-auto mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles size={18} className="text-brand-primary" />
          <h2 className="font-heading text-lg font-bold text-text-primary">Mascot Madness!</h2>
          <Sparkles size={18} className="text-brand-primary" />
        </div>
        <p className="text-sm text-text-secondary mb-3">
          Forget stats — which mascot would win in a fight?
        </p>

        {/* Round indicator */}
        <div className="inline-block px-4 py-1.5 bg-brand-primary/15 border border-brand-primary/30 rounded-full mb-3">
          <span className="font-heading text-sm font-bold text-brand-primary">{currentRound.name}</span>
        </div>

        <div className="flex items-center justify-center gap-3 text-sm text-text-tertiary">
          <span>{currentMatchup.region}</span>
          <span>•</span>
          <span>Battle {completedInRound + 1} of {totalInRound}</span>
        </div>
        <div className="w-full max-w-xs mx-auto h-1.5 bg-surface-elevated rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-normal"
            style={{ width: `${((completedInRound) / totalInRound) * 100}%` }}
          />
        </div>
      </div>

      {isMobile ? (
        <SwipeMascotCard matchup={currentMatchup} onPick={handlePick} />
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-4 items-stretch">
            <MascotCard
              team={currentMatchup.top}
              mascot={currentMatchup.topMascot}
              onPick={() => handlePick(currentMatchup.top)}
            />
            <MascotCard
              team={currentMatchup.bottom}
              mascot={currentMatchup.bottomMascot}
              onPick={() => handlePick(currentMatchup.bottom)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
