// ============================================================
//  Ashen Saga — DungeonScene  (Act I: the Ashmoor Mine)
//  A four-screen mine: descend floor by floor via stairs, take
//  split paths to treasure chests, fight random greenskin bands
//  on the way, break the odd set-piece brute, and finally reach
//  Grukk Skullsplitter's throne at the bottom.
//    world.dungeonFloor  = which screen we're on
//    world.dungeonEntry  = which stair-mark to arrive at (on floor change)
//    world.dungeonTile   = exact spot to resume at (returning from battle)
// ============================================================
import MapScene from '../world/MapScene.js';
import { T } from '../world/tiles.js';
import { ACT1 } from '../data.js';
import { world, saveGame } from '../world/state.js';

// A tiny carving helper: start solid, cut rooms/corridors, drop marks.
class Carver {
  constructor(w, h) {
    this.w = w; this.h = h; this.g = []; this.marks = {};
    for (let y = 0; y < h; y++) { this.g[y] = []; for (let x = 0; x < w; x++) this.g[y][x] = T.WALL; }
  }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  room(x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (this.in(x, y)) this.g[y][x] = T.FLOOR; }
  hRow(y, x0, x1) { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) if (this.in(x, y)) this.g[y][x] = T.FLOOR; }
  vCol(x, y0, y1) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) if (this.in(x, y)) this.g[y][x] = T.FLOOR; }
  at(ch, x, y) { if (this.in(x, y)) this.g[y][x] = T.FLOOR; this.marks[ch] = { x, y }; }
}

// --- the four screens --------------------------------------
const FLOORS = [
  {
    name: 'Ashmoor Mine — The Descent',
    carve: (c) => {
      c.room(11, 14, 15, 16); c.at('<', 13, 15);   // entrance from the surface
      c.vCol(13, 4, 15);                            // central spine
      c.hRow(9, 4, 21);                             // mid hall (splits left/right)
      c.room(3, 6, 7, 11);  c.at('1', 4, 7);        // left store — chest
      c.room(18, 6, 22, 11); c.at('2', 21, 7);      // right store — chest
      c.room(10, 3, 16, 5); c.at('>', 13, 4);       // stairs down
    },
    w: 26, h: 18,
    links: [{ mark: '<', toOverworld: true }, { mark: '>', floor: 1, at: '<', down: true }],
    chests: [
      { mark: '1', loot: [{ gold: 45 }, { item: 'iron_dagger' }] },
      { mark: '2', loot: [{ gold: 30 }, { item: 'padded_robe' }] },
    ],
    foes: [],
    encounters: () => [ACT1.goblinAmbush, ACT1.goblinAmbush, ACT1.minePit],
    rate: [5, 10],
  },
  {
    name: 'Ashmoor Mine — The Warrens',
    carve: (c) => {
      c.room(1, 1, 4, 3); c.at('<', 2, 2);          // arrive from above
      c.hRow(2, 4, 24);                             // upper route
      c.room(23, 1, 26, 3); c.at('1', 25, 1);       // upper chest nook
      c.vCol(24, 2, 9);                             // upper route drops to the chamber
      c.vCol(9, 2, 13);                             // lower route splits down
      c.hRow(13, 4, 20);                            // lower route runs east
      c.room(2, 12, 4, 14); c.at('2', 3, 13);       // lower chest nook
      c.room(19, 8, 25, 12);                        // reconverging chamber
      c.vCol(20, 12, 13);                           // lower route into chamber
      c.room(21, 14, 24, 16); c.at('>', 22, 15);    // stairs-down alcove
      c.at('a', 22, 13);                            // brute guards the 1-wide way down
      c.vCol(22, 13, 14);
    },
    w: 28, h: 18,
    links: [{ mark: '<', floor: 0, at: '>' }, { mark: '>', floor: 2, at: '<', down: true }],
    chests: [
      { mark: '1', loot: [{ gold: 60 }, { item: 'ring_vigor' }] },
      { mark: '2', loot: [{ gold: 40 }, { item: 'iron_axe' }] },
    ],
    foes: [
      { mark: 'a', id: 'warren-brute', tex: 'foe2', name: 'Warren Brute', enc: () => [ACT1.oreCavern] },
    ],
    encounters: () => [ACT1.goblinAmbush, ACT1.orcPatrol, ACT1.minePit],
    rate: [6, 11],
  },
  {
    name: 'Ashmoor Mine — Ore Caverns',
    carve: (c) => {
      c.room(1, 1, 4, 3); c.at('<', 2, 2);          // arrive from above
      c.vCol(3, 3, 6);
      c.room(2, 6, 12, 11);                         // west cavern
      c.at('1', 2, 10);                             // chest in the west
      c.hRow(8, 12, 15);                            // link west -> east
      c.room(15, 4, 25, 11);                        // east cavern
      c.at('a', 20, 6);                             // roaming ogre (optional)
      c.room(24, 12, 26, 15); c.at('3', 25, 14);    // east chest nook
      c.vCol(25, 11, 12);
      c.room(5, 13, 11, 18);                        // south hall
      c.vCol(8, 11, 13);                            // west cavern -> south hall
      c.at('2', 6, 17);                             // chest in the south
      c.hRow(16, 11, 22);                           // south hall -> descent
      c.room(20, 14, 24, 18); c.at('>', 22, 16);    // stairs down to the throne
    },
    w: 28, h: 20,
    links: [{ mark: '<', floor: 1, at: '>' }, { mark: '>', floor: 3, at: '<', down: true }],
    chests: [
      { mark: '1', loot: [{ gold: 70 }, { item: 'chainmail' }] },
      { mark: '2', loot: [{ gold: 55 }, { item: 'ash_staff' }] },
      { mark: '3', loot: [{ gold: 90 }, { item: 'power_band' }] },
    ],
    foes: [
      { mark: 'a', id: 'cavern-ogre', tex: 'foe2', name: 'Cavern Ogre', enc: () => [ACT1.oreCavern] },
    ],
    encounters: () => [ACT1.orcPatrol, ACT1.oreCavern, ACT1.mineMouth],
    rate: [6, 11],
  },
  {
    name: "Grukk's Throne",
    carve: (c) => {
      c.room(2, 12, 5, 14); c.at('<', 3, 13);       // arrive from above
      c.hRow(13, 3, 11);
      c.vCol(11, 4, 13);                            // approach to the throne
      c.room(3, 2, 19, 8);                          // throne hall
      c.at('B', 11, 4);                             // Grukk, on the dais
      c.at('1', 4, 3); c.at('2', 18, 3);            // flanking spoils
    },
    w: 22, h: 16,
    links: [{ mark: '<', floor: 2, at: '>' }],
    chests: [
      { mark: '1', loot: [{ gold: 120 }, { item: 'steel_longsword' }] },
      { mark: '2', loot: [{ gold: 120 }, { item: 'greater_vigor' }] },
    ],
    foes: [
      { mark: 'B', id: 'grukk', tex: 'foe2', name: 'Grukk Skullsplitter', enc: () => [ACT1.warboss], ending: 'act1' },
    ],
    encounters: null,   // no random battles in the boss room
    rate: [0, 0],
  },
];

export default class DungeonScene extends MapScene {
  constructor() { super('dungeon'); }

  build() {
    this.posKey = 'dungeonTile';
    const fi = Math.max(0, Math.min(FLOORS.length - 1, world.dungeonFloor || 0));
    const floor = FLOORS[fi];

    const c = new Carver(floor.w, floor.h);
    floor.carve(c);
    this.marks = c.marks;
    this.renderGround(c.g);

    // spawn: exact battle-return spot if we have one, else the arrival stair
    const entry = world.dungeonTile
      || c.marks[world.dungeonEntry] || c.marks['<'] || { x: 1, y: 1 };
    this.spawnPlayer(entry.x, entry.y);
    this.player.sprite.setFlipX(false);
    world.dungeonTile = { x: entry.x, y: entry.y };

    // stairs / links
    (floor.links || []).forEach(link => {
      const m = c.marks[link.mark];
      if (m) this.addTrigger(m.x, m.y, () => this.takeStairs(link));
    });

    // chests
    (floor.chests || []).forEach(ch => {
      const m = c.marks[ch.mark];
      if (m) this.addChest({ tx: m.x, ty: m.y, id: fi + ':' + ch.mark, loot: ch.loot });
    });

    // set-piece foes (brutes / Grukk)
    (floor.foes || []).forEach(f => {
      const m = c.marks[f.mark];
      if (m) this.spawnFoe(f.id, m.x, m.y, f.tex, f.name, f.enc(), f.ending);
    });

    // random encounters
    if (floor.encounters) this.enableEncounters(floor.encounters(), floor.rate[0], floor.rate[1], 'dungeonTile');

    this.enableMenus();
    this.hint('Arrows/WASD move   Space open/talk   M skills   I gear   step on stairs to travel');
    this.flashBanner(floor.name, 2000);
    if (world.party && world.party.length) saveGame();
  }

  takeStairs(link) {
    if (this._leaving) return;
    if (link.toOverworld) {
      world.dungeonFloor = 0; world.dungeonTile = null;
      this.flashBanner('Leaving the mine...', 800);
      this.gotoScene('overworld');
      return;
    }
    world.dungeonFloor = link.floor;
    world.dungeonEntry = link.at;
    world.dungeonTile = null;                    // arrive at the target stair, not the old spot
    this.flashBanner(link.down ? 'Descending deeper...' : 'Climbing back up...', 700);
    this.gotoScene('dungeon');
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
}
