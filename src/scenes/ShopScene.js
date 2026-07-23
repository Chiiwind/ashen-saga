// ============================================================
//  Ashen Saga — ShopScene
//  Buy from the merchant's stock / sell from your inventory.
//  Opened from a town merchant; returns to the town on close.
// ============================================================
import { ITEMS, WPN_LABEL, WEIGHT_LABEL, TIER_NAME } from '../rpg/items.js';
import { world, saveGame } from '../world/state.js';
import Audio from './../audio.js';

const STAT_LABEL = { maxHp: 'HP', maxMp: 'MP', atk: 'ATK', def: 'DEF', mag: 'MAG', res: 'RES', speed: 'SPD' };

// Act I merchant stock (Iron/Steel + basics)
export const ACT1_STOCK = [
  'iron_sword', 'iron_greatsword', 'iron_axe', 'iron_mace', 'ash_staff', 'hunting_bow', 'flintlock', 'iron_dagger',
  'steel_longsword', 'steel_waraxe', 'ember_staff', 'yew_longbow', 'silver_pistol', 'rondel',
  'iron_plate', 'leather_brigandine', 'padded_robe', 'chainmail', 'mage_robe',
  'ring_vigor', 'ring_focus', 'swift_boots', 'power_band', 'arcane_band', 'guardian_charm', 'eagle_eye',
];

function modsStr(it) {
  const parts = [];
  for (const k in (it.mods || {})) parts.push(`${STAT_LABEL[k]}${it.mods[k] >= 0 ? '+' : ''}${it.mods[k]}`);
  if (it.effect && it.effect.crit) parts.push(`Crit+${Math.round(it.effect.crit * 100)}%`);
  if (it.effect && it.effect.lifesteal) parts.push(`LS ${Math.round(it.effect.lifesteal * 100)}%`);
  return parts.join('  ');
}
const kindOf = it => it.type === 'weapon' ? WPN_LABEL[it.wpn] : it.type === 'armour' ? WEIGHT_LABEL[it.weight] + ' Armour' : 'Accessory';

export default class ShopScene extends Phaser.Scene {
  constructor() { super('shop'); }

  init(data) { this.stock = (data && data.stock) || ACT1_STOCK; this.returnScene = (data && data.returnScene) || 'town'; }

  create() {
    this.mode = 'buy';
    this.cursor = 0;
    this.cameras.main.setBackgroundColor(0x0a0a12);

    this.title = this.add.text(480, 20, '', { fontFamily: 'Trebuchet MS', fontSize: '24px', fontStyle: 'bold', color: '#ffd24a', stroke: '#000', strokeThickness: 5 }).setOrigin(0.5);
    this.goldText = this.add.text(948, 22, '', { fontFamily: 'Trebuchet MS', fontSize: '17px', color: '#ffd24a' }).setOrigin(1, 0.5);
    this.add.text(480, 522, '↑↓ move   Enter: buy/sell   Tab: switch   Esc close', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#9a9488' }).setOrigin(0.5);

    this.panel(20, 54, 620, 440);
    this.listText = this.add.text(38, 72, '', { fontFamily: 'Courier New', fontSize: '14px', color: '#e8e0d0', lineSpacing: 4 });
    this.panel(652, 54, 296, 440);
    this.infoText = this.add.text(670, 72, '', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#cfc8b8', wordWrap: { width: 262 }, lineSpacing: 3 });

    const k = this.input.keyboard;
    k.on('keydown-UP', () => this.move(-1));
    k.on('keydown-DOWN', () => this.move(1));
    k.on('keydown-ENTER', () => this.act());
    k.on('keydown-SPACE', () => this.act());
    k.on('keydown-TAB', () => this.toggle());
    k.on('keydown-LEFT', () => this.toggle());
    k.on('keydown-RIGHT', () => this.toggle());
    k.on('keydown-ESC', () => this.close());
    this.render();
  }

  panel(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x0e0e16, 0.95); g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, 0x9a844a, 1); g.strokeRoundedRect(x, y, w, h, 8);
    return g;
  }

  list() { return this.mode === 'buy' ? this.stock : world.inventory; }
  price(id, buying) { const p = ITEMS[id].price; return buying ? p : Math.floor(p / 2); }

  toggle() { this.mode = this.mode === 'buy' ? 'sell' : 'buy'; this.cursor = 0; Audio.sfx('cursor'); this.render(); }
  move(d) { const n = this.list().length; if (!n) return; this.cursor = Phaser.Math.Wrap(this.cursor + d, 0, n); Audio.sfx('cursor'); this.render(); }

  act() {
    const arr = this.list();
    if (!arr.length) return;
    const id = arr[this.cursor];
    if (this.mode === 'buy') {
      const cost = this.price(id, true);
      if (world.gold < cost) { Audio.sfx('cancel'); return; }
      world.gold -= cost; world.inventory.push(id);
      Audio.sfx('confirm');
    } else {
      const gain = this.price(id, false);
      world.gold += gain; world.inventory.splice(this.cursor, 1);
      if (this.cursor >= world.inventory.length) this.cursor = Math.max(0, world.inventory.length - 1);
      Audio.sfx('confirm');
    }
    saveGame();
    this.render();
  }

  close() { this.scene.resume(this.returnScene); this.scene.stop(); }

  render() {
    this.title.setText(this.mode === 'buy' ? "Pedlar Rosa — Buy" : "Pedlar Rosa — Sell");
    this.goldText.setText(world.gold + ' gold');
    const arr = this.list();
    if (!arr.length) {
      this.listText.setText(this.mode === 'buy' ? '(no stock)' : "(nothing to sell)");
      this.infoText.setText('');
      return;
    }
    const lines = arr.map((id, i) => {
      const it = ITEMS[id];
      const p = this.price(id, this.mode === 'buy');
      const sel = i === this.cursor;
      return `${sel ? '▶ ' : '  '}${it.name.padEnd(22)} ${(p + 'g').padStart(6)}`;
    });
    this.listText.setText(lines.join('\n'));

    const it = ITEMS[arr[this.cursor]];
    this.infoText.setText(
      `${it.name}\n${TIER_NAME[it.tier]} · ${kindOf(it)}\n\n${modsStr(it)}` +
      `${it.effect && it.effect.desc ? '\n\n' + it.effect.desc : ''}` +
      `\n\n${this.mode === 'buy' ? 'Buy for ' + this.price(it.id, true) : 'Sell for ' + this.price(it.id, false)} gold`
    );
  }
}
