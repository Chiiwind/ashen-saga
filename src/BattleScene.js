// ============================================================
//  Ashen Saga — BattleScene
//  FF6-style Active Time Battle (Wait mode): gauges fill in
//  real time, then pause while you choose a command + target.
// ============================================================
import { HEROES, ENCOUNTERS, ABILITIES } from './data.js';
import { buildUnitTextures } from './sprites.js';
import Audio from './audio.js';
import { world } from './world/state.js';

// which SFX a given ability plays when it lands
const ABILITY_SFX = {
  attack: 'attack', gobStab: 'attack', brutalClub: 'attack', gore: 'attack',
  cleave: 'attack', recklessSwing: 'attack',
  fireball: 'fire', cinderStorm: 'fire', smite: 'fire', hex: 'fire', darkBolt: 'fire',
  healingPrayer: 'heal', oathRoar: 'buff',
};

const GW = 960, GH = 540;
const ATB_RATE = 2.6;            // gauge units per (speed * second)
const UI = {
  gold: 0x9a844a, panel: 0x0e0e16, panelA: 0.92,
  text: '#e8e0d0', dim: '#9a9488', hi: 0x2c2c46,
};

// battlefield anchor positions
const ENEMY_SLOTS = [
  { x: 300, y: 200 },  // brute (front)
  { x: 165, y: 140 },
  { x: 150, y: 300 },
  { x: 320, y: 355 },
];
const HERO_SLOTS = [
  { x: 690, y: 170 },
  { x: 770, y: 260 },
  { x: 690, y: 350 },
];

export default class BattleScene extends Phaser.Scene {
  constructor() { super('battle'); }

  // launched standalone (default gauntlet) or from the overworld
  // with { encounters, returnTo, foeId }
  init(data) {
    this.launch = data || {};
    this.encList = this.launch.encounters || ENCOUNTERS;
  }

  create() {
    buildUnitTextures(this);
    this.drawBackground();
    this.buildAtmosphere();

    // --- build combatants -----------------------------------
    this.heroes = HEROES.map((d, i) => this.makeCombatant(d, 'hero', HERO_SLOTS[i]));
    this.enemies = [];
    this.encounterIndex = 0;
    this.transitioning = false;
    this.spawnEnemies(this.encList[0].enemies());

    // --- audio ----------------------------------------------
    this.input.on('pointerdown', () => Audio.unlock());
    this.input.keyboard.on('keydown', () => Audio.unlock());
    Audio.startMusic();

    // --- ui panels ------------------------------------------
    this.buildStatusWindow();
    this.buildCommandWindow();
    this.logText = this.add.text(GW / 2, 24, '', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: UI.text,
      stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5);

    // --- state machine --------------------------------------
    this.mode = 'run';        // 'run' | 'command' | 'target' | 'busy' | 'over'
    this.readyOrder = 0;
    this.menu = null;
    this.cursor = this.add.triangle(0, 0, 0, 0, 16, 8, 0, 16, 0xffd24a)
      .setDepth(50).setVisible(false);

    this.setupInput();
    this.flash(this.encList[0].intro, 1900);
    this.refreshStatus();
  }

  // atmosphere: drifting ash + a vignette
  buildAtmosphere() {
    this.add.particles(0, 0, 'p_ash', {
      x: { min: 0, max: GW }, y: -6,
      lifespan: 9000, speedY: { min: 8, max: 24 }, speedX: { min: -8, max: 8 },
      scale: { min: 0.5, max: 1.7 }, alpha: { start: 0.35, end: 0 },
      tint: [0x6a6a72, 0x9a9488, 0x4a4a52], frequency: 160, quantity: 1,
    }).setDepth(3);

    if (!this.textures.exists('vignette')) {
      const cv = this.textures.createCanvas('vignette', 128, 128);
      const ctx = cv.getContext();
      const grd = ctx.createRadialGradient(64, 60, 20, 64, 64, 90);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, 128, 128);
      cv.refresh();
    }
    this.add.image(GW / 2, GH / 2, 'vignette').setDisplaySize(GW, GH).setDepth(35).setAlpha(0.9);
  }

  // =========================================================
  //  Setup
  // =========================================================
  drawBackground() {
    const g = this.add.graphics();
    // sky
    g.fillGradientStyle(0x1a1430, 0x1a1430, 0x3a2440, 0x2a1a30, 1);
    g.fillRect(0, 0, GW, 400);
    // distant ridge
    g.fillStyle(0x241a34, 1);
    g.fillTriangle(0, 300, 260, 150, 460, 300);
    g.fillTriangle(360, 300, 640, 120, 900, 300);
    g.fillStyle(0x1c1428, 1);
    g.fillTriangle(200, 320, 520, 180, 820, 320);
    // ground
    g.fillGradientStyle(0x3a2c1e, 0x3a2c1e, 0x241a12, 0x241a12, 1);
    g.fillRect(0, 300, GW, 100);
    // scattered ash
    for (let i = 0; i < 60; i++) {
      const x = (i * 137) % GW, y = 310 + ((i * 53) % 80);
      g.fillStyle(0x000000, 0.25); g.fillRect(x, y, 3, 2);
    }
    // pale moon
    g.fillStyle(0xd8d0b0, 0.5); g.fillCircle(150, 90, 40);
    g.fillStyle(0x1a1430, 0.5); g.fillCircle(168, 82, 34);
    // lower UI backdrop
    g.fillStyle(0x05050a, 1); g.fillRect(0, 400, GW, GH - 400);
  }

  makeCombatant(d, side, slot) {
    const c = {
      ...d, side, slot,
      hp: d.maxHp, mp: d.maxMp, atb: Phaser.Math.Between(0, 30),
      alive: true, ready: false, atkBuff: 1, order: 0,
    };
    const spr = this.add.image(slot.x, slot.y, 'unit_' + d.sprite).setDepth(10);
    if (side === 'hero') spr.setFlipX(true);        // party faces left
    spr.setScale(d.boss ? 1.55 : 1.15);
    c.sprite = spr;
    c.homeX = slot.x;
    c.homeY = slot.y;
    c.barOff = d.boss ? 72 : 50;                     // ui offset above sprite
    // floating name for enemies (helps targeting)
    if (side === 'enemy') {
      c.tag = this.add.text(slot.x, slot.y - (d.boss ? 82 : 56), d.name, {
        fontFamily: 'Trebuchet MS', fontSize: d.boss ? '15px' : '13px',
        color: d.boss ? '#ff8a6a' : UI.dim, stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(11);
      c.hpbar = this.add.graphics().setDepth(11);    // tiny hp pip bar
    }
    return c;
  }

  // (re)populate the enemy side for an encounter
  spawnEnemies(list) {
    for (const e of this.enemies) {
      if (e.sprite) e.sprite.destroy();
      if (e.tag) e.tag.destroy();
      if (e.hpbar) e.hpbar.destroy();
    }
    this.enemies = list.map((d, i) => this.makeCombatant(d, 'enemy', ENEMY_SLOTS[i % ENEMY_SLOTS.length]));
  }

  buildStatusWindow() {
    const x = 486, y = 404, w = GW - x - 10, h = GH - y - 6;
    this.panel(x, y, w, h);
    this.rowNodes = this.heroes.map((hchar, i) => {
      const ry = y + 14 + i * 40;
      const name = this.add.text(x + 16, ry, hchar.name, {
        fontFamily: 'Trebuchet MS', fontSize: '17px', color: UI.text,
      });
      const hp = this.add.text(x + 250, ry, '', {
        fontFamily: 'Trebuchet MS', fontSize: '15px', color: UI.text,
      });
      const mp = this.add.text(x + 360, ry, '', {
        fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#8ab6ff',
      });
      const bars = this.add.graphics();
      return { hchar, name, hp, mp, bars, ry, x };
    });
  }

  buildCommandWindow() {
    this.cmdX = 14; this.cmdY = 404; this.cmdW = 458; this.cmdH = GH - 404 - 6;
    this.cmdPanel = this.panel(this.cmdX, this.cmdY, this.cmdW, this.cmdH, true);
    this.cmdTitle = this.add.text(this.cmdX + 16, this.cmdY + 10, '', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#ffd24a',
    }).setDepth(41);
    this.cmdHint = this.add.text(this.cmdX + 16, this.cmdY + this.cmdH - 26, '', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: UI.dim,
    }).setDepth(41);
    this.setCommandVisible(false);
  }

  panel(x, y, w, h, hidden) {
    const g = this.add.graphics().setDepth(40);
    g.fillStyle(UI.panel, UI.panelA); g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, UI.gold, 1); g.strokeRoundedRect(x, y, w, h, 8);
    if (hidden) g.setVisible(false);
    return g;
  }

  setCommandVisible(v) {
    this.cmdPanel.setVisible(v);
    this.cmdTitle.setVisible(v);
    this.cmdHint.setVisible(v);
  }

  // =========================================================
  //  Input
  // =========================================================
  setupInput() {
    const k = this.input.keyboard;
    k.on('keydown-UP', () => this.nav(-1));
    k.on('keydown-DOWN', () => this.nav(1));
    k.on('keydown-LEFT', () => this.nav(-1));
    k.on('keydown-RIGHT', () => this.nav(1));
    k.on('keydown-ENTER', () => this.confirm());
    k.on('keydown-SPACE', () => this.confirm());
    k.on('keydown-Z', () => this.confirm());
    k.on('keydown-ESC', () => this.cancel());
    k.on('keydown-X', () => this.cancel());
    k.on('keydown-BACKSPACE', () => this.cancel());
  }

  nav(dir) {
    if (this.mode === 'command' && this.menu) {
      this.menu.index = Phaser.Math.Wrap(this.menu.index + dir, 0, this.menu.items.length);
      Audio.sfx('cursor');
      this.renderMenu();
    } else if (this.mode === 'target') {
      const n = this.targetList.length;
      this.targetIndex = Phaser.Math.Wrap(this.targetIndex + dir, 0, n);
      Audio.sfx('cursor');
      this.updateTargetCursor();
    }
  }

  confirm() {
    if (this.mode === 'command' && this.menu) {
      const item = this.menu.items[this.menu.index];
      if (item.enabled !== false) { Audio.sfx('confirm'); item.onSelect(); }
    } else if (this.mode === 'target') {
      Audio.sfx('confirm');
      this.commitTarget();
    } else if (this.mode === 'over') {
      if (this.overRetreat) this.scene.start(this.launch.returnTo);
      else this.scene.restart();
    }
  }

  cancel() {
    if (this.mode === 'command' && this.menu && this.menu.onCancel) {
      Audio.sfx('cancel');
      this.menu.onCancel();
    } else if (this.mode === 'target') {
      Audio.sfx('cancel');
      this.cancelTarget();
    }
  }

  // =========================================================
  //  Main loop — fill gauges, then hand off ready units
  // =========================================================
  update(time, delta) {
    if (this.mode !== 'run') return;
    const dt = delta / 1000;
    const all = [...this.heroes, ...this.enemies];
    for (const c of all) {
      if (!c.alive) continue;
      if (c.atb < 100) {
        c.atb = Math.min(100, c.atb + c.speed * ATB_RATE * dt);
        if (c.atb >= 100 && !c.ready) { c.ready = true; c.order = ++this.readyOrder; }
      }
    }
    this.refreshStatus();

    // pick the unit that has been ready longest
    const ready = all.filter(c => c.alive && c.ready).sort((a, b) => a.order - b.order);
    if (ready.length) {
      const actor = ready[0];
      if (actor.side === 'hero') this.beginCommand(actor);
      else this.beginEnemyTurn(actor);
    }
  }

  // =========================================================
  //  Player command flow
  // =========================================================
  beginCommand(hero) {
    this.mode = 'command';
    this.activeHero = hero;
    hero.sprite.x = hero.homeX - 18;          // step forward
    this.setCommandVisible(true);
    this.cmdTitle.setText(hero.name + '  •  ' + hero.title);
    this.openRootMenu(hero);
    this.highlightRow(hero);
  }

  openRootMenu(hero) {
    const items = [];
    for (const cmd of hero.commands) {
      if (cmd.ability) {
        items.push({ label: cmd.label, onSelect: () => this.pickAbility(hero, cmd.ability) });
      } else {
        items.push({ label: cmd.label + '  ▸', onSelect: () => this.openGroupMenu(hero, cmd) });
      }
    }
    this.showMenu(items, 'Choose an action', null);
  }

  openGroupMenu(hero, cmd) {
    const items = cmd.group.map(aid => {
      const ab = ABILITIES[aid];
      const affordable = hero.mp >= ab.mp;
      const label = ab.mp ? `${ab.name}   ${ab.mp} MP` : ab.name;
      return {
        label, enabled: affordable, ability: aid,
        onSelect: () => this.pickAbility(hero, aid),
      };
    });
    this.showMenu(items, cmd.label, () => this.openRootMenu(hero));
  }

  pickAbility(hero, aid) {
    const ab = ABILITIES[aid];
    if (hero.mp < ab.mp) return;
    this.pendingAbility = aid;
    if (ab.target === 'self') { this.executeAction(hero, aid, [hero]); return; }
    if (ab.target === 'allEnemies') {
      this.executeAction(hero, aid, this.sideOf(hero).foes.filter(c => c.alive));
      return;
    }
    // single target selection
    const pool = ab.target === 'ally' ? this.sideOf(hero).allies : this.sideOf(hero).foes;
    this.startTargeting(hero, aid, pool.filter(c => c.alive));
  }

  // ---- targeting -----------------------------------------
  startTargeting(actor, aid, list) {
    this.mode = 'target';
    this.targetActor = actor;
    this.targetAbility = aid;
    this.targetList = list;
    this.targetIndex = 0;
    this.clearMenuNodes();
    this.cmdHint.setText('Pick a target   (Enter = confirm, Esc = back)');
    this.cursor.setVisible(true);
    this.updateTargetCursor();
  }

  updateTargetCursor() {
    const t = this.targetList[this.targetIndex];
    this.cursor.setPosition(t.sprite.x, t.sprite.y - 64);
    this.tweens.add({ targets: this.cursor, y: t.sprite.y - 72, duration: 350, yoyo: true, repeat: -1 });
  }

  commitTarget() {
    const t = this.targetList[this.targetIndex];
    this.cursor.setVisible(false);
    this.tweens.killTweensOf(this.cursor);
    this.executeAction(this.targetActor, this.targetAbility, [t]);
  }

  cancelTarget() {
    this.cursor.setVisible(false);
    this.tweens.killTweensOf(this.cursor);
    this.mode = 'command';
    this.openRootMenu(this.activeHero);
  }

  // =========================================================
  //  Menu rendering
  // =========================================================
  showMenu(items, title, onCancel) {
    this.clearMenuNodes();
    this.menu = { items, index: 0, onCancel };
    if (title) this.cmdHint.setText(onCancel ? 'Esc = back' : 'Enter = select');
    this.renderMenu();
  }

  renderMenu() {
    this.clearMenuNodes(true);
    const m = this.menu;
    this.menuNodes = [];
    const col2 = m.items.length > 4;
    m.items.forEach((it, i) => {
      const col = col2 && i >= Math.ceil(m.items.length / 2) ? 1 : 0;
      const row = col2 ? i % Math.ceil(m.items.length / 2) : i;
      const x = this.cmdX + 24 + col * 210;
      const y = this.cmdY + 44 + row * 26;
      const selected = i === m.index;
      const color = it.enabled === false ? UI.dim : (selected ? '#ffd24a' : UI.text);
      const t = this.add.text(x, y, (selected ? '▶ ' : '   ') + it.label, {
        fontFamily: 'Trebuchet MS', fontSize: '16px', color,
      }).setDepth(41).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => { m.index = i; this.renderMenu(); });
      t.on('pointerdown', () => { if (it.enabled !== false) it.onSelect(); });
      this.menuNodes.push(t);
    });
  }

  clearMenuNodes(keepMenu) {
    if (this.menuNodes) { this.menuNodes.forEach(n => n.destroy()); this.menuNodes = null; }
    if (!keepMenu) this.menu = null;
  }

  // =========================================================
  //  Enemy turn
  // =========================================================
  beginEnemyTurn(enemy) {
    this.mode = 'busy';
    const foes = this.sideOf(enemy).foes.filter(c => c.alive);
    if (!foes.length) { this.endActor(enemy); return; }
    const aid = Phaser.Utils.Array.GetRandom(enemy.skills);
    const ab = ABILITIES[aid];
    let targets;
    if (ab.target === 'allEnemies') targets = foes;
    else targets = [Phaser.Utils.Array.GetRandom(foes)];
    this.time.delayedCall(350, () => this.executeAction(enemy, aid, targets));
  }

  // =========================================================
  //  Resolve an action (shared by heroes + enemies)
  // =========================================================
  executeAction(actor, aid, targets) {
    this.mode = 'busy';
    this.setCommandVisible(false);
    this.clearMenuNodes();
    this.clearHighlight();
    const ab = ABILITIES[aid];
    if (actor.side === 'hero') actor.mp = Math.max(0, actor.mp - ab.mp);

    const verb = actor.name + (aid === 'attack' ? ' attacks!' : ' uses ' + ab.name + '!');
    this.flash(verb, 1200);

    // lunge animation for physical, cast flare for magic
    const isMagic = ab.kind === 'magic';
    const primary = targets[0];
    const dir = actor.side === 'hero' ? -1 : 1;

    const strike = () => {
      Audio.sfx(ABILITY_SFX[aid] || 'attack');
      if (ab.buffAtk) {
        actor.atkBuff = ab.buffAtk;
        this.burst(actor.sprite.x, actor.sprite.y - 20, 0xffd24a, 14, { speed: 90, gravityY: -60, lifespan: 700 });
        this.spawnText(actor.sprite.x, actor.sprite.y - 40, 'ATK UP', '#ffd24a');
        this.finishAction(actor, ab);
        return;
      }
      targets.forEach(t => this.resolveHit(actor, t, ab, isMagic));
      // recoil (Reckless Swing)
      if (ab.recoil) {
        const self = Math.round(actor.maxHp * ab.recoil);
        actor.hp = Math.max(1, actor.hp - self);
        this.spawnText(actor.sprite.x, actor.sprite.y - 30, '-' + self, '#ff9a5a');
      }
      this.finishAction(actor, ab);
    };

    if (isMagic || ab.buffAtk) {
      // small charge, then flare on target(s)
      this.tweens.add({
        targets: actor.sprite, scaleX: 1.25, scaleY: 1.25, duration: 200, yoyo: true,
        onYoyo: () => { targets.forEach(t => this.castFx(t, aid)); },
        onComplete: strike,
      });
    } else {
      this.tweens.add({
        targets: actor.sprite,
        x: primary.sprite.x - dir * 46, y: primary.sprite.y, duration: 200,
        yoyo: true, hold: 40, ease: 'Quad.easeOut', onYoyo: strike,
      });
    }
  }

  resolveHit(actor, target, ab, isMagic) {
    if (!target.alive) return;
    const tx = target.sprite.x, ty = target.sprite.y - 12;
    if (ab.heal) {
      const amt = Math.round(actor.mag * ab.power * Phaser.Math.FloatBetween(0.9, 1.1));
      target.hp = Math.min(target.maxHp, target.hp + amt);
      this.spawnText(tx, ty - 28, '+' + amt, '#7dff8a');
      this.tintPulse(target, 0x7dff8a);
      this.burst(tx, ty, 0x8dffa0, 14, { speed: 60, gravityY: -50, lifespan: 800, scale: 0.5 });
      return;
    }
    const atkS = isMagic ? actor.mag : actor.atk * actor.atkBuff;
    const defS = isMagic ? target.res : target.def;
    const raw = Math.max(1, atkS * ab.power - defS * 0.6);
    const dmg = Math.round(raw * Phaser.Math.FloatBetween(0.85, 1.15));
    target.hp = Math.max(0, target.hp - dmg);
    this.spawnText(tx, ty - 28, '' + dmg, '#ffffff');
    this.tintPulse(target, 0xff5a5a);
    // spark burst — fiery for magic, pale steel for physical
    this.burst(tx, ty, isMagic ? 0xff9a3a : 0xfff2a0, isMagic ? 16 : 10,
      { speed: isMagic ? 150 : 180, lifespan: isMagic ? 550 : 380, scale: 0.55 });
    this.cameras.main.shake(dmg > 40 ? 200 : 120, dmg > 40 ? 0.010 : 0.006);
    if (dmg > 40) this.flashScreen(0xffffff, 0.22, 160);
    if (target.hp <= 0) this.killUnit(target);
  }

  finishAction(actor, ab) {
    this.time.delayedCall(360, () => this.endActor(actor));
  }

  endActor(actor) {
    actor.atb = 0; actor.ready = false; actor.order = 0;
    actor.sprite.x = actor.homeX;
    actor.sprite.y = actor.homeY;
    this.refreshStatus();
    if (this.checkEnd()) return;
    this.mode = 'run';
  }

  // =========================================================
  //  FX helpers
  // =========================================================
  castFx(target, aid) {
    const colorMap = { fireball: 0xff7a1a, cinderStorm: 0xff5a1a, smite: 0xffe08a, hex: 0x9a5aff, darkBolt: 0xc23aff, healingPrayer: 0x7dff8a };
    const color = colorMap[aid] || 0xffd24a;
    const fx = this.add.circle(target.sprite.x, target.sprite.y - 10, 6, color, 0.9).setDepth(30);
    fx.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: fx, radius: 46, alpha: 0, duration: 420,
      onComplete: () => fx.destroy(),
    });
  }

  // additive particle burst
  burst(x, y, tint, count, opts = {}) {
    const { speed = 140, lifespan = 500, scale = 0.6, gravityY = 0 } = opts;
    const e = this.add.particles(x, y, 'p_dot', {
      speed: { min: speed * 0.3, max: speed }, angle: { min: 0, max: 360 },
      lifespan, scale: { start: scale, end: 0 }, alpha: { start: 1, end: 0 },
      tint, gravityY, blendMode: Phaser.BlendModes.ADD, emitting: false,
    }).setDepth(30);
    e.explode(count, x, y);
    this.time.delayedCall(lifespan + 80, () => e.destroy());
  }

  flashScreen(color = 0xffffff, alpha = 0.3, dur = 160) {
    const r = this.add.rectangle(GW / 2, GH / 2, GW, GH, color, alpha).setDepth(70);
    this.tweens.add({ targets: r, alpha: 0, duration: dur, onComplete: () => r.destroy() });
  }

  tintPulse(unit, color) {
    unit.sprite.setTint(color);
    this.time.delayedCall(150, () => { if (unit.alive) unit.sprite.clearTint(); });
  }

  spawnText(x, y, str, color) {
    const t = this.add.text(x, y, str, {
      fontFamily: 'Trebuchet MS', fontSize: '28px', color,
      stroke: '#000', strokeThickness: 5, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: t, y: y - 46, alpha: 0, duration: 900, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  killUnit(unit) {
    unit.alive = false; unit.ready = false;
    Audio.sfx('ko');
    this.tweens.add({ targets: unit.sprite, alpha: 0.12, angle: unit.side === 'hero' ? -90 : 90, y: unit.sprite.y + 14, duration: 500 });
    unit.sprite.setTint(0x333340);
    if (unit.tag) unit.tag.setColor('#5a544a');
    if (unit.hpbar) unit.hpbar.clear();
  }

  flash(msg, ms) {
    this.logText.setText(msg).setAlpha(1);
    this.tweens.killTweensOf(this.logText);
    if (ms) this.tweens.add({ targets: this.logText, alpha: 0.0, delay: ms, duration: 400 });
  }

  // =========================================================
  //  Status / bars
  // =========================================================
  refreshStatus() {
    if (!this.rowNodes) return;
    for (const r of this.rowNodes) {
      const c = r.hchar;
      r.hp.setText(`${c.hp}/${c.maxHp}`);
      r.mp.setText(c.maxMp ? `MP ${c.mp}` : '');
      r.name.setColor(c.alive ? UI.text : '#6a655a');
      const g = r.bars; g.clear();
      // hp bar
      this.bar(g, r.x + 250, r.ry + 20, 100, 7, c.hp / c.maxHp, 0x3aa03a, 0x1c3a1c);
      // atb bar
      const atbColor = c.ready ? 0xffd24a : 0x5a8ad0;
      this.bar(g, r.x + 250, r.ry + 30, 100, 5, c.atb / 100, atbColor, 0x1a2436);
    }
    // enemy hp pips
    for (const e of this.enemies) {
      if (!e.hpbar || !e.alive) continue;
      e.hpbar.clear();
      const w = e.boss ? 78 : 52;
      this.bar(e.hpbar, e.sprite.x - w / 2, e.sprite.y - e.barOff, w, e.boss ? 7 : 5, e.hp / e.maxHp, 0xc23a3a, 0x2a1414);
    }
  }

  bar(g, x, y, w, h, frac, fg, bg) {
    frac = Phaser.Math.Clamp(frac, 0, 1);
    g.fillStyle(bg, 1); g.fillRect(x, y, w, h);
    g.fillStyle(fg, 1); g.fillRect(x, y, w * frac, h);
    g.lineStyle(1, 0x000000, 0.6); g.strokeRect(x, y, w, h);
  }

  highlightRow(hero) {
    this.clearHighlight();
    const r = this.rowNodes.find(n => n.hchar === hero);
    if (!r) return;
    this.rowHi = this.add.graphics().setDepth(40);
    this.rowHi.fillStyle(UI.hi, 0.5);
    this.rowHi.fillRoundedRect(r.x + 8, r.ry - 4, GW - r.x - 26, 34, 6);
    r.name.setDepth(41); r.hp.setDepth(41); r.mp.setDepth(41); r.bars.setDepth(41);
  }
  clearHighlight() { if (this.rowHi) { this.rowHi.destroy(); this.rowHi = null; } }

  // =========================================================
  //  Sides / end conditions
  // =========================================================
  sideOf(unit) {
    return unit.side === 'hero'
      ? { allies: this.heroes, foes: this.enemies }
      : { allies: this.enemies, foes: this.heroes };
  }

  checkEnd() {
    if (this.mode === 'over' || this.transitioning) return true;
    const heroesUp = this.heroes.some(c => c.alive);
    const foesUp = this.enemies.some(c => c.alive);
    if (foesUp && heroesUp) return false;
    if (!heroesUp) { this.endBattle(false); return true; }
    // party won this encounter — are there more?
    if (this.encounterIndex < this.encList.length - 1) { this.advanceEncounter(); return true; }
    this.endBattle(true);
    return true;
  }

  advanceEncounter() {
    if (this.transitioning) return;   // never fire twice
    this.transitioning = true;
    this.mode = 'busy';
    this.setCommandVisible(false);
    this.clearMenuNodes(); this.clearHighlight();
    this.cursor.setVisible(false); this.tweens.killTweensOf(this.cursor);
    Audio.sfx('victory');
    this.flash('The foes fall... but more approach!', 2400);
    // patch up the band between fights: heal survivors, revive the fallen
    for (const h of this.heroes) {
      if (h.alive) {
        h.hp = Math.min(h.maxHp, h.hp + Math.round(h.maxHp * 0.30));
      } else {
        h.alive = true; h.hp = Math.round(h.maxHp * 0.25);
        h.sprite.setAlpha(1).setAngle(0).clearTint(); h.sprite.y = h.homeY;
      }
      h.mp = Math.min(h.maxMp, h.mp + Math.round(h.maxMp * 0.30));
      h.atb = Phaser.Math.Between(0, 20); h.ready = false; h.order = 0; h.atkBuff = 1;
    }
    this.refreshStatus();
    this.time.delayedCall(2600, () => {
      this.encounterIndex++;
      const enc = this.encList[this.encounterIndex];
      if (!enc) { this.transitioning = false; this.endBattle(true); return; }
      this.spawnEnemies(enc.enemies());
      this.flash(enc.intro, 2400);
      this.refreshStatus();
      this.transitioning = false;
      this.mode = 'run';
    });
  }

  endBattle(win) {
    this.mode = 'over';
    this.setCommandVisible(false);
    this.clearMenuNodes(); this.clearHighlight();
    this.cursor.setVisible(false); this.tweens.killTweensOf(this.cursor);
    Audio.stopMusic();
    Audio.sfx(win ? 'victory' : 'defeat');
    if (win) this.flashScreen(0xffe8a0, 0.35, 500);

    const fromMap = !!this.launch.returnTo;
    // won a roaming-foe battle → clear it and slip back to the map
    if (win && fromMap) {
      if (this.launch.foeId) world.defeatedFoes.add(this.launch.foeId);
      this.flash('Victory!', 1200);
      this.time.delayedCall(1200, () => {
        this.cameras.main.fadeOut(300);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(this.launch.returnTo));
      });
      return;
    }

    const banner = this.add.container(GW / 2, GH / 2 - 30).setDepth(80);
    const bg = this.add.rectangle(0, 0, 560, 130, 0x000000, 0.8).setStrokeStyle(2, UI.gold);
    const retreat = fromMap && !win;
    const title = this.add.text(0, -22, win ? 'VICTORY' : 'DEFEAT', {
      fontFamily: 'Trebuchet MS', fontSize: '46px', fontStyle: 'bold',
      color: win ? '#ffd24a' : '#c23a3a', stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5);
    const sub = this.add.text(0, 30,
      win ? 'The warband is broken. Your band endures.  (Enter to play again)'
          : (retreat ? 'Your band is routed — you fall back to safety.  (Enter)'
                     : 'Your band has fallen.  (Enter to retry)'), {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: UI.text,
    }).setOrigin(0.5);
    banner.add([bg, title, sub]);
    banner.setScale(0.6); banner.setAlpha(0);
    this.tweens.add({ targets: banner, scale: 1, alpha: 1, duration: 400, ease: 'Back.easeOut' });
    this.overRetreat = retreat;    // consumed by confirm()
  }
}
