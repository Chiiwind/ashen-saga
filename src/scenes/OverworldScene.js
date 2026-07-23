// ============================================================
//  Ashen Saga — OverworldScene
//  A small world map: grass, a river with a bridge, mountains,
//  woods, a town you can enter, and roaming foes that start
//  battles on contact.
// ============================================================
import MapScene from '../world/MapScene.js';
import { T } from '../world/tiles.js';
import { ENCOUNTERS } from '../data.js';
import { world, saveGame } from '../world/state.js';

const MW = 34, MH = 22;
const PATH_X = 16;            // two-wide path runs up columns 16-17
const RIVER_Y = 11;          // two-tall river at rows 11-12

export default class OverworldScene extends MapScene {
  constructor() { super('overworld'); }

  build() {
    this.tileset = 'punyworld';           // render terrain from the CC0 tileset
    const grid = this.makeMap();
    this.renderGround(grid);

    // hero position: returning from town/battle, or default at the south road
    const spawn = world.playerTile || { x: PATH_X, y: MH - 3 };
    this.spawnPlayer(spawn.x, spawn.y);
    world.playerTile = { x: spawn.x, y: spawn.y };

    // town entrance
    this.addTrigger(this.townDoor.x, this.townDoor.y, () => {
      world.playerTile = { x: this.townDoor.x, y: this.townDoor.y + 1 };
      this.flashBanner('Entering town...', 900);
      this.gotoScene('town');
    });

    // roaming foes (skip any already beaten) — both stand on the road
    this.spawnFoe('goblin-pack', PATH_X, 9, 'foe', 'Goblin Pack', [ENCOUNTERS[0]]);
    this.spawnFoe('warband', PATH_X, 4, 'foe2', 'Chaos Warband', [ENCOUNTERS[1]]);

    // open the party / skill-tree menu
    this.input.keyboard.on('keydown-M', () => {
      if (this.dialogue || this._leaving || this.scene.isPaused()) return;
      this.scene.pause();
      this.scene.launch('partyMenu');
    });
    // open the equipment screen
    this.input.keyboard.on('keydown-I', () => {
      if (this.dialogue || this._leaving || this.scene.isPaused()) return;
      this.scene.pause();
      this.scene.launch('equip');
    });

    this.hint('Arrows/WASD move   Space talk   M skills   I equipment   walk into a foe to fight');
    this.flashBanner('The Ashen Wilds', 2000);
    if (world.party && world.party.length) saveGame();   // autosave on arriving/returning
  }

  spawnFoe(id, tx, ty, tex, name, encounters) {
    if (world.defeatedFoes.has(id)) return;
    const foe = this.addFoe({ id, tx, ty, tex, name, encounters });
    foe.onContact = () => {
      world.playerTile = { x: this.player.tx, y: this.player.ty };
      this.flashBanner(name + ' attacks!', 900);
      this.gotoScene('battle', {
        encounters, returnTo: 'overworld', foeId: id,
      });
    };
  }

  onFoeContact(foe) { foe.onContact(); }

  makeMap() {
    const g = [];
    for (let y = 0; y < MH; y++) {
      g[y] = [];
      for (let x = 0; x < MW; x++) {
        g[y][x] = (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) ? T.MTN : T.GRASS;
      }
    }
    // river across the middle
    for (let x = 1; x < MW - 1; x++) { g[RIVER_Y][x] = T.WATER; g[RIVER_Y + 1][x] = T.WATER; }
    // path up the centre
    for (let y = 1; y < MH - 1; y++) { g[y][PATH_X] = T.PATH; g[y][PATH_X + 1] = T.PATH; }
    // bridge where they cross
    g[RIVER_Y][PATH_X] = T.BRIDGE; g[RIVER_Y][PATH_X + 1] = T.BRIDGE;
    g[RIVER_Y + 1][PATH_X] = T.BRIDGE; g[RIVER_Y + 1][PATH_X + 1] = T.BRIDGE;

    // town building near the top, left of the path
    const bx = 6, by = 2, bw = 7, bh = 4;
    for (let y = by; y < by + bh; y++)
      for (let x = bx; x < bx + bw; x++) g[y][x] = (y === by + bh - 1) ? T.WALL : T.ROOF;
    const doorX = bx + 3;
    g[by + bh - 1][doorX] = T.DOOR;
    this.townDoor = { x: doorX, y: by + bh - 1 };
    // little path from town door down toward the main road
    for (let y = by + bh; y < RIVER_Y; y++) if (g[y][doorX] === T.GRASS) g[y][doorX] = T.PATH;
    for (let x = Math.min(doorX, PATH_X); x <= Math.max(doorX, PATH_X); x++)
      if (g[RIVER_Y - 1][x] === T.GRASS) g[RIVER_Y - 1][x] = T.PATH;

    // decorate: trees, hills, flowers (fixed coords, only over grass)
    const put = (list, code) => list.forEach(([x, y]) => { if (g[y] && g[y][x] === T.GRASS) g[y][x] = code; });
    put([[3, 4], [4, 8], [30, 4], [28, 17], [9, 18], [24, 6], [26, 15], [5, 15],
         [31, 18], [22, 18], [3, 12], [30, 13], [27, 9], [8, 6], [20, 3]], T.TREE);
    put([[3, 6], [3, 7], [31, 8], [31, 9], [26, 3], [4, 19]], T.MTN);
    put([[14, 17], [19, 16], [11, 9], [23, 13], [27, 18]], T.FLOWERS);
    return g;
  }
}
