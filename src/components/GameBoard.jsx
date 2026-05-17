import { useMemo, useRef } from 'react';
import Tile from './Tile';
import { getBoardDimensions } from '../utils/tileGenerator';

export default function GameBoard({
  tiles,
  tileTypes,
  animatingIds,
  eliminatingIds,
  shuffling,
  onTileClick,
}) {
  const boardRef = useRef(null);
  const dims = useMemo(() => getBoardDimensions(tiles), [tiles]);

  const activeTiles = useMemo(
    () => tiles.filter((t) => t.status !== 'eliminated' && t.status !== 'in_slot'),
    [tiles]
  );

  return (
    <div
      ref={boardRef}
      className="relative mx-auto"
      style={{
        width: Math.max(dims.width, 320),
        height: Math.max(dims.height, 280),
      }}
    >
      {activeTiles.map((tile) => (
        <Tile
          key={tile.id}
          tile={tile}
          tileTypes={tileTypes}
          isAnimating={animatingIds.has(tile.id)}
          isEliminating={eliminatingIds.has(tile.id)}
          isShuffling={shuffling}
          allTiles={tiles}
          onClick={onTileClick}
        />
      ))}
    </div>
  );
}
