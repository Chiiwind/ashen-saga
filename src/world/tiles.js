// ============================================================
//  Ashen Saga — tile definitions + drawing
//  Maps are 2D arrays of these codes. Ground is drawn once into
//  a Graphics; walkability comes from WALKABLE.
// ============================================================
export const TILE = 32;

export const T = {
  GRASS: 0, PATH: 1, WATER: 2, TREE: 3, MTN: 4, BRIDGE: 5,
  DOOR: 6, EXIT: 7, FLOOR: 8, WALL: 9, ROOF: 10, COBBLE: 11, FLOWERS: 12,
};

export const WALKABLE = {
  [T.GRASS]: true, [T.PATH]: true, [T.WATER]: false, [T.TREE]: false,
  [T.MTN]: false, [T.BRIDGE]: true, [T.DOOR]: true, [T.EXIT]: true,
  [T.FLOOR]: true, [T.WALL]: false, [T.ROOF]: false, [T.COBBLE]: true,
  [T.FLOWERS]: true,
};

// deterministic per-tile jitter so grass/paths aren't uniform
function hash(x, y) { return ((x * 73856093) ^ (y * 19349663)) >>> 0; }

function base(g, px, py, color) { g.fillStyle(color, 1); g.fillRect(px, py, TILE, TILE); }

function specks(g, px, py, color, n = 4) {
  g.fillStyle(color, 1);
  const h = hash(px, py);
  for (let i = 0; i < n; i++) {
    const sx = px + ((h >> (i * 3)) % TILE);
    const sy = py + ((h >> (i * 3 + 2)) % TILE);
    g.fillRect(sx, sy, 2, 2);
  }
}

function grid2(g, px, py, color) {
  g.lineStyle(1, color, 0.5);
  g.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
  g.lineStyle();
}

export function drawTile(g, code, px, py) {
  switch (code) {
    case T.GRASS: base(g, px, py, 0x3f7d3a); specks(g, px, py, 0x357033); break;
    case T.PATH:  base(g, px, py, 0xb39a68); specks(g, px, py, 0xa88f5a, 5); break;
    case T.COBBLE: base(g, px, py, 0x8a8578); grid2(g, px, py, 0x6e6a5e); break;
    case T.FLOWERS:
      base(g, px, py, 0x3f7d3a);
      g.fillStyle(0xffd24a, 1); g.fillRect(px + 8, py + 10, 3, 3);
      g.fillStyle(0xd86aa0, 1); g.fillRect(px + 20, py + 18, 3, 3);
      g.fillStyle(0x8ab6ff, 1); g.fillRect(px + 14, py + 22, 3, 3);
      break;
    case T.WATER:
      base(g, px, py, 0x2f5aa0);
      g.fillStyle(0x4a7ad0, 0.6);
      g.fillRect(px + 4, py + 8, 10, 2); g.fillRect(px + 18, py + 20, 9, 2);
      break;
    case T.BRIDGE:
      base(g, px, py, 0x8a6a3a);
      g.fillStyle(0x6b4f28, 1);
      for (let i = 0; i < TILE; i += 8) g.fillRect(px + i, py, 2, TILE);
      break;
    case T.FLOOR: base(g, px, py, 0x6a5238); grid2(g, px, py, 0x53412c); break;

    case T.TREE:
      base(g, px, py, 0x3f7d3a);
      g.fillStyle(0x5a3d22, 1); g.fillRect(px + TILE / 2 - 2, py + 18, 4, 12); // trunk
      g.fillStyle(0x1f4a24, 1); g.fillCircle(px + TILE / 2, py + 13, 12);       // canopy shadow
      g.fillStyle(0x2f6b32, 1); g.fillCircle(px + TILE / 2 - 3, py + 11, 9);
      g.fillStyle(0x3f8a3e, 1); g.fillCircle(px + TILE / 2 + 3, py + 12, 7);
      break;
    case T.MTN:
      base(g, px, py, 0x3a5a34);
      g.fillStyle(0x4a4a52, 1); g.fillTriangle(px + 4, py + 30, px + TILE / 2, py + 4, px + TILE - 4, py + 30);
      g.fillStyle(0x5c5c66, 1); g.fillTriangle(px + 12, py + 22, px + TILE / 2, py + 8, px + 20, py + 22);
      g.fillStyle(0xdfe0e6, 1); g.fillTriangle(px + TILE / 2 - 4, py + 12, px + TILE / 2, py + 6, px + TILE / 2 + 4, py + 12);
      break;
    case T.WALL:
      base(g, px, py, 0x6a6560);
      g.fillStyle(0x565149, 1);
      g.fillRect(px, py + 10, TILE, 2); g.fillRect(px, py + 22, TILE, 2);
      g.fillRect(px + 15, py, 2, 10); g.fillRect(px + 7, py + 12, 2, 10); g.fillRect(px + 23, py + 12, 2, 10);
      break;
    case T.ROOF:
      base(g, px, py, 0x7a3030);
      g.fillStyle(0x933a3a, 1);
      for (let r = 0; r < TILE; r += 8) g.fillRect(px, py + r, TILE, 4);
      g.fillStyle(0x5a2020, 1); g.fillRect(px, py, TILE, 2);
      break;
    case T.DOOR:
      base(g, px, py, 0x6a6560);
      g.fillStyle(0x3a2a18, 1); g.fillRect(px + 8, py + 8, 16, 24);
      g.fillStyle(0x5a3d22, 1); g.fillRect(px + 10, py + 10, 12, 22);
      g.fillStyle(0xffd24a, 1); g.fillRect(px + 19, py + 20, 2, 2); // knob
      break;
    case T.EXIT:
      base(g, px, py, 0xb39a68);
      g.fillStyle(0x8a7448, 1); g.fillRect(px, py, TILE, 6);
      g.fillStyle(0xffe08a, 0.25); g.fillRect(px, py, TILE, TILE);
      break;
    default: base(g, px, py, 0x3f7d3a);
  }
}
