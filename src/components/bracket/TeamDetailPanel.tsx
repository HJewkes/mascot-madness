import { X } from 'lucide-react'
import type { Team } from '../../data/bracket2026'
import { mascotProfiles } from '../../data/mascots'

const historicalSeedWinPct: Record<number, number> = {
  1: 99.3, 2: 93.8, 3: 85.1, 4: 79.2, 5: 64.6, 6: 62.5,
  7: 60.4, 8: 50.0, 9: 50.0, 10: 39.6, 11: 37.5,
  12: 35.4, 13: 20.8, 14: 14.9, 15: 6.3, 16: 0.7,
}

export function TeamDetailPanel({ team, onClose }: { team: Team; onClose: () => void }) {
  const mascot = mascotProfiles[team.name]
  const winPct = historicalSeedWinPct[team.seed] ?? 50

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-surface-elevated border-l border-border z-50 overflow-y-auto animate-slide-in-right print:hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {team.logo && (
              <img src={team.logo} alt="" className="w-12 h-12 object-contain" />
            )}
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary">{team.name}</h2>
              <p className="text-sm text-text-secondary">{team.mascot}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Team color bar */}
        <div
          className="h-1 rounded-full mb-4"
          style={{ background: `linear-gradient(90deg, #${team.color}, #${team.altColor})` }}
        />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Seed" value={`#${team.seed}`} />
          <StatCard label="Record" value={team.record} />
          <StatCard label="Conference" value={team.conference} />
        </div>

        {/* Historical seed performance */}
        <div className="bg-surface-base rounded-lg p-3 mb-4">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">
            Historical {team.seed}-Seed Performance
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${winPct}%`,
                  backgroundColor: `#${team.color}`,
                }}
              />
            </div>
            <span className="text-sm font-bold text-text-primary">{winPct}%</span>
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            Round of 64 win rate for {team.seed}-seeds since 1985
          </p>
        </div>

        {/* Rank */}
        {team.rank && (
          <div className="bg-surface-base rounded-lg p-3 mb-4">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-1">
              AP Ranking
            </h3>
            <p className="text-2xl font-heading font-bold text-brand-primary">#{team.rank}</p>
          </div>
        )}

        {/* Mascot info */}
        {mascot && (
          <div className="bg-surface-base rounded-lg p-3">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">
              Mascot: {mascot.mascotName} {mascot.emoji}
            </h3>
            <p className="text-sm text-text-secondary mb-3">{mascot.description}</p>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-bold text-text-tertiary">Battle Cry: </span>
                <span className="text-xs text-text-primary italic">"{mascot.battleCry}"</span>
              </div>
              <div>
                <span className="text-xs font-bold text-text-tertiary">Fun Fact: </span>
                <span className="text-xs text-text-secondary">{mascot.funFact}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-base rounded-lg p-2 text-center">
      <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">{label}</div>
      <div className="text-sm font-bold text-text-primary mt-0.5">{value}</div>
    </div>
  )
}
