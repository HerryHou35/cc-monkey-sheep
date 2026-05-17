export default function Header({
  remainingCount,
  undoRemaining,
  maxUndo,
  soundEnabled,
  bgmEnabled,
  onReset,
  onUndo,
  onShuffle,
  onToggleSound,
  onToggleBgm,
}) {
  return (
    <div className="w-full px-4 pt-3 pb-1">
      <div className="glass rounded-2xl px-5 py-3 max-w-md mx-auto">
        {/* Top row: title and remaining count */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 animate-glow tracking-wide">
            🐒了个🐏
          </h1>
          <div className="flex items-center gap-1.5 text-white/80">
            <span className="text-xs text-white/50">剩余</span>
            <span className="text-lg font-bold tabular-nums">{remainingCount}</span>
          </div>
        </div>

        {/* Bottom row: action buttons */}
        <div className="flex items-center gap-2">
          {/* Sound effects toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '关闭音效' : '开启音效'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 border border-white/10 shrink-0"
          >
            {soundEnabled ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5H4a1 1 0 00-1 1v5a1 1 0 001 1h2.5l4 4V4.5l-4 4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 5.5l13 13M17.95 6.05a8 8 0 010 11.9M15.536 8.464a5 5 0 010 7.072M6.5 8.5H4a1 1 0 00-1 1v5a1 1 0 001 1h2.5l4 4V4.5l-4 4z" />
              </svg>
            )}
          </button>

          {/* Music toggle */}
          <button
            onClick={onToggleBgm}
            title={bgmEnabled ? '关闭音乐' : '开启音乐'}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 border border-white/10 shrink-0"
          >
            {bgmEnabled ? (
              <svg className={`w-4 h-4 ${bgmEnabled ? 'animate-music-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                <line x1="3" y1="3" x2="21" y2="21" strokeWidth={2} />
              </svg>
            )}
          </button>

          {/* Undo button */}
          <button
            onClick={onUndo}
            disabled={undoRemaining <= 0}
            title={`撤回 (剩余 ${undoRemaining} 次)`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 border border-white/10
              enabled:bg-white/10 enabled:hover:bg-white/20 enabled:text-white
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span>撤回</span>
            <span className="tabular-nums text-white/60">({undoRemaining})</span>
          </button>

          {/* Shuffle button */}
          <button
            onClick={onShuffle}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-medium transition-all duration-200 border border-white/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>洗牌</span>
          </button>

          {/* Restart button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-medium transition-all duration-200 border border-white/10 ml-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>重开</span>
          </button>
        </div>
      </div>
    </div>
  );
}
