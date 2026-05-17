export default function GameModal({ gameStatus, remainingCount, onReset }) {
  if (gameStatus === 'playing') return null;

  const isWon = gameStatus === 'won';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onReset}
      />

      <div className="relative glass-strong rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in shadow-2xl border-white/20">
        <div className="text-6xl mb-4">
          {isWon ? '🎉' : '😞'}
        </div>

        <h2
          className={`text-3xl font-extrabold mb-2 ${
            isWon ? 'text-yellow-300' : 'text-red-300'
          }`}
        >
          {isWon ? '🐒了个🐏 通关!' : '游戏结束'}
        </h2>

        <p className="text-white/60 mb-2 text-sm">
          {isWon
            ? '你成功消除了所有方块！'
            : '槽位已满，无法继续游戏。'}
        </p>

        {!isWon && (
          <p className="text-white/40 mb-6 text-sm">
            剩余方块：{remainingCount}
          </p>
        )}
        {isWon && <div className="mb-6" />}

        <button
          onClick={onReset}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 active:scale-95 ${
            isWon
              ? 'bg-yellow-500 hover:bg-yellow-400 text-yellow-900'
              : 'bg-red-500 hover:bg-red-400 text-red-900'
          }`}
        >
          {isWon ? '再来一局' : '重新挑战'}
        </button>
      </div>
    </div>
  );
}
