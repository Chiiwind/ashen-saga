// ============================================================
//  Ashen Saga — TownScene
//  A walled town: cobbled square, a fountain, a few buildings,
//  NPCs with dialogue, and a gate back to the overworld.
// ============================================================
import MapScene from '../world/MapScene.js';
import { T } from '../world/tiles.js';
import { world } from '../world/state.js';

const MW = 26, MH = 18;

export default class TownScene extends MapScene {
  constructor() { super('town'); }

  build() {
    this.tileset = 'punyworld';           // tileset ground; buildings stay procedural
    const grid = this.makeMap();
    this.renderGround(grid);

    // enter just inside the gate
    this.spawnPlayer(this.gate.x, this.gate.y - 1);
    this.player.sprite.setFlipX(false);

    // gate back to the overworld
    this.addTrigger(this.gate.x, this.gate.y, () => {
      this.flashBanner('Leaving town...', 800);
      this.gotoScene('overworld');
    });

    // --- NPCs ------------------------------------------------
    this.addNpc({
      tx: 5, ty: 6, char: 'butcher', name: 'Innkeeper Bertwald',
      onInteract: () => this.showDialogue('Innkeeper Bertwald', [
        'Weary from the road? Sit by the fire a while.',
        'Ale\'s watered and the stew\'s thin, but the roof holds.',
        'You look rested. Off with you, then — and mind the Wilds.',
      ]),
    });
    this.addNpc({
      tx: 20, ty: 6, char: 'merchant', name: 'Pedlar Rosa',
      lines: [
        'Blades? Charms? Alas — my cart was picked clean by goblins.',
        'Come back when I\'ve wares again, friend.',
      ],
    });
    this.addNpc({
      tx: 13, ty: 14, char: 'knight', name: 'Watchman Corin',
      lines: [
        'The Ash Road\'s no place to wander alone these days.',
        'A warband gathers north of the bridge — a Chaos Marauder leads it.',
        'Cut down the stragglers first, then break the brute.',
      ],
    });
    this.addNpc({
      tx: 9, ty: 11, char: 'townsfolk_m', name: 'Villager', wander: true,
      lines: ['Bless me, a real adventurer! We\'ve prayed for one.'],
    });
    this.addNpc({
      tx: 17, ty: 10, char: 'townsfolk_f', name: 'Old Hedda', wander: true,
      lines: ['In my day the Wilds were quiet. Now? Only the brave walk them.'],
    });

    this.hint('Arrows/WASD: move    Space: talk    Step on the gate to leave');
    this.flashBanner('Aldenmoor', 2000);
    world.visitedTown = true;
  }

  makeMap() {
    const g = [];
    for (let y = 0; y < MH; y++) {
      g[y] = [];
      for (let x = 0; x < MW; x++) {
        g[y][x] = (x === 0 || y === 0 || x === MW - 1 || y === MH - 1) ? T.WALL : T.COBBLE;
      }
    }
    // gate in the bottom wall
    const gx = 13;
    g[MH - 1][gx] = T.EXIT;
    g[MH - 2][gx] = T.PATH;
    this.gate = { x: gx, y: MH - 1 };

    // buildings (roof block with a front wall + door); doors are decorative here
    const building = (bx, by, bw, bh) => {
      for (let y = by; y < by + bh; y++)
        for (let x = bx; x < bx + bw; x++) g[y][x] = (y === by + bh - 1) ? T.WALL : T.ROOF;
      g[by + bh - 1][bx + Math.floor(bw / 2)] = T.DOOR;
    };
    building(3, 2, 6, 4);     // inn (top-left)
    building(17, 2, 6, 4);    // shop (top-right)
    building(3, 12, 5, 4);    // house (lower-left)
    building(18, 12, 5, 4);   // house (lower-right)

    // central fountain (2x2 water ringed by flowers)
    g[8][12] = T.WATER; g[8][13] = T.WATER; g[9][12] = T.WATER; g[9][13] = T.WATER;
    [[11, 7], [14, 7], [11, 10], [14, 10], [12, 7], [13, 10]].forEach(([x, y]) => { g[y][x] = T.FLOWERS; });

    return g;
  }
}
