// ============================================================
//  Ashen Saga — entry point
// ============================================================
import BattleScene from './BattleScene.js';

const config = {
  type: Phaser.CANVAS,   // Canvas renderer displays reliably in the preview pane (WebGL can blank out)
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#05050a',
  pixelArt: true,
  roundPixels: true,
  render: { preserveDrawingBuffer: true },
  fps: { forceSetTimeOut: true, target: 60 },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BattleScene],
};

window.__GAME = new Phaser.Game(config);
