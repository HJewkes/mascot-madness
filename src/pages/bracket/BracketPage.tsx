import { useState, useRef, useEffect } from 'react'
import { Trophy, Sparkles, RotateCcw, Share2, Plus, Copy, Trash2, ChevronDown, Pencil, Check, X, Download, Eye } from 'lucide-react'
import { BracketView } from '../../components/bracket/BracketView'
import { MascotBattle } from '../../components/bracket/MascotBattle'
import { useBracketState, BracketProvider, type SavedBracket } from '../../hooks/useBracketState'
import { useScoring } from '../../hooks/useScoring'

type Mode = 'bracket' | 'mascot'

const tabs: { id: Mode; label: string; icon: React.ReactNode }[] = [
  { id: 'bracket', label: 'Bracket', icon: <Trophy size={18} /> },
  { id: 'mascot', label: 'Mascot Madness', icon: <Sparkles size={18} /> },
]

function BracketSwitcher({
  brackets,
  activeId,
  activeName,
  isSharedView,
  onSwitch,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
  onImportShared,
}: {
  brackets: SavedBracket[]
  activeId: string | null
  activeName: string
  isSharedView: boolean
  onSwitch: (id: string) => void
  onCreate: (name: string) => void
  onDuplicate: (id: string, name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onImportShared: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setEditingId(null)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const startRename = (b: SavedBracket) => {
    setEditingId(b.id)
    setEditName(b.name)
  }

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim())
    }
    setEditingId(null)
  }

  const displayName = isSharedView ? 'Shared Bracket' : activeName

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-text-primary bg-surface-elevated rounded-md hover:bg-interactive-hover transition-colors max-w-[140px] sm:max-w-[200px]"
      >
        <span className="truncate">{displayName}</span>
        <ChevronDown size={12} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-surface-elevated border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {isSharedView && (
            <button
              onClick={() => {
                onImportShared('Imported Bracket')
                setOpen(false)
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-brand-primary hover:bg-interactive-hover transition-colors border-b border-border"
            >
              <Download size={14} />
              Save shared bracket to my collection
            </button>
          )}

          <div className="max-h-48 overflow-y-auto">
            {brackets.map((b) => (
              <div
                key={b.id}
                className={`flex items-center gap-1 px-3 py-2 text-xs transition-colors ${
                  b.id === activeId ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-secondary hover:bg-interactive-hover'
                }`}
              >
                {editingId === b.id ? (
                  <form
                    className="flex items-center gap-1 flex-1 min-w-0"
                    onSubmit={(e) => { e.preventDefault(); confirmRename() }}
                  >
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-0 px-1.5 py-0.5 bg-surface-base border border-border rounded text-xs text-text-primary outline-none focus:border-brand-primary"
                      onKeyDown={(e) => { if (e.key === 'Escape') setEditingId(null) }}
                    />
                    <button type="submit" className="p-0.5 text-status-success hover:text-status-success/80">
                      <Check size={12} />
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="p-0.5 text-text-tertiary hover:text-text-secondary">
                      <X size={12} />
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      onClick={() => { onSwitch(b.id); setOpen(false) }}
                      className="flex-1 text-left truncate min-w-0"
                    >
                      {b.name}
                    </button>
                    <span className="text-text-tertiary shrink-0">
                      {Object.keys(b.picks).length}/63
                    </span>
                    <button
                      onClick={() => startRename(b)}
                      className="p-0.5 text-text-tertiary hover:text-text-secondary shrink-0"
                      title="Rename"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => onDuplicate(b.id, `${b.name} (copy)`)}
                      className="p-0.5 text-text-tertiary hover:text-text-secondary shrink-0"
                      title="Duplicate"
                    >
                      <Copy size={11} />
                    </button>
                    {brackets.length > 1 && (
                      <button
                        onClick={() => onDelete(b.id)}
                        className="p-0.5 text-text-tertiary hover:text-status-error shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              onCreate(`Bracket ${brackets.length + 1}`)
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-interactive-hover transition-colors border-t border-border"
          >
            <Plus size={14} />
            New bracket
          </button>
        </div>
      )}
    </div>
  )
}

export default function BracketPage() {
  const [mode, setMode] = useState<Mode>('mascot')
  const [copied, setCopied] = useState(false)
  const state = useBracketState()
  const {
    totalPicks, totalGames, picks, clearPicks, getShareUrl, isSharedView,
    brackets, activeBracketId, activeBracketName,
    createNewBracket, duplicateBracket, renameBracket, deleteBracket, switchBracket, importSharedBracket,
  } = state
  const scoring = useScoring(picks)
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h1 className="hidden sm:block font-heading text-lg font-bold text-text-primary leading-tight shrink-0">
                  Mascot Madness
                </h1>
                <BracketSwitcher
                  brackets={brackets}
                  activeId={activeBracketId}
                  activeName={activeBracketName}
                  isSharedView={isSharedView}
                  onSwitch={switchBracket}
                  onCreate={createNewBracket}
                  onDuplicate={duplicateBracket}
                  onRename={renameBracket}
                  onDelete={deleteBracket}
                  onImportShared={importSharedBracket}
                />
              </div>

              {/* Picks progress + score */}
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
                {scoring.hasResults && (
                  <div className="text-xs whitespace-nowrap pl-1 border-l border-border">
                    <span className="font-bold text-status-success">{scoring.score}</span>
                    <span className="text-text-tertiary"> pts</span>
                  </div>
                )}
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
                {(isComplete || isSharedView) && (
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1 px-2 py-1 sm:py-1.5 text-xs bg-brand-primary text-on-brand-primary rounded-md hover:bg-brand-primary-hover transition-colors"
                  >
                    <Share2 size={14} />
                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
                  </button>
                )}
                {!isSharedView && (
                  <button
                    onClick={clearPicks}
                    className="flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs text-text-tertiary hover:text-status-error transition-colors rounded-md hover:bg-interactive-hover"
                  >
                    <RotateCcw size={14} />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {isSharedView && (
          <div className="bg-brand-primary/10 border-b border-brand-primary/20">
            <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Eye size={16} className="text-brand-primary shrink-0" />
                <span>
                  <span className="font-medium text-text-primary">Viewing a shared bracket</span>
                  {' '}&mdash; picks are read-only
                </span>
              </div>
              <button
                onClick={() => importSharedBracket('Imported Bracket')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-primary text-on-brand-primary rounded-md hover:bg-brand-primary-hover transition-colors shrink-0"
              >
                <Download size={14} />
                Import to my brackets
              </button>
            </div>
          </div>
        )}

        <main className="max-w-[1600px] mx-auto">
          {mode === 'bracket' && <BracketView />}
          {mode === 'mascot' && <MascotBattle />}
        </main>
      </div>
    </BracketProvider>
  )
}
