// ============================================================
//  Ashen Saga — EquipScene
//  Manage each character's weapon / armour / accessories from
//  the shared inventory. Opened from the overworld with 'I'.
// ============================================================
import { CLASSES } from '../rpg/classes.js';
import { ITEMS, canClassUse, WPN_LABEL, WEIGHT_LABEL, CLASS_EQUIP } from '../rpg/items.js';
import { derivedStats, equipItem, unequip } from '../rpg/party.js';
import { world } from '../world/state.js';
import Audio from './../audio.js';

const TOKEN_TINT = [0xff6a6a, 0x6a9aff, 0x6affa0, 0xffd24a, 0xd07ad0];
const STAT_LABEL = { maxHp: 'HP', maxMp: 'MP', atk: 'ATK', def: 'DEF', mag: 'MAG', res: 'RES', speed: 'SPD' };

function modsStr(it) {
  const parts = [];
  for (const k in (it.mods || {})) parts.push(`${STAT_LABEL[k]}${it.mods[k] >= 0 ? '+' : ''}${it.mods[k]}`);
  if (it.effect && it.effect.crit) parts.push(`Crit+${Math.round(it.effect.crit * 100)}%`);
  if (it.effect && it.effect.lifesteal) parts.push(`Lifesteal ${Math.round(it.effect.lifesteal * 100)}%`);
  return parts.join('  ');
}

export default class EquipScene extends Phaser.Scene {
  constructor() { super('equip'); }

  init(data) { this.returnScene = (data && data.returnScene) || 'overworld'; }

  create() {
    this.party = world.party;
    this.active = 0;
    this.cursor = 0;
    this.cameras.main.setBackgroundColor(0x0a0a12);

    this.add.text(480, 20, 'Equipment', {
      fontFamily: 'Trebuchet MS', fontSize: '24px', fontStyle: 'bold', color: '#ffd24a', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(480, 522, '↑↓ move   Enter: equip / unequip   [ ] hero   Esc/I close', {
      fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#9a9488',
    }).setOrigin(0.5);

    this.buildMemberList();
    this.panel(230, 54, 480, 440);
    this.listText = this.add.text(248, 70, '', { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#e8e0d0', lineSpacing: 3 });
    this.panel(722, 54, 226, 440);
    this.statText = this.add.text(738, 70, '', { fontFamily: 'Courier New', fontSize: '13px', color: '#e8e0d0', lineSpacing: 3 });
    this.infoText = this.add.text(738, 300, '', { fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#cfc8b8', wordWrap: { width: 200 } });

    this.setupInput();
    this.rebuild();
  }

  buildMemberList() {
    const x = 10, y = 54, w = 210, h = 440;
    this.panel(x, y, w, h);
    this.memberNodes = this.party.map((c, i) => {
      const ry = y + 12 + i * 84;
      const img = this.add.sprite(x + 30, ry + 30, 'dungeon').setScale(1.8).setFlipX(true);
      if (this.anims.exists(CLASSES[c.classId].atlas + '_idle')) img.play(CLASSES[c.classId].atlas + '_idle');
      const dot = this.add.circle(x + 12, ry + 12, 5, TOKEN_TINT[i]);
      const nm = this.add.text(x + 52, ry + 10, '', { fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#e8e0d0' });
      const cl = this.add.text(x + 52, ry + 30, '', { fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#8a857a' });
      const zone = this.add.zone(x, ry, w, 80).setOrigin(0, 0).setInteractive();
      zone.on('pointerdown', () => this.setActive(i));
      return { c, img, nm, cl };
    });
  }

  panel(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x0e0e16, 0.95); g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, 0x9a844a, 1); g.strokeRoundedRect(x, y, w, h, 8);
    return g;
  }

  setupInput() {
    const k = this.input.keyboard;
    k.on('keydown-UP', () => this.move(-1));
    k.on('keydown-DOWN', () => this.move(1));
    k.on('keydown-ENTER', () => this.act());
    k.on('keydown-SPACE', () => this.act());
    k.on('keydown-OPEN_BRACKET', () => this.setActive(this.active - 1));
    k.on('keydown-CLOSED_BRACKET', () => this.setActive(this.active + 1));
    k.on('keydown-ESC', () => this.close());
    k.on('keydown-I', () => this.close());
  }

  setActive(i) { this.active = Phaser.Math.Wrap(i, 0, this.party.length); this.cursor = 0; Audio.sfx('cursor'); this.rebuild(); }

  // rows = equipped slots + usable inventory (headers are non-selectable)
  buildRows() {
    const c = this.party[this.active];
    const rows = [{ header: 'EQUIPPED' }];
    rows.push({ kind: 'slot', slot: 'weapon', label: 'Weapon', itemId: c.equipment.weapon });
    rows.push({ kind: 'slot', slot: 'armour', label: 'Armour', itemId: c.equipment.armour });
    c.equipment.accessories.forEach((id, idx) => rows.push({ kind: 'slot', slot: 'accessory', accIndex: idx, label: 'Accessory ' + (idx + 1), itemId: id }));
    rows.push({ header: 'INVENTORY' });
    const usable = world.inventory.filter(id => ITEMS[id] && canClassUse(c.classId, ITEMS[id]));
    if (!usable.length) rows.push({ note: '(nothing this hero can use)' });
    usable.forEach(id => rows.push({ kind: 'item', itemId: id }));
    return rows;
  }

  selectable(r) { return r.kind === 'slot' || r.kind === 'item'; }

  move(d) {
    const rows = this.rows;
    let i = this.cursor;
    for (let n = 0; n < rows.length; n++) {
      i = Phaser.Math.Wrap(i + d, 0, rows.length);
      if (this.selectable(rows[i])) { this.cursor = i; Audio.sfx('cursor'); this.render(); return; }
    }
  }

  act() {
    const r = this.rows[this.cursor];
    const c = this.party[this.active];
    if (!r) return;
    if (r.kind === 'slot') {
      if (r.itemId && unequip(c, r.slot, r.accIndex)) Audio.sfx('cancel'); else Audio.sfx('cancel');
    } else if (r.kind === 'item') {
      if (equipItem(c, r.itemId)) Audio.sfx('confirm'); else Audio.sfx('cancel');
    }
    this.rebuild();
  }

  close() { this.scene.resume(this.returnScene); this.scene.stop(); }

  rebuild() {
    this.rows = this.buildRows();
    // keep cursor on a selectable row
    if (!this.rows[this.cursor] || !this.selectable(this.rows[this.cursor])) {
      this.cursor = this.rows.findIndex(r => this.selectable(r));
      if (this.cursor < 0) this.cursor = 0;
    }
    this.render();
  }

  render() {
    const c = this.party[this.active];
    this.memberNodes.forEach((m, i) => {
      m.nm.setText(`${m.c.name} Lv${m.c.level}`).setColor(i === this.active ? '#ffd24a' : '#e8e0d0');
      m.cl.setText(CLASSES[m.c.classId].name);
    });

    // list
    const lines = this.rows.map((r, i) => {
      const sel = i === this.cursor;
      const arrow = sel ? '▶ ' : '  ';
      if (r.header) return `\n[color=#9a844a]${r.header}[/color]`;
      if (r.note) return `   ${r.note}`;
      if (r.kind === 'slot') {
        const it = r.itemId ? ITEMS[r.itemId] : null;
        return `${arrow}${r.label.padEnd(12)} ${it ? it.name : '— empty —'}`;
      }
      const it = ITEMS[r.itemId];
      return `${arrow}${it.name}`;
    });
    // Phaser text has no rich color; strip tags and render plainly with a cursor
    this.listText.setText(lines.map(l => l.replace(/\[color=[^\]]+\]|\[\/color\]/g, '')).join('\n'));

    // class equip summary
    const eq = CLASS_EQUIP[c.classId];
    const useStr = `Weapons: ${eq.weapons.map(w => WPN_LABEL[w]).join(', ')}\n` +
      `Armour: ${eq.weights.map(w => WEIGHT_LABEL[w]).join(', ')}\nAccessory slots: ${eq.accSlots}`;

    // stats
    const s = derivedStats(c);
    this.statText.setText(
      `HP ${s.maxHp}   MP ${s.maxMp}\nATK ${s.atk}   DEF ${s.def}\nMAG ${s.mag}   RES ${s.res}\nSPD ${s.speed}\n\n${useStr}`
    );

    // info for the hovered row
    const r = this.rows[this.cursor];
    let info = '';
    const it = r && r.itemId ? ITEMS[r.itemId] : null;
    if (it) info = `${it.name}\n${modsStr(it)}${it.effect && it.effect.desc ? '\n' + it.effect.desc : ''}`;
    else if (r && r.kind === 'slot') info = 'Empty slot — pick an item below to equip.';
    this.infoText.setText(info);
  }
}
