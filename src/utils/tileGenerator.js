const TILE_SIZE = 58;
const TILE_GAP = 50;

// Layer definitions: each layer is a grid offset from the previous one
const LAYER_CONFIGS = [
  { rows: 7, cols: 8, offsetX: 0, offsetY: 0 },
  { rows: 6, cols: 7, offsetX: 25, offsetY: 25 },
  { rows: 5, cols: 6, offsetX: 50, offsetY: 50 },
];

// Placeholder tile types for development (when no images are available)
const PLACEHOLDER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85929E', '#AED6F1',
  '#D7BDE2', '#A3E4D7', '#FAD7A0', '#ABEBC6', '#F5B7B1',
];

// Use import.meta.glob to auto-discover images from public/assets
const imageModules = import.meta.glob('/public/assets/*.{jpg,jpeg,png,JPG,JPEG,PNG,gif,webp}', { eager: true });
const imageUrls = Object.values(imageModules).map((m) => m.default);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rectsOverlap(a, b) {
  return !(
    a.x + TILE_SIZE <= b.x ||
    b.x + TILE_SIZE <= a.x ||
    a.y + TILE_SIZE <= b.y ||
    b.y + TILE_SIZE <= a.y
  );
}

export function getTileTypeCount() {
  return imageUrls.length > 0 ? imageUrls.length : 20;
}

export function getTileTypes() {
  if (imageUrls.length > 0) return imageUrls;
  return PLACEHOLDER_COLORS.map((color, i) => ({ color, label: `${i + 1}` }));
}

export function isTileUncovered(tile, allTiles) {
  return !allTiles.some(
    (other) =>
      other.id !== tile.id &&
      other.layer > tile.layer &&
      other.status === 'on_board' &&
      rectsOverlap(tile, other)
  );
}

export function generateTiles() {
  const types = getTileTypes();
  const typeCount = types.length;

  // Create 3 copies of each type
  let tiles = [];
  let id = 0;
  for (let typeIdx = 0; typeIdx < typeCount; typeIdx++) {
    for (let i = 0; i < 3; i++) {
      tiles.push({
        id: id++,
        type: typeIdx,
        layer: 0,
        row: 0,
        col: 0,
        x: 0,
        y: 0,
        status: 'on_board',
      });
    }
  }

  tiles = shuffle(tiles);

  // Collect all grid positions across layers
  const allPositions = [];
  LAYER_CONFIGS.forEach((config, layerIdx) => {
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        allPositions.push({
          layer: layerIdx,
          row: r,
          col: c,
          x: config.offsetX + c * TILE_GAP,
          y: config.offsetY + r * TILE_GAP,
        });
      }
    }
  });

  // Randomly select positions for all tiles
  const shuffledPositions = shuffle(allPositions);
  const selectedPositions = shuffledPositions.slice(0, tiles.length);

  // Assign positions to tiles
  const positionedTiles = tiles.map((tile, i) => ({
    ...tile,
    layer: selectedPositions[i].layer,
    row: selectedPositions[i].row,
    col: selectedPositions[i].col,
    x: selectedPositions[i].x,
    y: selectedPositions[i].y,
  }));

  // Sort by layer descending so upper layers render on top
  positionedTiles.sort((a, b) => b.layer - a.layer);

  return { tiles: positionedTiles, tileTypes: types };
}

export function getBoardDimensions(tiles) {
  if (tiles.length === 0) return { width: 400, height: 400 };
  const maxX = Math.max(...tiles.map((t) => t.x)) + TILE_SIZE;
  const maxY = Math.max(...tiles.map((t) => t.y)) + TILE_SIZE;
  return { width: maxX + 8, height: maxY + 8 };
}

export function shufflePositions(tiles) {
  // Collect all current on-board tiles grouped by layer
  const layerGroups = {};
  tiles
    .filter((t) => t.status === 'on_board')
    .forEach((t) => {
      if (!layerGroups[t.layer]) layerGroups[t.layer] = [];
      layerGroups[t.layer].push(t);
    });

  // For each layer, reassign positions randomly
  Object.entries(layerGroups).forEach(([layer, layerTiles]) => {
    const layerIdx = Number(layer);
    const config = LAYER_CONFIGS[layerIdx];
    // Generate all possible positions for this layer
    const positions = [];
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        positions.push({ row: r, col: c });
      }
    }
    // Shuffle and take needed count
    const shuffled = shuffle(positions);
    layerTiles.forEach((tile, i) => {
      const pos = shuffled[i];
      tile.row = pos.row;
      tile.col = pos.col;
      tile.x = config.offsetX + pos.col * TILE_GAP;
      tile.y = config.offsetY + pos.row * TILE_GAP;
    });
  });

  return [...tiles].sort((a, b) => b.layer - a.layer);
}

export { TILE_SIZE, TILE_GAP, LAYER_CONFIGS, imageUrls };
