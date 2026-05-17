import { memo } from 'react';
import { TILE_SIZE, isTileUncovered } from '../utils/tileGenerator';

const Tile = memo(function Tile({
  tile,
  tileTypes,
  isAnimating,
  isEliminating,
  isShuffling,
  allTiles,
  onClick,
}) {
  const uncovered =
    tile.status === 'on_board' && isTileUncovered(tile, allTiles);
  const isCovered = tile.status === 'on_board' && !uncovered;
  const isRemoving = tile.status === 'animating' || tile.status === 'removing';

  if (tile.status === 'eliminated' || tile.status === 'in_slot') return null;

  const imageUrl = tileTypes[tile.type];
  const isImage = typeof imageUrl === 'string' && imageUrl.startsWith('/');

  const handleClick = () => {
    if (tile.status === 'on_board' && uncovered) {
      onClick(tile.id);
    }
  };

  let extraClass = '';
  if (isAnimating || isRemoving) {
    extraClass = 'animate-scale-out pointer-events-none';
  } else if (isCovered) {
    extraClass = 'brightness-[0.35] saturate-[0.3] tile-shadow-covered cursor-default';
  } else if (uncovered) {
    extraClass = 'tile-shadow cursor-pointer hover:brightness-110 active:scale-95 transition-all duration-150';
  }

  return (
    <div
      onClick={handleClick}
      className={`absolute rounded-lg overflow-hidden select-none ${extraClass}`}
      style={{
        left: tile.x,
        top: tile.y,
        width: TILE_SIZE,
        height: TILE_SIZE,
        zIndex: tile.layer * 10 + tile.row + tile.col,
        transition: isShuffling
          ? 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.15s, filter 0.15s, box-shadow 0.15s'
          : 'transform 0.15s, filter 0.15s, box-shadow 0.15s',
      }}
    >
      {isImage ? (
        <img
          src={imageUrl}
          alt={`tile-${tile.type}`}
          className="w-full h-full object-cover rounded-lg"
          draggable={false}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center rounded-lg text-white font-bold text-lg"
          style={{ background: imageUrl?.color || '#555' }}
        >
          <span className="drop-shadow-md">{imageUrl?.label || '?'}</span>
        </div>
      )}
      {/* Subtle inner highlight */}
      <div className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.15)',
        }}
      />
    </div>
  );
});

export default Tile;
