import { memo } from 'react';
import { TILE_SIZE } from '../utils/tileGenerator';

const SLOT_SIZE = 52;

const SlotTile = memo(function SlotTile({ tile, tileTypes, isEliminating }) {
  const imageUrl = tileTypes[tile.type];
  const isImage = typeof imageUrl === 'string' && imageUrl.startsWith('/');

  let className =
    'flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300';
  if (isEliminating) {
    className += ' animate-pop';
  } else {
    className += ' animate-slide-in tile-shadow';
  }

  return (
    <div
      className={className}
      style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
    >
      {isImage ? (
        <img
          src={imageUrl}
          alt={`slot-${tile.type}`}
          className="w-full h-full object-cover rounded-lg"
          draggable={false}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center rounded-lg text-white font-bold text-base"
          style={{ background: imageUrl?.color || '#555' }}
        >
          <span className="drop-shadow-md">{imageUrl?.label || '?'}</span>
        </div>
      )}
    </div>
  );
});

export default function TileSlot({
  slotTiles,
  tileTypes,
  eliminatingIds,
  shakeSlot,
  maxSlots,
}) {
  return (
    <div className="w-full px-2">
      <div
        className={`glass-strong rounded-2xl mx-auto flex items-center gap-1.5 p-2 min-h-[68px] transition-all duration-300 ${
          shakeSlot ? 'animate-shake border-red-400/50' : 'border-white/10'
        }`}
        style={{
          maxWidth: SLOT_SIZE * maxSlots + (maxSlots - 1) * 6 + 24,
          border: shakeSlot
            ? '2px solid rgba(248,113,113,0.5)'
            : '1px solid rgba(255,255,255,0.12)',
        }}
      >
        {/* Fixed 7 slot positions */}
        {Array.from({ length: maxSlots }).map((_, i) => {
          const tile = slotTiles[i];
          return (
            <div
              key={i}
              className="flex-shrink-0 rounded-lg transition-all duration-300"
              style={{ width: SLOT_SIZE, height: SLOT_SIZE }}
            >
              {tile && (
                <SlotTile
                  tile={tile}
                  tileTypes={tileTypes}
                  isEliminating={eliminatingIds.has(tile.id)}
                />
              )}
              {!tile && (
                <div
                  className="w-full h-full rounded-lg border border-dashed transition-colors"
                  style={{
                    borderColor: 'rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
