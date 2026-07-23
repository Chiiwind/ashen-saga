// ============================================================
//  Ashen Saga — MapScene (base)
//  Shared explorable-map logic: tile rendering, grid-based
//  movement + collision, a camera that follows the hero,
//  NPC interaction, dialogue, and fade transitions.
//  Subclasses implement build() to define their map + actors.
// ============================================================
import { TILE, T, WALKABLE, drawTile } from './tiles.js';
import { buildWorldTextures } from './worldSprites.js';

const STEP_MS = 140;

export default class MapScene extends Phaser.Scene {
  create(data) {
    this.launchData = data || {};
    buildWorldTextures(this);

    this.grid = [];
    this.mapW = 0; this.mapH = 0;
    this.npcs = [];
    this.foes = [];
    this.triggers = {};       // "x,y" -> fn(), fired on stepping onto a tile
    this.moving = false;
    this.face = { x: 0, y: 1 };
    this.dialogue = null;
    this._leaving = false;    // reset every (re)entry, or movement stays frozen
                             // after returning from a battle/town on the reused scene instance

    // UI first — build() may call flashBanner()/hint()
    this.buildDialogueUI();
    this.buildBanner();

    this.build();             // subclass: draws ground, spawns player/npcs/foes, sets triggers

    // camera
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.mapW * TILE, this.mapH * TILE);
    cam.setRoundPixels(true);
    if (this.player) cam.startFollow(this.player.sprite, true, 0.18, 0.18);
    cam.fadeIn(300);

    this.setupInput();
  }

  // ---- helpers used by subclasses --------------------------
  renderGround(grid) {
    this.grid = grid;
    this.mapH = grid.length;
    this.mapW = grid[0].length;
    const w = this.mapW * TILE, h = this.mapH * TILE;
    // Draw the whole map ONCE into an off-list graphics, then bake it to a
    // texture. A live Graphics replays every draw command each frame (crushing
    // in the Canvas renderer); a single baked image blits in one op.
    const g = this.make.graphics({ add: false });
    for (let y = 0; y < this.mapH; y++) {
      for (let x = 0; x < this.mapW; x++) {
        drawTile(g, grid[y][x], x * TILE, y * TILE);
      }
    }
    const key = 'ground_' + this.sys.settings.key;
    if (this.textures.exists(key)) this.textures.remove(key);
    g.generateTexture(key, w, h);
    g.destroy();
    this.add.image(0, 0, key).setOrigin(0, 0).setDepth(0);
  }

  spawnPlayer(tx, ty) {
    const s = this.add.image(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 'w_hero')
      .setDepth(10).setScale(1.15);
    this.player = { tx, ty, sprite: s };
    return this.player;
  }

  addNpc({ tx, ty, tex, name, lines, onInteract, wander }) {
    const s = this.add.image(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 'w_' + tex)
      .setDepth(9).setScale(1.1);
    const npc = { tx, ty, sprite: s, name, lines, onInteract, wander, homeX: tx, homeY: ty };
    this.npcs.push(npc);
    if (wander) this.startWander(npc);
    return npc;
  }

  addFoe({ tx, ty, tex, name, encounters, id }) {
    const s = this.add.image(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 'w_' + tex)
      .setDepth(9).setScale(1.2);
    // gentle idle bob so foes read as "alive"
    this.tweens.add({ targets: s, y: s.y - 3, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const foe = { tx, ty, sprite: s, name, encounters, id };
    this.foes.push(foe);
    return foe;
  }

  addTrigger(tx, ty, fn) { this.triggers[tx + ',' + ty] = fn; }

  // ---- movement / collision --------------------------------
  inBounds(x, y) { return x >= 0 && y >= 0 && x < this.mapW && y < this.mapH; }
  walkable(x, y) { return this.inBounds(x, y) && WALKABLE[this.grid[y][x]]; }
  npcAt(x, y) { return this.npcs.find(n => n.tx === x && n.ty === y); }
  foeAt(x, y) { return this.foes.find(f => f.tx === x && f.ty === y); }

  tryMove(dx, dy) {
    if (this.moving || this.dialogue) return;
    this.face = { x: dx, y: dy };
    const p = this.player;
    if (dx < 0) p.sprite.setFlipX(true); else if (dx > 0) p.sprite.setFlipX(false);
    const nx = p.tx + dx, ny = p.ty + dy;

    const foe = this.foeAt(nx, ny);
    if (foe) { this.onFoeContact(foe); return; }
    if (!this.walkable(nx, ny) || this.npcAt(nx, ny)) return;

    this.moving = true;
    p.tx = nx; p.ty = ny;
    this.tweens.add({
      targets: p.sprite, x: nx * TILE + TILE / 2, y: ny * TILE + TILE / 2,
      duration: STEP_MS, ease: 'Linear',
      onComplete: () => { this.moving = false; this.fireTrigger(nx, ny); },
    });
    this.tweens.add({ targets: p.sprite, scaleY: 1.22, duration: STEP_MS / 2, yoyo: true });
  }

  fireTrigger(x, y) {
    const fn = this.triggers[x + ',' + y];
    if (fn) fn();
  }

  // subclass overrides this to launch a battle etc.
  onFoeContact(foe) { if (foe.onContact) foe.onContact(); }

  // ---- interaction -----------------------------------------
  tryInteract() {
    if (this.dialogue) { this.advanceDialogue(); return; }
    const fx = this.player.tx + this.face.x, fy = this.player.ty + this.face.y;
    const npc = this.npcAt(fx, fy);
    if (npc) {
      npc.sprite.setFlipX(this.face.x > 0);     // face the player
      if (npc.onInteract) npc.onInteract(npc);
      else this.showDialogue(npc.name, npc.lines);
    }
  }

  // ---- wandering NPCs --------------------------------------
  startWander(npc) {
    const tick = () => {
      if (!npc.sprite.active) return;
      if (!this.dialogue && !this.moving) {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0], [0, 0]];
        const [dx, dy] = Phaser.Utils.Array.GetRandom(dirs);
        const nx = npc.tx + dx, ny = npc.ty + dy;
        const near = Math.abs(nx - npc.homeX) <= 2 && Math.abs(ny - npc.homeY) <= 2;
        if ((dx || dy) && near && this.walkable(nx, ny) && !this.npcAt(nx, ny)
            && !(this.player.tx === nx && this.player.ty === ny)) {
          if (dx < 0) npc.sprite.setFlipX(true); else if (dx > 0) npc.sprite.setFlipX(false);
          npc.tx = nx; npc.ty = ny;
          this.tweens.add({ targets: npc.sprite, x: nx * TILE + TILE / 2, y: ny * TILE + TILE / 2, duration: 320 });
        }
      }
      this.time.delayedCall(Phaser.Math.Between(900, 2200), tick);
    };
    this.time.delayedCall(Phaser.Math.Between(900, 2200), tick);
  }

  // ---- dialogue UI -----------------------------------------
  buildDialogueUI() {
    const w = 900, h = 120, x = (960 - w) / 2, y = 540 - h - 14;
    this.dlgBox = this.add.container(0, 0).setDepth(100).setScrollFactor(0).setVisible(false);
    const bg = this.add.graphics();
    bg.fillStyle(0x0e0e16, 0.94); bg.fillRoundedRect(x, y, w, h, 10);
    bg.lineStyle(2, 0x9a844a, 1); bg.strokeRoundedRect(x, y, w, h, 10);
    this.dlgName = this.add.text(x + 22, y + 12, '', {
      fontFamily: 'Trebuchet MS', fontSize: '17px', color: '#ffd24a', fontStyle: 'bold',
    });
    this.dlgText = this.add.text(x + 22, y + 42, '', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#e8e0d0',
      wordWrap: { width: w - 44 },
    });
    this.dlgHint = this.add.text(x + w - 150, y + h - 26, '▸ Space', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#8a857a',
    });
    this.dlgBox.add([bg, this.dlgName, this.dlgText, this.dlgHint]);
  }

  showDialogue(name, lines) {
    this.dialogue = { lines: Array.isArray(lines) ? lines : [lines], index: 0, name };
    this.dlgBox.setVisible(true);
    this.renderDialogue();
  }

  renderDialogue() {
    const d = this.dialogue;
    this.dlgName.setText(d.name || '');
    this.dlgText.setText(d.lines[d.index]);
  }

  advanceDialogue() {
    this.dialogue.index++;
    if (this.dialogue.index >= this.dialogue.lines.length) {
      this.dialogue = null;
      this.dlgBox.setVisible(false);
    } else {
      this.renderDialogue();
    }
  }

  // ---- location banner -------------------------------------
  buildBanner() {
    this.banner = this.add.text(480, 40, '', {
      fontFamily: 'Trebuchet MS', fontSize: '26px', color: '#e8e0d0',
      stroke: '#000', strokeThickness: 5, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0).setAlpha(0);
  }

  flashBanner(text, ms = 1800) {
    this.banner.setText(text).setAlpha(1);
    this.tweens.killTweensOf(this.banner);
    this.tweens.add({ targets: this.banner, alpha: 0, delay: ms, duration: 500 });
  }

  hint(text) {
    this.add.text(14, 12, text, {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#b8b0a0',
      stroke: '#000', strokeThickness: 3,
    }).setDepth(100).setScrollFactor(0);
  }

  // ---- input -----------------------------------------------
  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    const act = () => this.tryInteract();
    this.input.keyboard.on('keydown-SPACE', act);
    this.input.keyboard.on('keydown-ENTER', act);
    this.input.keyboard.on('keydown-Z', act);
  }

  gotoScene(key, data) {
    if (this._leaving) return;
    this._leaving = true;
    this.cameras.main.fadeOut(250);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(key, data));
  }

  update() {
    if (this.moving || this.dialogue || this._leaving) return;
    const c = this.cursors, w = this.wasd;
    if (c.left.isDown || w.A.isDown) this.tryMove(-1, 0);
    else if (c.right.isDown || w.D.isDown) this.tryMove(1, 0);
    else if (c.up.isDown || w.W.isDown) this.tryMove(0, -1);
    else if (c.down.isDown || w.S.isDown) this.tryMove(0, 1);
  }
}
