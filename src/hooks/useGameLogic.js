import { useState, useCallback, useEffect, useRef } from 'react';
import { generateTiles, isTileUncovered, shufflePositions } from '../utils/tileGenerator';
import { initAudio, playClick, playMatch, playVictory, playDefeat, playShuffle, playUndo } from '../utils/soundManager';

const MAX_SLOTS = 7;
const MAX_UNDO = 3;

export function useGameLogic() {
  const [tiles, setTiles] = useState([]);
  const [slotTiles, setSlotTiles] = useState([]);
  const [tileTypes, setTileTypes] = useState([]);
  const [gameStatus, setGameStatus] = useState('playing');
  const [eliminatedCount, setEliminatedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [animatingIds, setAnimatingIds] = useState(new Set());
  const [eliminatingIds, setEliminatingIds] = useState(new Set());
  const [shakeSlot, setShakeSlot] = useState(false);
  const [undoRemaining, setUndoRemaining] = useState(MAX_UNDO);
  const [shuffling, setShuffling] = useState(false);

  // Particle trigger: { ids: Set, x: number, y: number } or null
  const [elimParticles, setElimParticles] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showDefeatShake, setShowDefeatShake] = useState(false);

  // Refs
  const tilesRef = useRef(tiles);
  const slotRef = useRef(slotTiles);
  const gameStatusRef = useRef(gameStatus);
  const busyRef = useRef(false);
  const undoHistoryRef = useRef([]);

  useEffect(() => { tilesRef.current = tiles; }, [tiles]);
  useEffect(() => { slotRef.current = slotTiles; }, [slotTiles]);
  useEffect(() => { gameStatusRef.current = gameStatus; }, [gameStatus]);

  const initGame = useCallback(() => {
    const { tiles: newTiles, tileTypes: types } = generateTiles();
    busyRef.current = false;
    tilesRef.current = newTiles;
    slotRef.current = [];
    gameStatusRef.current = 'playing';
    undoHistoryRef.current = [];
    setTiles(newTiles);
    setTileTypes(types);
    setSlotTiles([]);
    setGameStatus('playing');
    setEliminatedCount(0);
    setTotalCount(newTiles.length);
    setAnimatingIds(new Set());
    setEliminatingIds(new Set());
    setShakeSlot(false);
    setUndoRemaining(MAX_UNDO);
    setShuffling(false);
    setElimParticles(null);
    setShowConfetti(false);
    setShowDefeatShake(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Detect win
  useEffect(() => {
    if (gameStatus !== 'playing' || tiles.length === 0) return;
    const onBoard = tiles.filter(
      (t) =>
        t.status === 'on_board' ||
        t.status === 'animating' ||
        t.status === 'removing'
    );
    if (onBoard.length === 0 && slotTiles.length === 0) {
      const timer = setTimeout(() => {
        setGameStatus('won');
        setShowConfetti(true);
        playVictory();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [tiles, slotTiles, gameStatus]);

  const processSlotResult = useCallback(() => {
    const currentSlot = slotRef.current;
    if (currentSlot.length === 0) {
      busyRef.current = false;
      return;
    }

    const typeCounts = {};
    currentSlot.forEach((t) => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });

    const matchEntry = Object.entries(typeCounts).find(
      ([, count]) => count >= 3
    );

    if (matchEntry) {
      const matchTypeNum = Number(matchEntry[0]);
      const matchingIds = currentSlot
        .filter((t) => t.type === matchTypeNum)
        .slice(0, 3)
        .map((t) => t.id);

      setEliminatingIds(new Set(matchingIds));

      // Record match in undo history
      if (undoHistoryRef.current.length > 0) {
        const last = undoHistoryRef.current[undoHistoryRef.current.length - 1];
        last.matchedIds = matchingIds;
      }

      playMatch();

      // Trigger particles at a rough center of the slot area
      setElimParticles({ ids: new Set(matchingIds), x: window.innerWidth / 2, y: window.innerHeight - 120 });

      setTimeout(() => {
        setEliminatingIds(new Set());
        setElimParticles(null);
        setSlotTiles((current) =>
          current.filter((t) => !matchingIds.includes(t.id))
        );
        setTiles((ct) =>
          ct.map((t) =>
            matchingIds.includes(t.id)
              ? { ...t, status: 'eliminated' }
              : t
          )
        );
        setEliminatedCount((c) => c + 3);
        busyRef.current = false;
      }, 400);
      return;
    }

    if (currentSlot.length > MAX_SLOTS) {
      playDefeat();
      setShakeSlot(true);
      setShowDefeatShake(true);
      setTimeout(() => {
        setShakeSlot(false);
        setShowDefeatShake(false);
        setGameStatus('lost');
        busyRef.current = false;
      }, 500);
      return;
    }

    busyRef.current = false;
  }, []);

  const handleTileClick = useCallback(
    (tileId) => {
      if (gameStatusRef.current !== 'playing') return;
      if (busyRef.current) return;

      const currentTiles = tilesRef.current;
      const tile = currentTiles.find((t) => t.id === tileId);
      if (!tile || tile.status !== 'on_board') return;
      if (!isTileUncovered(tile, currentTiles)) return;

      busyRef.current = true;

      // Init audio on first interaction
      initAudio();
      playClick();

      // Save snapshot for undo
      undoHistoryRef.current.push({
        tileId: tile.id,
        tileSnapshot: {
          id: tile.id,
          type: tile.type,
          layer: tile.layer,
          row: tile.row,
          col: tile.col,
          x: tile.x,
          y: tile.y,
          status: 'on_board',
        },
        matchedIds: null,
      });
      // Keep undo history at most MAX_UNDO entries
      if (undoHistoryRef.current.length > MAX_UNDO) {
        undoHistoryRef.current.shift();
      }

      setTiles((prev) =>
        prev.map((t) =>
          t.id === tileId ? { ...t, status: 'animating' } : t
        )
      );
      setAnimatingIds((ids) => new Set([...ids, tileId]));

      setTimeout(() => {
        setAnimatingIds((ids) => {
          const next = new Set(ids);
          next.delete(tileId);
          return next;
        });

        setTiles((prev) =>
          prev.map((t) =>
            t.id === tileId ? { ...t, status: 'removing' } : t
          )
        );

        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) =>
              t.id === tileId ? { ...t, status: 'in_slot' } : t
            )
          );

          setSlotTiles((prev) => [...prev, { ...tile, status: 'in_slot' }]);

          setTimeout(() => {
            processSlotResult();
          }, 50);
        }, 180);
      }, 160);
    },
    [processSlotResult]
  );

  // ── Undo ────────────────────────────────────────────
  const doUndo = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return false;
    if (busyRef.current) return false;
    if (undoRemaining <= 0) return false;
    if (undoHistoryRef.current.length === 0) return false;

    const entry = undoHistoryRef.current.pop();
    busyRef.current = true;
    playUndo();

    // If this move caused a match, restore all matched tiles
    if (entry.matchedIds && entry.matchedIds.length > 0) {
      // Restore eliminated tiles: put them back in slot
      const matchedSet = new Set(entry.matchedIds);

      setTiles((prev) =>
        prev.map((t) =>
          matchedSet.has(t.id)
            ? { ...t, status: 'in_slot' } // will be in slot
            : t
        )
      );

      // Rebuild slot: remove matched tiles from eliminated, add them back
      setSlotTiles((prev) => {
        // Get the matched tiles data from tilesRef
        const restored = entry.matchedIds.map((id) => {
          const t = tilesRef.current.find((tt) => tt.id === id);
          return t ? { ...t, status: 'in_slot' } : null;
        }).filter(Boolean);
        return [...prev, ...restored];
      });

      setEliminatedCount((c) => c - 3);

      // Then restore the originally-clicked tile to board (undo the undo entry's match effect)
      setTimeout(() => {
        setSlotTiles((prev) =>
          prev.filter((t) => t.id !== entry.tileId)
        );
        setTiles((prev) =>
          prev.map((t) =>
            t.id === entry.tileId
              ? { ...entry.tileSnapshot, status: 'on_board' }
              : t
          )
        );
        setUndoRemaining((c) => c - 1);
        busyRef.current = false;
      }, 50);
      return true;
    }

    // No match — simple undo: remove tile from slot, restore to board
    setSlotTiles((prev) => prev.filter((t) => t.id !== entry.tileId));
    setTiles((prev) =>
      prev.map((t) =>
        t.id === entry.tileId
          ? { ...entry.tileSnapshot, status: 'on_board' }
          : t
      )
    );
    setUndoRemaining((c) => c - 1);
    busyRef.current = false;
    return true;
  }, [undoRemaining]);

  // ── Shuffle ─────────────────────────────────────────
  const doShuffle = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return false;
    if (busyRef.current) return false;

    busyRef.current = true;
    playShuffle();
    setShuffling(true);

    setTimeout(() => {
      setTiles((prev) => shufflePositions(prev));
      setTimeout(() => {
        setShuffling(false);
        busyRef.current = false;
      }, 400);
    }, 50);
    return true;
  }, []);

  const resetGame = useCallback(() => {
    initGame();
  }, [initGame]);

  const remainingCount = totalCount - eliminatedCount;

  return {
    tiles,
    slotTiles,
    tileTypes,
    gameStatus,
    eliminatedCount,
    totalCount,
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
  };
}
