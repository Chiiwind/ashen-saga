// ============================================================
//  Ashen Saga — entry point
// ============================================================
import BattleScene from './BattleScene.js';
import OverworldScene from './scenes/OverworldScene.js';
import TownScene from './scenes/TownScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import TitleScene from './scenes/TitleScene.js';
import PartyCreateScene from './scenes/PartyCreateScene.js';
import PartyMenuScene from './scenes/PartyMenuScene.js';

const config = {
  type: Phaser.CANVAS,   // Canvas renderer displays reliably in the preview pane (WebGL can blank out)
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#05050a',
  pixelArt: true,
  roundPixels: true,
  render: { preserveDrawingBuffer: true },
  fps: { forceSetTimeOut: true, target: 60, smoothStep: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [PreloadScene, TitleScene, PartyCreateScene, OverworldScene, TownScene, BattleScene, PartyMenuScene],
};

window.__GAME = new Phaser.Game(config);
