// ============================================================
//  Ashen Saga — PartyMenuScene (skill trees)
//  Opened from the overworld ('M'). Pick a hero, spend AP on
//  their branching skill tree to learn abilities + stats.
// ============================================================
import { CLASSES } from '../rpg/classes.js';
import {
  derivedStats, knownAbilities, isLearned, isLearnable, canAfford, learnNode, expForNext,
} from '../rpg/party.js';
import { ABILITIES } from '../data.js';
import { world } from '../world/state.js';
import { buildUnitTextures } from '../sprites.js';
import Audio from './../audio.js';

const NODE_R = 24;
const nodeX = col => 292 + col * 140;
const nodeY = row => 150 + row * 104;
const STAT_LABEL = { maxHp: 'HP', maxMp: 'MP', atk: 'ATK', def: 'DEF', mag: 'MAG', res: 'RES', speed: 'SPD' };

export default class PartyMenuScene extends Phaser.Scene {
  constructor() { super('partyMenu'); }

  create() {
    buildUnitTextures(this);
    this.party = world.party;
    this.member = 0;
    this.nodeIndex = 0;
    this.nodeObjs = [];

    // opaque backdrop (overworld is paused underneath)
    this.add.rectangle(480, 270, 960, 540, 0x0a0a12, 1).setDepth(-1);
    this.add.text(480, 24, 'Skill Trees', {
      fontFamily: 'Trebuchet MS', fontSize: '26px', fontStyle: 'bold',
      color: '#ffd24a', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.buildMemberList();
    this.buildInfoPanel();
    this.edges = this.add.graphics();
    this.cursorRing = this.add.circle(0, 0, NODE_R + 6).setStrokeStyle(3, 0xffffff).setDepth(20).setVisible(false);

    this.add.text(480, 516, "↑↓←→ move    Enter: learn    [ ] switch hero    Esc / M: close", {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#9a9488',
    }).setOrigin(0.5);

    this.buildTree();
    this.setupInput();
    this.refresh();
  }

  buildMemberList() {
    const x = 14, y = 60, w = 236, h = 430;
    this.panel(x, y, w, h);
    this.memberNodes = this.party.map((c, i) => {
      const ry = y + 14 + i * 84;
      const img = this.add.sprite(x + 34, ry + 26, 'dungeon').setScale(2).setFlipX(true);
      if (this.anims.exists(CLASSES[c.classId].atlas + '_idle')) img.play(CLASSES[c.classId].atlas + '_idle');
      const nm = this.add.text(x + 66, ry + 6, '', { fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#e8e0d0' });
      const cl = this.add.text(x + 66, ry + 28, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#8a857a' });
      const ap = this.add.text(x + 66, ry + 46, '', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#9affb0' });
      const zone = this.add.zone(x, ry, w, 80).setOrigin(0, 0).setInteractive();
      zone.on('pointerdown', () => { this.member = i; this.nodeIndex = 0; this.buildTree(); this.refresh(); });
      return { c, img, nm, cl, ap, ry, x, w };
    });
  }

  buildInfoPanel() {
    const x = 706, y = 60, w = 240, h = 430;
    this.panel(x, y, w, h);
    this.infoTitle = this.add.text(x + 16, y + 14, '', { fontFamily: 'Trebuchet MS', fontSize: '18px', fontStyle: 'bold', color: '#ffd24a', wordWrap: { width: w - 32 } });
    this.infoStatus = this.add.text(x + 16, y + 52, '', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#e8e0d0' });
    this.infoCost = this.add.text(x + 16, y + 74, '', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#8ab6ff' });
    this.infoDesc = this.add.text(x + 16, y + 104, '', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#cfc8b8', wordWrap: { width: w - 32 } });
    this.infoStats = this.add.text(x + 16, y + 210, '', { fontFamily: 'Courier New', fontSize: '13px', color: '#e8e0d0', lineSpacing: 3 });
  }

  panel(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x0e0e16, 0.95); g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, 0x9a844a, 1); g.strokeRoundedRect(x, y, w, h, 8);
    return g;
  }

  // ---- tree (rebuilt when switching hero) ------------------
  buildTree() {
    this.nodeObjs.forEach(o => { o.circle.destroy(); o.label.destroy(); });
    this.nodeObjs = [];
    const c = this.party[this.member];
    const tree = CLASSES[c.classId].tree;
    this.tree = tree;
    if (this.nodeIndex >= tree.length) this.nodeIndex = 0;
    tree.forEach(n => {
      const px = nodeX(n.col), py = nodeY(n.row);
      const circle = this.add.circle(px, py, NODE_R, 0x222230).setStrokeStyle(3, 0x555566).setDepth(10)
        .setInteractive({ useHandCursor: true });
      circle.on('pointerover', () => { this.nodeIndex = tree.indexOf(n); this.refresh(); });
      circle.on('pointerdown', () => { this.nodeIndex = tree.indexOf(n); this.tryLearn(); });
      const label = this.add.text(px, py + NODE_R + 4, this.nodeLabel(n), {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#cfc8b8', align: 'center',
      }).setOrigin(0.5, 0).setDepth(10);
      this.nodeObjs.push({ n, circle, label, x: px, y: py });
    });
  }

  nodeLabel(n) {
    return n.type === 'ability' ? n.name : '+' + n.amount + ' ' + STAT_LABEL[n.stat];
  }

  // ---- input -----------------------------------------------
  setupInput() {
    const k = this.input.keyboard;
    k.on('keydown-UP', () => this.moveCursor(0, -1));
    k.on('keydown-DOWN', () => this.moveCursor(0, 1));
    k.on('keydown-LEFT', () => this.moveCursor(-1, 0));
    k.on('keydown-RIGHT', () => this.moveCursor(1, 0));
    k.on('keydown-ENTER', () => this.tryLearn());
    k.on('keydown-SPACE', () => this.tryLearn());
    k.on('keydown-OPEN_BRACKET', () => this.switchMember(-1));
    k.on('keydown-CLOSED_BRACKET', () => this.switchMember(1));
    k.on('keydown-ESC', () => this.close());
    k.on('keydown-M', () => this.close());
  }

  switchMember(dir) {
    this.member = Phaser.Math.Wrap(this.member + dir, 0, this.party.length);
    this.nodeIndex = 0;
    Audio.sfx('cursor');
    this.buildTree();
    this.refresh();
  }

  moveCursor(dx, dy) {
    const cur = this.tree[this.nodeIndex];
    let best = -1, bestScore = Infinity;
    this.tree.forEach((n, i) => {
      if (i === this.nodeIndex) return;
      const ddx = n.col - cur.col, ddy = n.row - cur.row;
      if (dx !== 0 && (Math.sign(ddx) !== Math.sign(dx) || ddx === 0)) return;
      if (dy !== 0 && (Math.sign(ddy) !== Math.sign(dy) || ddy === 0)) return;
      const score = Math.abs(ddx) + Math.abs(ddy) + (dx !== 0 ? Math.abs(ddy) : Math.abs(ddx)) * 2;
      if (score < bestScore) { bestScore = score; best = i; }
    });
    if (best >= 0) { this.nodeIndex = best; Audio.sfx('cursor'); this.refresh(); }
  }

  tryLearn() {
    const c = this.party[this.member];
    const n = this.tree[this.nodeIndex];
    if (isLearned(c, n.id)) return;
    if (!isLearnable(c, n.id)) { Audio.sfx('cancel'); return; }
    if (!canAfford(c, n.id)) { Audio.sfx('cancel'); return; }
    learnNode(c, n.id);
    Audio.sfx('confirm');
    this.refresh();
  }

  close() {
    this.scene.resume('overworld');
    this.scene.stop();
  }

  // ---- render ----------------------------------------------
  refresh() {
    // member list
    this.memberNodes.forEach((m, i) => {
      const c = m.c;
      m.nm.setText(`${c.name}  Lv${c.level}`);
      m.cl.setText(CLASSES[c.classId].name);
      m.ap.setText(`AP ${c.ap}`);
      const sel = i === this.member;
      m.nm.setColor(sel ? '#ffd24a' : '#e8e0d0');
      if (sel && !m._hi) {
        m._hi = this.add.graphics().setDepth(-0.5);
      }
      if (m._hi) { m._hi.clear(); if (sel) { m._hi.fillStyle(0x2c2c46, 0.6); m._hi.fillRoundedRect(m.x + 6, m.ry - 2, m.w - 12, 80, 6); } }
    });

    const c = this.party[this.member];

    // edges + node states
    this.edges.clear();
    for (const o of this.nodeObjs) {
      for (const rid of o.n.req) {
        const p = this.nodeObjs.find(q => q.n.id === rid);
        if (!p) continue;
        const lit = isLearned(c, o.n.id) || (isLearned(c, rid) && isLearnable(c, o.n.id));
        this.edges.lineStyle(3, lit ? 0x9a844a : 0x3a3a44, 1);
        this.edges.beginPath(); this.edges.moveTo(p.x, p.y); this.edges.lineTo(o.x, o.y); this.edges.strokePath();
      }
    }
    for (const o of this.nodeObjs) {
      const learned = isLearned(c, o.n.id);
      const avail = isLearnable(c, o.n.id);
      const afford = canAfford(c, o.n.id);
      let fill = 0x1c1c28, stroke = 0x555566;
      if (learned) { fill = o.n.type === 'ability' ? 0xd8a838 : 0x3a8a4a; stroke = 0xffe08a; }
      else if (avail && afford) { fill = 0x24243a; stroke = 0x6aff8a; }
      else if (avail) { fill = 0x24243a; stroke = 0xb0a050; }
      o.circle.setFillStyle(fill).setStrokeStyle(3, stroke);
      o.label.setColor(learned ? '#ffe0a0' : (avail ? '#e8e0d0' : '#6a655a'));
    }

    // cursor ring
    const cn = this.nodeObjs[this.nodeIndex];
    if (cn) this.cursorRing.setPosition(cn.x, cn.y).setVisible(true);

    // info panel
    const n = this.tree[this.nodeIndex];
    this.infoTitle.setText(this.nodeLabel(n));
    const learned = isLearned(c, n.id), avail = isLearnable(c, n.id), afford = canAfford(c, n.id);
    this.infoStatus.setText(learned ? '✓ Learned' : avail ? (afford ? 'Available' : 'Need more AP') : 'Locked')
      .setColor(learned ? '#9affb0' : avail && afford ? '#ffd24a' : '#c88a8a');
    this.infoCost.setText(learned ? '' : `Cost: ${n.ap} AP    You: ${c.ap} AP`);
    this.infoDesc.setText(n.type === 'ability'
      ? ABILITIES[n.ability].name + ' — ' + ABILITIES[n.ability].desc
      : `Permanently raises ${STAT_LABEL[n.stat]} by ${n.amount}.`);

    const s = derivedStats(c);
    const rows = [['maxHp', 'maxMp'], ['atk', 'def'], ['mag', 'res'], ['speed', null]];
    const statLines = rows.map(([a, b]) => {
      let ln = `${STAT_LABEL[a].padEnd(4)}${String(s[a]).padStart(5)}`;
      if (b) ln += `   ${STAT_LABEL[b].padEnd(4)}${String(s[b]).padStart(5)}`;
      return ln;
    });
    const known = knownAbilities(c).filter(a => a !== 'attack').map(a => ABILITIES[a].name);
    this.infoStats.setText(
      `Lv ${c.level}   EXP ${c.exp}/${expForNext(c.level)}\n` +
      statLines.join('\n') +
      `\n\nAbilities:\n${known.length ? known.join(', ') : '(none yet)'}`
    );
  }
}
