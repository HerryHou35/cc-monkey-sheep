import { useState, useCallback } from 'react';
import Header from './components/Header';
import GameBoard from './components/GameBoard';
import TileSlot from './components/TileSlot';
import GameModal from './components/GameModal';
import ValidationModal from './components/ValidationModal';
import { ElimParticles, VictoryConfetti, DefeatParticles } from './components/ParticleEffect';
import { useGameLogic } from './hooks/useGameLogic';
import { initAudio, isMuted, toggleMute, initBGM, startBGM, isBgmEnabled, toggleBGM, playError } from './utils/soundManager';

function useSoundEnabled() {
  const [enabled, setEnabled] = useState(() => !isMuted());
  const toggle = useCallback(() => {
    initAudio();
    const nowMuted = toggleMute();
    setEnabled(!nowMuted);
  }, []);
  return [enabled, toggle];
}

function useBgmEnabled() {
  const [enabled, setEnabled] = useState(() => isBgmEnabled());
  const toggle = useCallback(() => {
    initBGM();
    const nowEnabled = toggleBGM();
    setEnabled(nowEnabled);
  }, []);
  return [enabled, toggle];
}

export default function App() {
  const {
    tiles,
    slotTiles,
    tileTypes,
    gameStatus,
    remainingCount,
    animatingIds,
    eliminatingIds,
    shakeSlot,
    shuffling,
    undoRemaining,
    elimParticles,
    showConfetti,
    showDefeatShake,
    handleTileClick,
    doUndo,
    doShuffle,
    resetGame,
    MAX_SLOTS,
    MAX_UNDO,
  } = useGameLogic();

  const [soundEnabled, toggleSound] = useSoundEnabled();
  const [bgmEnabled, toggleBgm] = useBgmEnabled();

  // Validation modal state
  const [validation, setValidation] = useState(null);

  const openValidation = useCallback((type) => {
    if (type === 'undo') {
      if (undoRemaining <= 0) return;
      setValidation({
        type: 'undo',
        title: '撤回验证',
        question: '请输入：Herry Hou最帅',
        answer: 'Herry Hou最帅',
      });
    } else if (type === 'shuffle') {
      setValidation({
        type: 'shuffle',
        title: '洗牌验证',
        question: '你最爱谁？',
        answer: 'Herry Hou',
      });
    }
  }, [undoRemaining]);

  const handleValidationSuccess = useCallback(() => {
    if (!validation) return;
    setValidation(null);
    if (validation.type === 'undo') {
      doUndo();
    } else if (validation.type === 'shuffle') {
      doShuffle();
    }
  }, [validation, doUndo, doShuffle]);

  const handleValidationCancel = useCallback(() => {
    setValidation(null);
  }, []);

  const handleValidationError = useCallback(() => {
    playError();
  }, []);

  const handleBoardClick = useCallback((tileId) => {
    initAudio();
    startBGM();
    handleTileClick(tileId);
  }, [handleTileClick]);

  return (
    <div className="min-h-screen flex flex-col items-center select-none">
      <Header
        remainingCount={remainingCount}
        undoRemaining={undoRemaining}
        maxUndo={MAX_UNDO}
        soundEnabled={soundEnabled}
        bgmEnabled={bgmEnabled}
        onReset={resetGame}
        onUndo={() => openValidation('undo')}
        onShuffle={() => openValidation('shuffle')}
        onToggleSound={toggleSound}
        onToggleBgm={toggleBgm}
      />

      {/* Board area */}
      <div
        className="flex-1 flex items-center justify-center w-full px-2 py-3 overflow-auto"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'manipulation' }}
      >
        <GameBoard
          tiles={tiles}
          tileTypes={tileTypes}
          animatingIds={animatingIds}
          eliminatingIds={eliminatingIds}
          shuffling={shuffling}
          onTileClick={handleBoardClick}
        />
      </div>

      {/* Bottom slot bar */}
      <div className="w-full pb-4 pt-1">
        <TileSlot
          slotTiles={slotTiles}
          tileTypes={tileTypes}
          eliminatingIds={eliminatingIds}
          shakeSlot={shakeSlot}
          maxSlots={MAX_SLOTS}
        />
      </div>

      {/* Modals */}
      <GameModal
        gameStatus={gameStatus}
        remainingCount={remainingCount}
        onReset={resetGame}
      />

      <ValidationModal
        isOpen={validation !== null}
        title={validation?.title || ''}
        question={validation?.question || ''}
        correctAnswer={validation?.answer || ''}
        onSuccess={handleValidationSuccess}
        onCancel={handleValidationCancel}
        onError={handleValidationError}
      />

      {/* Particle effects */}
      {elimParticles && (
        <ElimParticles x={elimParticles.x} y={elimParticles.y} />
      )}
      <VictoryConfetti active={showConfetti} />
      <DefeatParticles active={showDefeatShake} />
    </div>
  );
}
