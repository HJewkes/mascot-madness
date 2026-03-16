import { useState } from 'react'
import { Trophy, Sparkles, RotateCcw, Share2 } from 'lucide-react'
import { BracketView } from '../../components/bracket/BracketView'
import { MascotBattle } from '../../components/bracket/MascotBattle'
import { useBracketState, BracketProvider } from '../../hooks/useBracketState'

type Mode = 'bracket' | 'mascot'

const tabs: { id: Mode; label: string; icon: React.ReactNode }[] = [
  { id: 'bracket', label: 'Bracket', icon: <Trophy size={18} /> },
  { id: 'mascot', label: 'Mascot Madness', icon: <Sparkles size={18} /> },
]

export default function BracketPage() {
  const [mode, setMode] = useState<Mode>('mascot')
  const [copied, setCopied] = useState(false)
  const state = useBracketState()
  const { totalPicks, totalGames, clearPicks, getShareUrl } = state
  const isComplete = totalPicks === totalGames

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

  return (
    <BracketProvider value={state}>
      <div className="min-h-screen bg-background-base">
        <header className="sticky top-0 z-50 bg-surface-base/80 backdrop-blur-md border-b border-border">
          <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-2 sm:py-3">
            {/* Row 1: Title (hidden on mobile) + progress + actions */}
            <div className="flex items-center justify-between gap-2">
              <h1 className="hidden sm:block font-heading text-lg font-bold text-text-primary leading-tight shrink-0">
                Mascot Madness
              </h1>

              {/* Picks progress */}
              <div className="flex items-center gap-2">
                <div className="text-xs text-text-secondary whitespace-nowrap">
                  <span className="font-bold text-text-primary">{totalPicks}</span>
                  <span className="text-text-tertiary">/{totalGames}</span>
                </div>
                <div className="w-20 sm:w-24 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-normal"
                    style={{ width: `${(totalPicks / totalGames) * 100}%` }}
                  />
                </div>
              </div>

              {/* Tabs + actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                <nav className="flex gap-1 bg-surface-elevated rounded-lg p-0.5 sm:p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setMode(tab.id)}
                      className={`
                        flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-fast
                        ${mode === tab.id
                          ? 'bg-brand-primary text-on-brand-primary shadow-sm'
                          : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover'
                        }
                      `}
                    >
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </nav>
                {isComplete && (
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 px-2 py-1 sm:py-1.5 text-xs bg-brand-primary text-on-brand-primary rounded-md hover:bg-brand-primary-hover transition-colors"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
                  </button>
                )}
                <button
                  onClick={clearPicks}
                  className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs text-text-tertiary hover:text-status-error transition-colors rounded-md hover:bg-interactive-hover"
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto">
          {mode === 'bracket' && <BracketView />}
          {mode === 'mascot' && <MascotBattle />}
        </main>
      </div>
    </BracketProvider>
  )
}
