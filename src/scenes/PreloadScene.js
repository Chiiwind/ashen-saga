// ============================================================
//  Ashen Saga — PreloadScene
//  Loads the sprite atlas (0x72 DungeonTileset II, CC0) once and
//  registers idle/run animations for every character we use, then
//  hands off to character creation.
// ============================================================

// atlas characters the game references (heroes + monsters)
export const ATLAS_CHARS = [
  'knight_m', 'knight_f', 'wizard_m', 'wizard_f', 'elf_m', 'elf_f', 'lizard_m', 'lizard_f',
  'goblin', 'orc_warrior', 'orc_shaman', 'masked_orc', 'ogre', 'chort', 'imp',
  'necromancer', 'skeleton', 'big_demon', 'big_zombie',
];

export default class PreloadScene extends Phaser.Scene {
  constructor() { super('preload'); }

  preload() {
    this.load.atlas('dungeon', 'assets/dungeon.png', 'assets/dungeon.json');
    // simple loading text
    this.add.text(480, 270, 'Loading...', {
      fontFamily: 'Trebuchet MS', fontSize: '22px', color: '#e8e0d0',
    }).setOrigin(0.5);
  }

  create() {
    for (const c of ATLAS_CHARS) {
      this.makeAnim(c, 'idle', 6);
      this.makeAnim(c, 'run', 10);
    }
    this.scene.start('partyCreate');
  }

  makeAnim(char, kind, fps) {
    const key = char + '_' + kind;
    if (this.anims.exists(key)) return;
    // frames are named "<char>_<kind>_<n>.png" (0..3)
    const frames = this.anims.generateFrameNames('dungeon', {
      prefix: char + '_' + kind + '_', start: 0, end: 3, suffix: '.png',
    });
    if (!frames.length) return;
    this.anims.create({ key, frames, frameRate: fps, repeat: -1 });
  }
}
