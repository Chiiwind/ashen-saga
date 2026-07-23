// ============================================================
//  Ashen Saga — PartyCreateScene
//  Build your band of five: for each slot, pick a class and
//  type a name. Runs before the overworld when no party exists.
// ============================================================
import { CLASS_LIST, CLASSES } from '../rpg/classes.js';
import { makeCharacter, derivedStats } from '../rpg/party.js';
import { ABILITIES } from '../data.js';
import { world } from '../world/state.js';
import { buildUnitTextures } from '../sprites.js';

const NAME_POOL = [
  ['Bram', 'Kael', 'Roderick', 'Otto', 'Gunnar'],
  ['Aldric', 'Sigmar', 'Cassius', 'Emeric', 'Wolfram'],
  ['Magda', 'Ysolde', 'Elspeth', 'Katarin', 'Ravenna'],
  ['Faelan', 'Sylas', 'Lorwyn', 'Aeryn', 'Thelian'],
  ['Poppy', 'Milo', 'Bramble', 'Tilda', 'Dobbin'],
];
const STAT_ROWS = [
  ['maxHp', 'HP'], ['maxMp', 'MP'], ['atk', 'ATK'], ['def', 'DEF'],
  ['mag', 'MAG'], ['res', 'RES'], ['speed', 'SPD'],
];

export default class PartyCreateScene extends Phaser.Scene {
  constructor() { super('partyCreate'); }

  create() {
    buildUnitTextures(this);
    this.cameras.main.setBackgroundColor('#0a0a12');

    this.slot = 0;
    this.built = [];
    this.mode = 'class';           // 'class' | 'name'
    this.classIndex = 0;
    this.nameStr = '';

    this.add.text(480, 26, 'Assemble Your Band', {
      fontFamily: 'Trebuchet MS', fontSize: '30px', fontStyle: 'bold',
      color: '#ffd24a', stroke: '#000', strokeThickness: 5,
    }).setOrigin(0.5);
    this.slotLabel = this.add.text(480, 58, '', {
      fontFamily: 'Trebuchet MS', fontSize: '16px', color: '#b8b0a0',
    }).setOrigin(0.5);

    this.buildRoster();
    this.buildDetail();
    this.buildRoster_partyStrip();
    this.hint = this.add.text(480, 512, '', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#9a9488',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.refresh();
  }

  // ---- left: class roster ----------------------------------
  buildRoster() {
    const x = 24, y = 84, w = 300, h = 372;
    this.panel(x, y, w, h);
    this.rosterNodes = CLASS_LIST.map((cls, i) => {
      const t = this.add.text(x + 18, y + 16 + i * 42, '', {
        fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#e8e0d0',
      }).setInteractive({ useHandCursor: true });
      const sub = this.add.text(x + 18, y + 38 + i * 42, cls.role, {
        fontFamily: 'Trebuchet MS', fontSize: '12px', color: '#8a857a',
      });
      t.on('pointerover', () => { if (this.mode === 'class') { this.classIndex = i; this.refresh(); } });
      t.on('pointerdown', () => { if (this.mode === 'class') { this.classIndex = i; this.chooseClass(); } });
      return { t, sub, cls };
    });
  }

  // ---- right: selected class detail ------------------------
  buildDetail() {
    const x = 344, y = 84, w = 592, h = 300;
    this.panel(x, y, w, h);
    this.portrait = this.add.sprite(x + 90, y + 150, 'dungeon').setScale(4.5).setFlipX(true);
    this.dName = this.add.text(x + 176, y + 22, '', {
      fontFamily: 'Trebuchet MS', fontSize: '24px', fontStyle: 'bold', color: '#ffd24a',
    });
    this.dRole = this.add.text(x + 176, y + 54, '', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#8ab6ff',
    });
    this.dBlurb = this.add.text(x + 176, y + 80, '', {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#cfc8b8',
      wordWrap: { width: w - 200 },
    });
    this.dStats = this.add.text(x + 176, y + 150, '', {
      fontFamily: 'Courier New', fontSize: '15px', color: '#e8e0d0', lineSpacing: 3,
    });
    this.dSkills = this.add.text(x + 176, y + 250, '', {
      fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#9affb0',
      wordWrap: { width: w - 200 },
    });

    // name-entry field (shown in name mode)
    this.nameBox = this.add.container(0, 0).setVisible(false);
    const nx = 344, ny = 396, nw = 592, nh = 52;
    const ng = this.add.graphics();
    ng.fillStyle(0x14141c, 0.95); ng.fillRoundedRect(nx, ny, nw, nh, 8);
    ng.lineStyle(2, 0x9a844a, 1); ng.strokeRoundedRect(nx, ny, nw, nh, 8);
    const nlab = this.add.text(nx + 16, ny + 16, 'Name:', {
      fontFamily: 'Trebuchet MS', fontSize: '18px', color: '#b8b0a0',
    });
    this.nameField = this.add.text(nx + 84, ny + 15, '', {
      fontFamily: 'Trebuchet MS', fontSize: '20px', color: '#ffffff',
    });
    this.nameBox.add([ng, nlab, this.nameField]);
  }

  buildRoster_partyStrip() {
    this.stripNodes = [];
    for (let i = 0; i < 5; i++) {
      const x = 344 + i * 120, y = 464;
      const g = this.add.graphics();
      g.lineStyle(2, 0x3a3a48, 1); g.strokeRoundedRect(x, y, 108, 42, 6);
      const img = this.add.sprite(x + 22, y + 21, 'dungeon').setScale(1.7).setFlipX(true).setVisible(false);
      const nm = this.add.text(x + 40, y + 8, '', {
        fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#e8e0d0',
      });
      const cl = this.add.text(x + 40, y + 24, '', {
        fontFamily: 'Trebuchet MS', fontSize: '11px', color: '#8a857a',
      });
      this.stripNodes.push({ img, nm, cl });
    }
  }

  panel(x, y, w, h) {
    const g = this.add.graphics();
    g.fillStyle(0x0e0e16, 0.92); g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, 0x9a844a, 1); g.strokeRoundedRect(x, y, w, h, 8);
    return g;
  }

  // ---- input -----------------------------------------------
  onKey(e) {
    if (this.mode === 'class') {
      if (e.key === 'ArrowUp') { this.classIndex = Phaser.Math.Wrap(this.classIndex - 1, 0, CLASS_LIST.length); this.refresh(); }
      else if (e.key === 'ArrowDown') { this.classIndex = Phaser.Math.Wrap(this.classIndex + 1, 0, CLASS_LIST.length); this.refresh(); }
      else if (e.key === 'Enter') this.chooseClass();
    } else { // name entry
      if (e.key === 'Enter') this.confirmName();
      else if (e.key === 'Escape') { this.mode = 'class'; this.refresh(); }
      else if (e.key === 'Backspace') { this.nameStr = this.nameStr.slice(0, -1); this.refresh(); }
      else if (/^[a-zA-Z' -]$/.test(e.key) && this.nameStr.length < 14) { this.nameStr += e.key; this.refresh(); }
    }
  }

  chooseClass() {
    this.mode = 'name';
    this.nameStr = NAME_POOL[this.slot][this.classIndex % NAME_POOL[this.slot].length];
    this.refresh();
  }

  confirmName() {
    const name = this.nameStr.trim();
    if (!name) return;
    const cls = CLASS_LIST[this.classIndex];
    this.built.push(makeCharacter(name, cls.id));
    this.slot++;
    if (this.slot >= 5) {
      world.party = this.built;
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('overworld'));
      return;
    }
    this.mode = 'class';
    this.refresh();
  }

  // ---- render ----------------------------------------------
  refresh() {
    this.slotLabel.setText(`Hero ${this.slot + 1} of 5`);
    const cls = CLASS_LIST[this.classIndex];

    this.rosterNodes.forEach((n, i) => {
      const sel = i === this.classIndex;
      n.t.setText((sel ? '▶ ' : '   ') + n.cls.name);
      n.t.setColor(sel ? '#ffd24a' : '#e8e0d0');
    });

    if (this.anims.exists(cls.atlas + '_idle')) this.portrait.play(cls.atlas + '_idle', true);
    this.portrait.setFlipX(true);
    this.dName.setText(cls.name);
    this.dRole.setText(cls.role);
    this.dBlurb.setText(cls.blurb);
    const s = derivedStats(makeCharacter('', cls.id));
    const lines = [];
    for (let i = 0; i < STAT_ROWS.length; i += 2) {
      const a = STAT_ROWS[i], b = STAT_ROWS[i + 1];
      let ln = `${a[1].padEnd(4)}${String(s[a[0]]).padStart(5)}`;
      if (b) ln += `      ${b[1].padEnd(4)}${String(s[b[0]]).padStart(5)}`;
      lines.push(ln);
    }
    this.dStats.setText(lines.join('\n'));
    const starters = cls.start.filter(a => a !== 'attack').map(a => ABILITIES[a].name);
    this.dSkills.setText('Starts with: ' + (starters.length ? starters.join(', ') : 'Attack only') +
      '\n(learn more with AP in the skill tree)');

    this.nameBox.setVisible(this.mode === 'name');
    this.nameField.setText(this.nameStr + (this.mode === 'name' ? '_' : ''));
    this.hint.setText(this.mode === 'class'
      ? '↑/↓ choose class    Enter: pick'
      : "Type a name    Enter: confirm    Esc: back");

    // party-so-far strip
    this.stripNodes.forEach((sn, i) => {
      const c = this.built[i];
      if (c) {
        if (this.anims.exists(CLASSES[c.classId].atlas + '_idle')) sn.img.play(CLASSES[c.classId].atlas + '_idle', true);
        sn.img.setFlipX(true).setVisible(true);
        sn.nm.setText(c.name);
        sn.cl.setText(CLASSES[c.classId].name);
      } else {
        sn.img.setVisible(false); sn.nm.setText(i === this.slot ? '…' : ''); sn.cl.setText('');
      }
    });
  }
}
