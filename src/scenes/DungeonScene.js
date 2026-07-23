// ============================================================
//  Ashen Saga — DungeonScene  (Act I: the Ashmoor Mine)
//  A stone gauntlet of rooms up to Grukk Skullsplitter. Each
//  room's greenskins block the corridor, so you fight to climb.
// ============================================================
import MapScene from '../world/MapScene.js';
import { T } from '../world/tiles.js';
import { ACT1 } from '../data.js';
import { world, saveGame } from '../world/state.js';

const MW = 22, MH = 30;
const COR = 11;   // central 1-wide corridor column

export default class DungeonScene extends MapScene {
  constructor() { super('dungeon'); }

  build() {
    const grid = this.makeMap();     // procedural stone (no tileset)
    this.renderGround(grid);

    const spawn = world.dungeonTile || { x: COR, y: 26 };
    this.spawnPlayer(spawn.x, spawn.y);
    this.player.sprite.setFlipX(false);
    world.dungeonTile = { x: spawn.x, y: spawn.y };

    // exit back to the overworld (bottom of the entry room)
    this.addTrigger(COR, 28, () => { this.flashBanner('Leaving the mine...', 800); this.gotoScene('overworld'); });

    // room foes block the corridor — fight to climb
    this.spawnFoe('mine-b', COR, 20, 'foe',  'Warren Pit',  [ACT1.minePit]);
    this.spawnFoe('mine-c', COR, 14, 'foe2', 'Orc Patrol',  [ACT1.orcPatrol]);
    this.spawnFoe('mine-d', COR, 8,  'foe2', 'Ore Cavern',  [ACT1.oreCavern]);
    this.spawnFoe('grukk',  COR, 3,  'foe2', 'Grukk Skullsplitter', [ACT1.warboss], 'act1');

    this.enableMenus();
    this.hint('Arrows/WASD move   M skills   I gear   climb the mine and slay Grukk');
    this.flashBanner('Ashmoor Mine', 2000);
    if (world.party && world.party.length) saveGame();   // checkpoint on entry/return
  }

  spawnFoe(id, tx, ty, tex, name, encounters, ending) {
    if (world.defeatedFoes.has(id)) return;
    const foe = this.addFoe({ id, tx, ty, tex, name, encounters });
    foe.onContact = () => {
      world.dungeonTile = { x: this.player.tx, y: this.player.ty };
      this.flashBanner(name + '!', 900);
      this.gotoScene('battle', { encounters, returnTo: 'dungeon', foeId: id, ending });
    };
  }

  onFoeContact(foe) { foe.onContact(); }

  makeMap() {
    const g = [];
    for (let y = 0; y < MH; y++) { g[y] = []; for (let x = 0; x < MW; x++) g[y][x] = T.WALL; }
    const room = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = T.FLOOR; };
    for (let y = 2; y <= 28; y++) g[y][COR] = T.FLOOR;   // corridor
    room(7, 24, 15, 28);   // A — entry
    room(6, 18, 16, 22);   // B — warren pit
    room(6, 12, 16, 16);   // C — orc patrol
    room(6, 6, 16, 10);    // D — ore cavern
    room(6, 1, 16, 5);     // E — Grukk's throne
    return g;
  }
}
