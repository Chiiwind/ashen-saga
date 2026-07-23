// ============================================================
//  Ashen Saga — character classes + skill trees
//  Each class: level-1 base stats, per-level growth, the
//  abilities it starts knowing, and a branching skill tree.
//
//  Tree node:
//    { id, type:'ability'|'stat', name, ap, desc?, req:[ids], root?, col, row,
//      ability:'id'            (type 'ability')
//      stat:'atk', amount:N    (type 'stat'; stat keys = derived-stat keys) }
//  A node is learnable when it is a root OR any node in req is learned.
// ============================================================

// stat-node helper
const S = (id, stat, amount, ap, col, row, req, root) =>
  ({ id, type: 'stat', stat, amount, ap, col, row, req: req || [], root: !!root,
     name: '+' + amount + ' ' + ({ maxHp: 'HP', maxMp: 'MP', atk: 'ATK', def: 'DEF', mag: 'MAG', res: 'RES', speed: 'SPD' }[stat]) });
// ability-node helper
const A = (id, ability, name, ap, col, row, req, root) =>
  ({ id, type: 'ability', ability, name, ap, col, row, req: req || [], root: !!root });

export const CLASSES = {
  greatsword: {
    id: 'greatsword', name: 'Greatsword', role: 'Frontline warrior', sprite: 'warrior', atlas: 'knight_m',
    blurb: 'A hulking soldier in heavy plate. Soaks blows and hits like a falling wall.',
    base:   { maxHp: 168, maxMp: 20, atk: 30, def: 24, mag: 8,  res: 14, speed: 8 },
    growth: { maxHp: 15,  maxMp: 2,  atk: 3.2, def: 2.6, mag: 0.4, res: 1.1, speed: 0.3 },
    start: ['attack'],
    tree: [
      S('gs1', 'maxHp', 20, 3, 0, 1, [], true),
      A('gs2', 'guard',      'Guard',        4, 1, 0, ['gs1']),
      A('gs3', 'sunder',     'Sunder',       5, 1, 2, ['gs1']),
      S('gs4', 'atk', 4, 6, 2, 0, ['gs2']),
      A('gs5', 'heroicBlow', 'Heroic Blow',  9, 2, 1, ['gs2', 'gs3']),
      S('gs6', 'def', 3, 6, 2, 2, ['gs3']),
      A('gs7', 'rally',      'Rally',       12, 3, 1, ['gs5']),
      S('gs8', 'maxHp', 30, 8, 3, 2, ['gs6']),
    ],
  },
  priest: {
    id: 'priest', name: 'Warrior Priest', role: 'Holy hybrid', sprite: 'priest', atlas: 'knight_f',
    blurb: 'Faith and a heavy mace. Mends the band and smites the unclean.',
    base:   { maxHp: 144, maxMp: 44, atk: 24, def: 20, mag: 26, res: 20, speed: 8 },
    growth: { maxHp: 12,  maxMp: 4,  atk: 2, def: 2, mag: 2.4, res: 1.6, speed: 0.4 },
    start: ['attack', 'healingPrayer'],
    tree: [
      S('wp1', 'maxMp', 12, 3, 0, 1, [], true),
      A('wp2', 'smite',        'Smite',         4,  1, 0, ['wp1']),
      A('wp3', 'benediction',  'Benediction',   6,  1, 2, ['wp1']),
      S('wp4', 'mag', 4, 6, 2, 0, ['wp2']),
      A('wp5', 'greaterHeal',  'Greater Heal',  12, 2, 1, ['wp2', 'wp3']),
      S('wp6', 'res', 3, 6, 2, 2, ['wp3']),
      A('wp7', 'righteousFury','Righteous Fury',14, 3, 0, ['wp4']),
      S('wp8', 'maxHp', 24, 8, 3, 2, ['wp6']),
    ],
  },
  brightWizard: {
    id: 'brightWizard', name: 'Bright Wizard', role: 'Fire mage', sprite: 'wizard', atlas: 'wizard_m',
    blurb: 'Wields the Lore of Fire. Glass-brittle, but burns everything to ash.',
    base:   { maxHp: 94, maxMp: 74, atk: 14, def: 12, mag: 40, res: 24, speed: 11 },
    growth: { maxHp: 7,  maxMp: 6,  atk: 1, def: 1, mag: 4, res: 2, speed: 0.5 },
    start: ['attack', 'fireball'],
    tree: [
      S('bw1', 'maxMp', 12, 3, 0, 1, [], true),
      A('bw2', 'flameLance',   'Flame Lance',   8,  1, 0, ['bw1']),
      A('bw3', 'cinderStorm',  'Cinder Storm',  8,  1, 2, ['bw1']),
      S('bw4', 'mag', 5, 7, 2, 0, ['bw2']),
      A('bw5', 'conflagration','Conflagration', 16, 2, 1, ['bw2', 'bw3']),
      S('bw6', 'maxMp', 16, 7, 2, 2, ['bw3']),
      S('bw7', 'speed', 2, 8, 3, 1, ['bw5']),
    ],
  },
  slayer: {
    id: 'slayer', name: 'Dwarf Slayer', role: 'Berserker', sprite: 'slayer', atlas: 'lizard_m',
    blurb: 'A death-seeking dwarf, axes bared. Trades his own blood for carnage.',
    base:   { maxHp: 148, maxMp: 20, atk: 38, def: 16, mag: 6, res: 10, speed: 10 },
    growth: { maxHp: 13,  maxMp: 1,  atk: 3.6, def: 1.5, mag: 0.3, res: 1, speed: 0.4 },
    start: ['attack', 'recklessSwing'],
    tree: [
      S('ds1', 'maxHp', 24, 3, 0, 1, [], true),
      A('ds2', 'oathRoar',     'Oath Roar',     4,  1, 0, ['ds1']),
      A('ds3', 'whirlwind',    'Whirlwind',     8,  1, 2, ['ds1']),
      S('ds4', 'atk', 5, 7, 2, 0, ['ds2']),
      A('ds5', 'grudgeStrike', 'Grudge Strike', 10, 2, 1, ['ds2', 'ds3']),
      S('ds6', 'atk', 5, 8, 2, 2, ['ds3']),
      S('ds7', 'maxHp', 30, 8, 3, 1, ['ds5']),
    ],
  },
  waywatcher: {
    id: 'waywatcher', name: 'Waywatcher', role: 'Elf archer', sprite: 'archer', atlas: 'elf_m',
    blurb: 'A silent elf marksman. Strikes first, strikes true, from afar.',
    base:   { maxHp: 110, maxMp: 40, atk: 30, def: 14, mag: 16, res: 16, speed: 13 },
    growth: { maxHp: 9,  maxMp: 3,  atk: 3, def: 1.2, mag: 1.5, res: 1.2, speed: 0.6 },
    start: ['attack', 'aimedShot'],
    tree: [
      S('ww1', 'speed', 1, 3, 0, 1, [], true),
      A('ww2', 'huntersMark', "Hunter's Mark", 5, 1, 0, ['ww1']),
      A('ww3', 'volley',      'Volley',        8, 1, 2, ['ww1']),
      A('ww4', 'swiftAim',    'Swift Aim',     6, 2, 0, ['ww2']),
      S('ww5', 'atk', 4, 7, 2, 1, ['ww2', 'ww3']),
      S('ww6', 'speed', 2, 8, 2, 2, ['ww3']),
      S('ww7', 'maxHp', 20, 8, 3, 1, ['ww5']),
    ],
  },
  witchHunter: {
    id: 'witchHunter', name: 'Witch Hunter', role: 'Zealot duellist', sprite: 'hunter', atlas: 'lizard_f',
    blurb: 'Pistol and silvered blade. Hunts the witch, the mutant, the damned.',
    base:   { maxHp: 122, maxMp: 36, atk: 28, def: 18, mag: 18, res: 18, speed: 11 },
    growth: { maxHp: 10,  maxMp: 3,  atk: 2.8, def: 1.6, mag: 1.6, res: 1.4, speed: 0.5 },
    start: ['attack', 'pistolShot'],
    tree: [
      S('wh1', 'atk', 3, 3, 0, 1, [], true),
      A('wh2', 'accusation',   'Accusation',    5, 1, 0, ['wh1']),
      A('wh3', 'steelResolve', 'Steel Resolve', 5, 1, 2, ['wh1']),
      A('wh4', 'blessedBlade', 'Blessed Blade', 9, 2, 0, ['wh2']),
      S('wh5', 'atk', 4, 7, 2, 1, ['wh2', 'wh3']),
      S('wh6', 'res', 3, 6, 2, 2, ['wh3']),
      S('wh7', 'maxHp', 22, 8, 3, 1, ['wh5']),
    ],
  },
  greyWizard: {
    id: 'greyWizard', name: 'Grey Wizard', role: 'Debuffer', sprite: 'greywiz', atlas: 'wizard_f',
    blurb: 'Master of the Grey Wind. Unmakes a foe before it can raise a blade.',
    base:   { maxHp: 98, maxMp: 70, atk: 14, def: 13, mag: 36, res: 26, speed: 10 },
    growth: { maxHp: 7,  maxMp: 5.5, atk: 1, def: 1, mag: 3.6, res: 2.2, speed: 0.5 },
    start: ['attack', 'shadowBolt'],
    tree: [
      S('gw1', 'maxMp', 12, 3, 0, 1, [], true),
      A('gw2', 'enfeeble',  'Enfeeble',   5,  1, 0, ['gw1']),
      A('gw3', 'lifeDrain', 'Life Drain', 8,  1, 2, ['gw1']),
      A('gw4', 'miasma',    'Miasma',     12, 2, 0, ['gw2']),
      S('gw5', 'mag', 5, 7, 2, 1, ['gw2', 'gw3']),
      S('gw6', 'res', 3, 6, 2, 2, ['gw3']),
      S('gw7', 'maxMp', 16, 8, 3, 1, ['gw5']),
    ],
  },
  physician: {
    id: 'physician', name: 'Halfling Physician', role: 'Support', sprite: 'physician', atlas: 'elf_f',
    blurb: 'A halfling field-surgeon with a satchel of tonics, bombs, and cheer.',
    base:   { maxHp: 104, maxMp: 60, atk: 16, def: 14, mag: 28, res: 20, speed: 12 },
    growth: { maxHp: 8,  maxMp: 5,  atk: 1.4, def: 1.2, mag: 2.6, res: 1.6, speed: 0.6 },
    start: ['attack', 'firstAid'],
    tree: [
      S('ph1', 'maxMp', 12, 3, 0, 1, [], true),
      A('ph2', 'tonic',     'Tonic',      5,  1, 0, ['ph1']),
      A('ph3', 'smokeBomb', 'Smoke Bomb', 5,  1, 2, ['ph1']),
      A('ph4', 'remedy',    'Remedy',     12, 2, 0, ['ph2']),
      S('ph5', 'mag', 4, 7, 2, 1, ['ph2', 'ph3']),
      S('ph6', 'speed', 2, 7, 2, 2, ['ph3']),
      S('ph7', 'maxHp', 20, 8, 3, 1, ['ph5']),
    ],
  },
};

export const CLASS_LIST = Object.values(CLASSES);
