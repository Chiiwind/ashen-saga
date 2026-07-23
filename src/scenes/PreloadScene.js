// ============================================================
//  Ashen Saga — PreloadScene
//  Loads the sprite atlas (0x72 DungeonTileset II, CC0) once and
//  registers idle/run animations for every character we use, then
//  hands off to character creation.
// ============================================================

import { ALL_MAP_CHARS } from '../world/mapChars.js';

// 0x72 atlas characters used in battle (heroes + monsters)
export const ATLAS_CHARS = [
  'knight_m', 'knight_f', 'wizard_m', 'wizard_f', 'elf_m', 'elf_f', 'lizard_m', 'lizard_f',
  'goblin', 'orc_warrior', 'orc_shaman', 'masked_orc', 'ogre', 'chort', 'imp',
  'necromancer', 'skeleton', 'big_demon', 'big_zombie',
];

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('preload'); }

  preload() {
    this.load.atlas('dungeon', 'assets/dungeon.png', 'assets/dungeon.json');  // 0x72 (battle)
    this.load.atlas('npc', 'assets/npc.png', 'assets/npc.json');              // superdark (overworld/town)
    this.add.text(480, 270, 'Loading...', {
      fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#e8e0d0',
    }).setOrigin(0.5);
  }

  create() {
    for (const c of ATLAS_CHARS) {
      this.makeAnim('dungeon', c, 'idle', 6);
      this.makeAnim('dungeon', c, 'run', 10);
    }
    for (const c of ALL_MAP_CHARS) {
      this.makeAnim('npc', c, 'idle', 5);
      this.makeAnim('npc', c, 'run', 9);
    }
    this.scene.start('partyCreate');
  }

  // frames are named "<char>_<kind>_<n>.png" (0..3). Character names don't
  // overlap between the 'dungeon' and 'npc' atlases, so anim keys stay unprefixed.
  makeAnim(atlas, char, kind, fps) {
    const key = char + '_' + kind;
    if (this.anims.exists(key)) return;
    const frames = this.anims.generateFrameNames(atlas, {
      prefix: char + '_' + kind + '_', start: 0, end: 3, suffix: '.png',
    });
    if (!frames.length) return;
    this.anims.create({ key, frames, frameRate: fps, repeat: -1 });
  }
}
