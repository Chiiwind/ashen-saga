// ============================================================
//  Ashen Saga — OverworldScene  (Act I: the Ashen Wilds)
//  Grass, a river with a bridge, the village of Aldenmoor, the
//  mouth of the Ashmoor Mine, and roaming greenskins.
// ============================================================
import MapScene from '../world/MapScene.js';
import { T } from '../world/tiles.js';
import { ACT1 } from '../data.js';
import { world, saveGame } from '../world/state.js';

const MW = 34, MH = 22;
const PATH_X = 16;
const RIVER_Y = 11;

export default class OverworldScene extends MapScene {
  constructor() { super('overworld'); }

  build() {
    this.tileset = 'punyworld';
    const grid = this.makeMap();
    this.renderGround(grid);

    const spawn = world.playerTile || { x: PATH_X, y: MH - 3 };
    this.spawnPlayer(spawn.x, spawn.y);
    world.playerTile = { x: spawn.x, y: spawn.y };

    // town entrance
    this.addTrigger(this.townDoor.x, this.townDoor.y, () => {
      world.playerTile = { x: this.townDoor.x, y: this.townDoor.y + 1 };
      this.flashBanner('Entering Aldenmoor...', 900);
      this.gotoScene('town');
    });
    // Ashmoor Mine entrance — always drop in at the top of floor 0
    this.addTrigger(this.mineDoor.x, this.mineDoor.y, () => {
      world.playerTile = { x: this.mineDoor.x, y: this.mineDoor.y + 1 };
      world.dungeonFloor = 0; world.dungeonEntry = '<'; world.dungeonTile = null;
      this.flashBanner('The Ashmoor Mine...', 900);
      this.gotoScene('dungeon');
    });

    // The Wilds crawl with greenskins — random battles as you travel.
    this.enableEncounters([ACT1.goblinAmbush, ACT1.goblinAmbush, ACT1.orcPatrol], 9, 16, 'playerTile');

    this.enableMenus();
    this.hint('Arrows/WASD move   Space talk   M skills   I gear   greenskins roam the wilds');
    this.flashBanner('The Ashen Wilds', 2000);
    if (world.party && world.party.length) saveGame();
  }

  makeMap() {
    const g = [];
    for (let y = 0; y < MH; y++) {
      g[y] = [];
      for (let x = 0; x < MW; x++) g[y][x] = (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) ? T.MTN : T.GRASS;
    }
    for (let x = 1; x < MW - 1; x++) { g[RIVER_Y][x] = T.WATER; g[RIVER_Y + 1][x] = T.WATER; }
    for (let y = 1; y < MH - 1; y++) { g[y][PATH_X] = T.PATH; g[y][PATH_X + 1] = T.PATH; }
    g[RIVER_Y][PATH_X] = T.BRIDGE; g[RIVER_Y][PATH_X + 1] = T.BRIDGE;
    g[RIVER_Y + 1][PATH_X] = T.BRIDGE; g[RIVER_Y + 1][PATH_X + 1] = T.BRIDGE;

    // town building (top-left)
    const bx = 6, by = 2, bw = 7, bh = 4;
    for (let y = by; y < by + bh; y++)
      for (let x = bx; x < bx + bw; x++) g[y][x] = (y === by + bh - 1) ? T.WALL : T.ROOF;
    const doorX = bx + 3;
    g[by + bh - 1][doorX] = T.DOOR;
    this.townDoor = { x: doorX, y: by + bh - 1 };
    for (let y = by + bh; y < RIVER_Y; y++) if (g[y][doorX] === T.GRASS) g[y][doorX] = T.PATH;
    for (let x = Math.min(doorX, PATH_X); x <= Math.max(doorX, PATH_X); x++)
      if (g[RIVER_Y - 1][x] === T.GRASS) g[RIVER_Y - 1][x] = T.PATH;

    // Ashmoor Mine mouth at the top of the road (framed by rock)
    for (const [x, y] of [[PATH_X - 1, 1], [PATH_X, 1], [PATH_X + 1, 1], [PATH_X + 2, 1], [PATH_X - 1, 2], [PATH_X + 2, 2]]) if (g[y]) g[y][x] = T.MTN;
    g[2][PATH_X] = T.DOOR;
    this.mineDoor = { x: PATH_X, y: 2 };

    const put = (list, code) => list.forEach(([x, y]) => { if (g[y] && g[y][x] === T.GRASS) g[y][x] = code; });
    put([[3, 4], [4, 8], [30, 4], [28, 17], [9, 18], [24, 6], [26, 15], [5, 15],
         [31, 18], [22, 18], [3, 12], [30, 13], [27, 9], [8, 6], [20, 3]], T.TREE);
    put([[3, 6], [3, 7], [31, 8], [31, 9], [26, 3], [4, 19]], T.MTN);
    put([[14, 17], [19, 16], [11, 9], [23, 13], [27, 18]], T.FLOWERS);
    return g;
  }
}
