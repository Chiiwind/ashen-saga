// ============================================================
//  Ashen Saga — game data
//  Generic grimdark-fantasy archetypes (no trademarked content).
//  All battle balance lives here so it's easy to tune.
// ============================================================

// --- Ability definitions -----------------------------------
// kind: 'phys' scales off atk vs def; 'magic' scales off mag vs res.
// target: 'enemy' | 'ally' | 'allEnemies' | 'self'
// heal: true means power restores HP instead of dealing damage.
export const ABILITIES = {
  attack:      { name: 'Attack',        kind: 'phys',  target: 'enemy',      power: 1.0,  mp: 0,  desc: 'A basic weapon strike.' },

  // Warrior Priest — Ser Aldric
  smite:       { name: 'Smite',         kind: 'magic', target: 'enemy',      power: 1.4,  mp: 6,  desc: 'Holy fire scorches one foe.' },
  healingPrayer:{ name: 'Healing Prayer',kind: 'magic', target: 'ally',      power: 1.6,  mp: 8,  heal: true, desc: 'Restore an ally\'s wounds.' },

  // Bright Wizard — Magda
  fireball:    { name: 'Fireball',      kind: 'magic', target: 'enemy',      power: 1.7,  mp: 7,  desc: 'A searing bolt of flame.' },
  cinderStorm: { name: 'Cinder Storm',  kind: 'magic', target: 'allEnemies', power: 1.2,  mp: 16, desc: 'Fire rains on all foes.' },

  // Dwarf Slayer — Grimm
  recklessSwing:{name: 'Reckless Swing',kind: 'phys',  target: 'enemy',      power: 2.2,  mp: 0,  recoil: 0.12, desc: 'A mighty blow — bruises the wielder.' },
  oathRoar:    { name: 'Oath Roar',     kind: 'self',  target: 'self',       power: 0,    mp: 4,  buffAtk: 1.4, desc: 'Bellow an oath — raise own attack.' },

  // Enemy skills
  gobStab:     { name: 'Rusty Stab',    kind: 'phys',  target: 'enemy',      power: 1.0,  mp: 0,  desc: 'A jagged goblin blade.' },
  hex:         { name: 'Night Hex',     kind: 'magic', target: 'enemy',      power: 1.1,  mp: 0,  desc: 'A sputtering dark curse.' },
  brutalClub:  { name: 'Brutal Club',   kind: 'phys',  target: 'enemy',      power: 1.5,  mp: 0,  desc: 'A crushing overhead swing.' },
  cleave:      { name: 'Cleave',        kind: 'phys',  target: 'allEnemies', power: 1.1,  mp: 0,  desc: 'A wide, dark-forged arc.' },
  gore:        { name: 'Gore',          kind: 'phys',  target: 'enemy',      power: 1.4,  mp: 0,  desc: 'A savage horned charge.' },
  darkBolt:    { name: 'Dark Bolt',     kind: 'magic', target: 'enemy',      power: 1.5,  mp: 0,  desc: 'A lance of ruinous power.' },
};

// --- Party (heroes) ----------------------------------------
// sprite = texture key drawn in sprites.js
// commands = grouped menu shown in battle
export const HEROES = [
  {
    id: 'aldric', name: 'Ser Aldric', title: 'Warrior Priest', sprite: 'priest',
    maxHp: 150, maxMp: 40, atk: 26, def: 20, mag: 24, res: 18, speed: 8,
    commands: [
      { label: 'Attack', ability: 'attack' },
      { label: 'Faith',  group: ['smite', 'healingPrayer'] },
    ],
  },
  {
    id: 'magda', name: 'Magda', title: 'Bright Wizard', sprite: 'wizard',
    maxHp: 96, maxMp: 70, atk: 15, def: 12, mag: 40, res: 24, speed: 11,
    commands: [
      { label: 'Attack', ability: 'attack' },
      { label: 'Magic',  group: ['fireball', 'cinderStorm'] },
    ],
  },
  {
    id: 'grimm', name: 'Grimm', title: 'Dwarf Slayer', sprite: 'slayer',
    maxHp: 132, maxMp: 20, atk: 38, def: 16, mag: 6, res: 10, speed: 10,
    commands: [
      { label: 'Attack', ability: 'attack' },
      { label: 'Slayer', group: ['recklessSwing', 'oathRoar'] },
    ],
  },
];

// --- Enemy templates ---------------------------------------
const ENEMIES = {
  goblin:  { name: 'Goblin Raider', sprite: 'goblin',
    maxHp: 60, maxMp: 0, atk: 20, def: 10, mag: 8, res: 8, speed: 9,  skills: ['gobStab'] },
  shaman:  { name: 'Night Shaman', sprite: 'shaman',
    maxHp: 54, maxMp: 30, atk: 12, def: 8, mag: 22, res: 14, speed: 8, skills: ['hex'] },
  brute:   { name: 'Orc Brute', sprite: 'brute',
    maxHp: 140, maxMp: 0, atk: 30, def: 16, mag: 4, res: 8, speed: 6, skills: ['brutalClub', 'gobStab'] },
  beastman:{ name: 'Beastman Gor', sprite: 'beastman',
    maxHp: 84, maxMp: 0, atk: 26, def: 12, mag: 6, res: 8, speed: 9, skills: ['gore', 'gobStab'] },
  marauder:{ name: 'Chaos Marauder', sprite: 'marauder', boss: true,
    maxHp: 320, maxMp: 20, atk: 34, def: 20, mag: 18, res: 16, speed: 8, skills: ['cleave', 'darkBolt', 'brutalClub'] },
};

function inst(key, i) {
  return { id: key + i, ...JSON.parse(JSON.stringify(ENEMIES[key])) };
}

// --- Encounters (played in order) --------------------------
export const ENCOUNTERS = [
  { name: 'Ambush on the Ash Road',
    intro: 'An ambush! Foes close in!',
    enemies: () => [inst('goblin', 1), inst('goblin', 2), inst('shaman', 1), inst('brute', 1)] },
  { name: 'The Warband',
    intro: 'A warband bars the road — a Chaos Marauder leads them!',
    enemies: () => [inst('marauder', 1), inst('beastman', 1), inst('beastman', 2), inst('goblin', 1)] },
];

// legacy single-encounter helper (still used by any old callers)
export function makeEncounter() { return ENCOUNTERS[0].enemies(); }
