// ============================================================
//  Ashen Saga — TitleScene
//  New Game / Continue. Runs after the preloader.
// ============================================================
import { hasSave, loadGame, clearSave, resetWorld } from '../world/state.js';
import Audio from './../audio.js';

export default class TitleScene extends Phaser.Scene {
  constructor() { super('title'); }

  create() {
    this.cameras.main.setBackgroundColor(0x0a0a12);

    // drifting ash for atmosphere (reuse the battle particle texture if present)
    if (this.textures.exists('p_ash')) {
      this.add.particles(0, 0, 'p_ash', {
        x: { min: 0, max: 960 }, y: -6, lifespan: 9000,
        speedY: { min: 8, max: 24 }, speedX: { min: -8, max: 8 },
        scale: { min: 0.5, max: 1.7 }, alpha: { start: 0.3, end: 0 },
        tint: [0x6a6a72, 0x9a9488, 0x4a4a52], frequency: 200, quantity: 1,
      });
    }

    this.add.text(480, 150, 'ASHEN SAGA', {
      fontFamily: 'Trebuchet MS', fontSize: '64px', fontStyle: 'bold',
      color: '#ffd24a', stroke: '#000', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(480, 208, 'A grimdark fantasy JRPG', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#9a9488',
    }).setOrigin(0.5);

    const canContinue = hasSave();
    this.items = [];
    if (canContinue) this.items.push({ label: 'Continue', act: () => this.continueGame() });
    this.items.push({ label: 'New Game', act: () => this.newGame() });
    this.index = 0;

    this.nodes = this.items.map((it, i) => {
      const t = this.add.text(480, 300 + i * 46, '', {
        fontFamily: 'Trebuchet MS', fontSize: '26px', color: '#e8e0d0',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { this.index = i; this.render(); });
      t.on('pointerdown', () => it.act());
      return t;
    });
    this.add.text(480, 500, '↑↓ + Enter    (progress auto-saves)', {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#8a857a',
    }).setOrigin(0.5);

    const k = this.input.keyboard;
    k.on('keydown-UP', () => { this.index = Phaser.Math.Wrap(this.index - 1, 0, this.items.length); this.render(); Audio.sfx('cursor'); });
    k.on('keydown-DOWN', () => { this.index = Phaser.Math.Wrap(this.index + 1, 0, this.items.length); this.render(); Audio.sfx('cursor'); });
    k.on('keydown-ENTER', () => this.items[this.index].act());
    k.on('keydown-SPACE', () => this.items[this.index].act());
    this.input.keyboard.on('keydown', () => Audio.unlock());
    this.render();
  }

  render() {
    this.nodes.forEach((t, i) => {
      const sel = i === this.index;
      t.setText((sel ? '▶  ' : '    ') + this.items[i].label).setColor(sel ? '#ffd24a' : '#e8e0d0');
    });
  }

  newGame() {
    Audio.sfx('confirm');
    clearSave();
    resetWorld();
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('partyCreate'));
  }

  continueGame() {
    Audio.sfx('confirm');
    if (!loadGame()) { this.newGame(); return; }
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('overworld'));
  }
}
