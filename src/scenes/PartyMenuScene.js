// ============================================================
//  Ashen Saga — Sphere Grid scene (FF10-style)
//  One shared grid; each character has a token. Move with the
//  arrows (spends S.Lv), activate the node you're on (spends a
//  matching sphere), unlock locked nodes with key spheres.
//  Camera follows the active token so the grid can be huge.
// ============================================================
import { CLASSES } from '../rpg/classes.js';
import { GRID, nodeLabel, SPHERE_COLOR, SPHERE_LABEL } from '../rpg/spheregrid.js';
import {
  derivedStats, knownAbilities, currentNode, neighbors, isUnlocked, isActivated,
  canMove, moveToken, canActivate, activateNode, canUnlock, unlockNode,
} from '../rpg/party.js';
import { ABILITIES } from '../data.js';
import { world } from '../world/state.js';
import Audio from './../audio.js';

const SCALE = 66;                 // grid units -> pixels
const NR = 16;                    // node radius
const TOKEN_TINT = [0xff6a6a, 0x6a9aff, 0x6affa0, 0xffd24a, 0xd07ad0];
const STAT_LABEL = { maxHp: 'HP', maxMp: 'MP', atk: 'ATK', def: 'DEF', mag: 'MAG', res: 'RES', speed: 'SPD' };

const NX = n => n.x * SCALE;
const NY = n => n.y * SCALE;

export default class PartyMenuScene extends Phaser.Scene {
  constructor() { super('partyMenu'); }

  create() {
    this.party = world.party;
    this.active = 0;
    this.uiObjs = [];
    this.worldObjs = [];

    // opaque grid-camera background hides the paused overworld behind us
    this.cameras.main.setBackgroundColor(0x0a0a12);

    // --- grid world (edges + nodes + labels + tokens) --------
    this.edgeG = this.add.graphics().setDepth(0);
    this.edgeG.lineStyle(3, 0x3a3a48, 1);
    for (const [a, b] of GRID.edges) {
      const na = GRID.byId[a], nb = GRID.byId[b];
      this.edgeG.lineBetween(NX(na), NY(na), NX(nb), NY(nb));
    }
    this.nodeG = this.add.graphics().setDepth(1);
    this.labels = GRID.nodes.map(n => this.add.text(NX(n), NY(n) + NR + 2, '', {
      fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#cfc8b8', align: 'center',
    }).setOrigin(0.5, 0).setDepth(2));
    this.tokens = this.party.map((c, i) =>
      this.add.circle(0, 0, 9, TOKEN_TINT[i]).setStrokeStyle(2, 0x000000).setDepth(6));
    this.ring = this.add.circle(0, 0, 13).setStrokeStyle(3, 0xffffff).setDepth(7);
    this.worldObjs.push(this.edgeG, this.nodeG, this.ring, ...this.labels, ...this.tokens);

    // --- fixed UI (rendered by a separate, un-zoomed camera) --
    this.uiObjs.push(this.add.text(480, 20, 'Sphere Grid', {
      fontFamily: 'Trebuchet MS', fontSize: '24px', fontStyle: 'bold', color: '#ffd24a',
      stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(50));
    this.buildMemberList();
    this.buildInfoPanel();
    this.uiObjs.push(this.add.text(480, 524, '↑↓←→ move    Space: activate    [ ] hero    +/- zoom    Esc/M close', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#9a9488',
    }).setOrigin(0.5).setDepth(50));

    // two cameras: main = grid (zoom + follow token), uiCam = fixed UI
    this.uiCam = this.cameras.add(0, 0, 960, 540);
    this.uiCam.setScroll(0, 0);
    this.cameras.main.ignore(this.uiObjs);
    this.uiCam.ignore(this.worldObjs);
    this.cameras.main.setZoom(0.8);
    this.cameras.main.startFollow(this.tokens[this.active], true, 0.2, 0.2);

    this.setupInput();
    this.refresh();
  }

  buildMemberList() {
    const x = 10, y = 54, w = 176, h = 440;
    this.panel(x, y, w, h);
    this.memberNodes = this.party.map((c, i) => {
      const ry = y + 12 + i * 84;
      const img = this.add.sprite(x + 28, ry + 30, 'dungeon').setScale(1.8).setFlipX(true).setScrollFactor(0).setDepth(51);
      if (this.anims.exists(CLASSES[c.classId].atlas + '_idle')) img.play(CLASSES[c.classId].atlas + '_idle');
      const dot = this.add.circle(x + 12, ry + 12, 5, TOKEN_TINT[i]).setScrollFactor(0).setDepth(51);
      const nm = this.add.text(x + 52, ry + 8, '', { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#e8e0d0' }).setScrollFactor(0).setDepth(51);
      const cl = this.add.text(x + 52, ry + 28, '', { fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#8a857a' }).setScrollFactor(0).setDepth(51);
      const slv = this.add.text(x + 52, ry + 46, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#9affb0' }).setScrollFactor(0).setDepth(51);
      const zone = this.add.zone(x, ry, w, 80).setOrigin(0, 0).setScrollFactor(0).setInteractive();
      zone.on('pointerdown', () => this.setActive(i));
      this.uiObjs.push(img, dot, nm, cl, slv);
      return { c, img, dot, nm, cl, slv, ry, x, w };
    });
  }

  buildInfoPanel() {
    const x = 774, y = 54, w = 176, h = 440;
    this.panel(x, y, w, h);
    this.spTitle = this.add.text(x + 14, y + 12, 'Spheres', { fontFamily: 'Trebuchet MS', fontSize: '15px', fontStyle: 'bold', color: '#ffd24a' }).setScrollFactor(0).setDepth(51);
    this.spText = this.add.text(x + 14, y + 36, '', { fontFamily: 'Courier New', fontSize: '13px', color: '#e8e0d0', lineSpacing: 2 }).setScrollFactor(0).setDepth(51);
    this.nodeTitle = this.add.text(x + 14, y + 150, '', { fontFamily: 'Trebuchet MS', fontSize: '16px', fontStyle: 'bold', color: '#ffd24a', wordWrap: { width: w - 28 } }).setScrollFactor(0).setDepth(51);
    this.nodeInfo = this.add.text(x + 14, y + 190, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#cfc8b8', wordWrap: { width: w - 28 } }).setScrollFactor(0).setDepth(51);
    this.statText = this.add.text(x + 14, y + 300, '', { fontFamily: 'Courier New', fontSize: '12px', color: '#e8e0d0', lineSpacing: 2 }).setScrollFactor(0).setDepth(51);
    this.uiObjs.push(this.spTitle, this.spText, this.nodeTitle, this.nodeInfo, this.statText);
  }

  panel(x, y, w, h) {
    const g = this.add.graphics().setScrollFactor(0).setDepth(50);
    g.fillStyle(0x0e0e16, 0.95); g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, 0x9a844a, 1); g.strokeRoundedRect(x, y, w, h, 8);
    this.uiObjs.push(g);
    return g;
  }

  // ---- input -----------------------------------------------
  setupInput() {
    const k = this.input.keyboard;
    k.on('keydown-UP', () => this.moveDir(0, -1));
    k.on('keydown-DOWN', () => this.moveDir(0, 1));
    k.on('keydown-LEFT', () => this.moveDir(-1, 0));
    k.on('keydown-RIGHT', () => this.moveDir(1, 0));
    k.on('keydown-SPACE', () => this.doActivate());
    k.on('keydown-ENTER', () => this.doActivate());
    k.on('keydown-OPEN_BRACKET', () => this.setActive(this.active - 1));
    k.on('keydown-CLOSED_BRACKET', () => this.setActive(this.active + 1));
    k.on('keydown-PLUS', () => this.zoom(0.15));
    k.on('keydown-MINUS', () => this.zoom(-0.15));
    k.on('keydown-ESC', () => this.close());
    k.on('keydown-M', () => this.close());
    this.input.on('wheel', (p, o, dx, dy) => this.zoom(dy > 0 ? -0.1 : 0.1));
  }

  zoom(d) { this.cameras.main.setZoom(Phaser.Math.Clamp(this.cameras.main.zoom + d, 0.45, 1.6)); }

  setActive(i) {
    this.active = Phaser.Math.Wrap(i, 0, this.party.length);
    this.cameras.main.startFollow(this.tokens[this.active], true, 0.2, 0.2);
    Audio.sfx('cursor');
    this.refresh();
  }

  moveDir(dx, dy) {
    const c = this.party[this.active];
    const cur = currentNode(c);
    let best = null, bestScore = 0.35;
    for (const id of neighbors(cur.id)) {
      const n = GRID.byId[id];
      const vx = n.x - cur.x, vy = n.y - cur.y, len = Math.hypot(vx, vy) || 1;
      const dot = (vx / len) * dx + (vy / len) * dy;
      if (dot > bestScore) { bestScore = dot; best = id; }
    }
    if (!best) return;
    const n = GRID.byId[best];
    if (n.lock && !isUnlocked(best)) {
      if (canUnlock(c, best)) { unlockNode(c, best); Audio.sfx('confirm'); this.refresh(); }
      else Audio.sfx('cancel');
      return;
    }
    if (moveToken(c, best)) { Audio.sfx('cursor'); this.refresh(); }
    else Audio.sfx('cancel');
  }

  doActivate() {
    const c = this.party[this.active];
    if (canActivate(c)) { activateNode(c); Audio.sfx('confirm'); this.refresh(); }
    else Audio.sfx('cancel');
  }

  close() { this.scene.resume('overworld'); this.scene.stop(); }

  // ---- render ----------------------------------------------
  refresh() {
    const c = this.party[this.active];

    // nodes
    this.nodeG.clear();
    for (const n of GRID.nodes) {
      const x = NX(n), y = NY(n);
      const locked = n.lock && !isUnlocked(n.id);
      const active = isActivated(c, n.id);
      let fill = 0x1c1c28, line = 0x555566;
      if (locked) { fill = 0x2a1414; line = 0xc23a3a; }
      else if (n.type === 'ability') { line = 0xffd24a; if (active) fill = 0x6a5320; }
      else if (n.type === 'stat') { line = SPHERE_COLOR[n.sphere]; if (active) fill = Phaser.Display.Color.ValueToColor(SPHERE_COLOR[n.sphere]).darken(55).color; }
      else { line = 0x6a6a72; }
      if (active) line = 0xffffff;
      this.nodeG.fillStyle(fill, 1); this.nodeG.fillCircle(x, y, NR);
      this.nodeG.lineStyle(3, line, 1); this.nodeG.strokeCircle(x, y, NR);
    }
    // labels
    GRID.nodes.forEach((n, i) => {
      const t = n.type === 'ability' ? (ABILITIES[n.ability] ? ABILITIES[n.ability].name : n.ability)
        : nodeLabel(n);
      this.labels[i].setText(t).setColor(isActivated(c, n.id) ? '#ffe0a0' : (n.lock && !isUnlocked(n.id) ? '#c86a6a' : '#b8b0a0'));
    });
    // tokens
    this.party.forEach((p, i) => {
      const n = GRID.byId[p.gridPos];
      this.tokens[i].setPosition(NX(n), NY(n) - (i === this.active ? 0 : 0));
    });
    const an = GRID.byId[c.gridPos];
    this.ring.setPosition(NX(an), NY(an));

    // member list
    this.memberNodes.forEach((m, i) => {
      const p = m.c;
      m.nm.setText(`${p.name} Lv${p.level}`).setColor(i === this.active ? '#ffd24a' : '#e8e0d0');
      m.cl.setText(CLASSES[p.classId].name);
      m.slv.setText(`S.Lv ${p.sLv}`);
    });

    // sphere inventory
    const s = world.spheres;
    this.spText.setText(
      `Power   ${s.power}\nMana    ${s.mana}\nSpeed   ${s.speed}\nAbility ${s.ability}\n` +
      `Keys 1-4: ${s.key1} ${s.key2} ${s.key3} ${s.key4}`
    );

    // current node info
    const node = currentNode(c);
    this.nodeTitle.setText(this.nodeName(node));
    const lines = [];
    if (node.type === 'stat') lines.push(`+${node.amount} ${STAT_LABEL[node.stat]}`);
    if (node.type === 'ability') lines.push(ABILITIES[node.ability] ? ABILITIES[node.ability].desc : '');
    if (node.type === 'stat' || node.type === 'ability') {
      lines.push(`Cost: 1 ${SPHERE_LABEL[node.sphere]} sphere`);
      lines.push(isActivated(c, node.id) ? '✓ Activated'
        : canActivate(c) ? 'Space to activate' : 'Need a ' + SPHERE_LABEL[node.sphere] + ' sphere');
    } else if (node.lock && !isUnlocked(node.id)) {
      lines.push(`Locked — needs a Lv${node.lock} Key sphere`);
    } else {
      lines.push('(junction)');
    }
    this.nodeInfo.setText(lines.join('\n'));

    // stats
    const st = derivedStats(c);
    const known = knownAbilities(c).filter(a => a !== 'attack').map(a => ABILITIES[a].name);
    this.statText.setText(
      `HP ${st.maxHp}  MP ${st.maxMp}\nATK ${st.atk}  DEF ${st.def}\nMAG ${st.mag}  RES ${st.res}\nSPD ${st.speed}\n\nAbilities:\n${known.length ? known.join(', ') : '(base only)'}`
    );
  }

  nodeName(n) {
    if (n.type === 'ability') return ABILITIES[n.ability] ? ABILITIES[n.ability].name : n.ability;
    if (n.type === 'stat') return `+${n.amount} ${STAT_LABEL[n.stat]}`;
    if (n.lock && !isUnlocked(n.id)) return `Lv${n.lock} Lock`;
    return 'Junction';
  }
}
