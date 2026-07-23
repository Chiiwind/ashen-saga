// ============================================================
//  Ashen Saga — IntroScene
//  Sets up Act I after the party is created, then heads to the
//  overworld. (Continue skips this; only New Game plays it.)
// ============================================================
import Audio from './../audio.js';

const PAGES = [
  'The Ashen Wilds have not known peace since the Ashfall.',
  'From the old Ashmoor Mine, a green tide spills — goblins by the score, whipped to frenzy by an orc warboss: GRUKK SKULLSPLITTER.',
  'The village of Aldenmoor stands in their path. Its people have sent for wardens. For you.',
  'Descend the mine. Cut down the horde. Put Grukk\'s head on a spike — before the Waaagh! swallows the Wilds.',
];

export default class IntroScene extends Phaser.Scene {
  constructor() { super('intro'); }

  create() {
    this.cameras.main.setBackgroundColor(0x07070c);
    if (this.textures.exists('p_ash')) {
      this.add.particles(0, 0, 'p_ash', {
        x: { min: 0, max: 960 }, y: -6, lifespan: 9000,
        speedY: { min: 8, max: 22 }, speedX: { min: -8, max: 8 },
        scale: { min: 0.5, max: 1.6 }, alpha: { start: 0.28, end: 0 },
        tint: [0x6a6a72, 0x9a9488, 0x4a4a52], frequency: 220, quantity: 1,
      });
    }
    this.page = 0;
    this.body = this.add.text(480, 250, '', {
      fontFamily: 'Trebuchet MS', fontSize: '24px', color: '#e8e0d0',
      align: 'center', wordWrap: { width: 720 }, lineSpacing: 8,
    }).setOrigin(0.5);
    this.hint = this.add.text(480, 500, 'Space to continue    (Esc to skip)', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#8a857a',
    }).setOrigin(0.5);

    const k = this.input.keyboard;
    k.on('keydown-SPACE', () => this.next());
    k.on('keydown-ENTER', () => this.next());
    k.on('keydown-ESC', () => this.finish());
    this.input.keyboard.on('keydown', () => Audio.unlock());
    this.render();
  }

  render() {
    this.body.setAlpha(0).setText(PAGES[this.page]);
    this.tweens.add({ targets: this.body, alpha: 1, duration: 400 });
  }

  next() {
    Audio.sfx('confirm');
    this.page++;
    if (this.page >= PAGES.length) { this.finish(); return; }
    this.render();
  }

  finish() {
    this.cameras.main.fadeOut(400);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('overworld'));
  }
}
