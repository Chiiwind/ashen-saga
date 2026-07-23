// ============================================================
//  Ashen Saga — game data
//  Generic grimdark-fantasy archetypes (no trademarked content).
//  All battle balance lives here so it's easy to tune.
// ============================================================

// --- Ability definitions -----------------------------------
// kind:   'phys' scales off atk vs def; 'magic' scales off mag vs res.
// target: 'enemy' | 'allEnemies' | 'ally' | 'allAllies' | 'self'
// heal:   power restores HP instead of dealing damage.
// recoil: fraction of the user's max HP taken as self-damage.
// crit:   chance (0..1) to deal ~1.8x damage.
// drain:  fraction of damage dealt healed back to the user.
// buff:   { stat, mult } applied to the target(s); mult < 1 is a debuff.
//         (power may be 0 for a pure buff, or > 0 to damage AND debuff.)
export const ABILITIES = {
  attack:      { name: 'Attack',        kind: 'phys',  target: 'enemy',      power: 1.0,  mp: 0,  desc: 'A basic weapon strike.' },

  // Greatsword
  guard:       { name: 'Guard',         kind: 'phys',  target: 'self',       power: 0,    mp: 2,  buff: { stat: 'def', mult: 1.7 }, desc: 'Raise your guard — brace for blows.' },
  sunder:      { name: 'Sunder',        kind: 'phys',  target: 'enemy',      power: 1.1,  mp: 5,  buff: { stat: 'def', mult: 0.7 }, desc: 'A blow that shatters armour.' },
  heroicBlow:  { name: 'Heroic Blow',   kind: 'phys',  target: 'enemy',      power: 2.0,  mp: 8,  desc: 'A mighty two-handed overhead strike.' },
  rally:       { name: 'Rally',         kind: 'phys',  target: 'allAllies',  power: 0,    mp: 12, buff: { stat: 'atk', mult: 1.3 }, desc: 'A rousing cry — the band hits harder.' },

  // Warrior Priest
  smite:       { name: 'Smite',         kind: 'magic', target: 'enemy',      power: 1.4,  mp: 6,  desc: 'Holy fire scorches one foe.' },
  healingPrayer:{ name: 'Healing Prayer',kind: 'magic', target: 'ally',      power: 1.6,  mp: 8,  heal: true, desc: "Restore an ally's wounds." },
  benediction: { name: 'Benediction',   kind: 'magic', target: 'allAllies',  power: 0,    mp: 10, buff: { stat: 'res', mult: 1.4 }, desc: 'Ward the whole band from magic.' },
  greaterHeal: { name: 'Greater Heal',  kind: 'magic', target: 'allAllies',  power: 1.1,  mp: 18, heal: true, desc: 'Healing light bathes the band.' },
  righteousFury:{name: 'Righteous Fury',kind: 'magic', target: 'allEnemies', power: 1.3,  mp: 16, desc: 'Holy fire sears all foes.' },

  // Bright Wizard
  fireball:    { name: 'Fireball',      kind: 'magic', target: 'enemy',      power: 1.7,  mp: 7,  desc: 'A searing bolt of flame.' },
  cinderStorm: { name: 'Cinder Storm',  kind: 'magic', target: 'allEnemies', power: 1.2,  mp: 16, desc: 'Fire rains on all foes.' },
  flameLance:  { name: 'Flame Lance',   kind: 'magic', target: 'enemy',      power: 2.0,  mp: 10, crit: 0.2, desc: 'A lance of white fire.' },
  conflagration:{name: 'Conflagration', kind: 'magic', target: 'allEnemies', power: 1.5,  mp: 22, desc: 'An inferno engulfs the foe.' },

  // Dwarf Slayer
  recklessSwing:{name: 'Reckless Swing',kind: 'phys',  target: 'enemy',      power: 2.2,  mp: 0,  recoil: 0.12, desc: 'A mighty blow — bruises the wielder.' },
  oathRoar:    { name: 'Oath Roar',     kind: 'self',  target: 'self',       power: 0,    mp: 4,  buff: { stat: 'atk', mult: 1.4 }, desc: 'Bellow an oath — raise own attack.' },
  whirlwind:   { name: 'Whirlwind',     kind: 'phys',  target: 'allEnemies', power: 1.2,  mp: 6,  desc: 'A spinning arc of axe-work.' },
  grudgeStrike:{ name: 'Grudge Strike', kind: 'phys',  target: 'enemy',      power: 2.4,  mp: 3,  recoil: 0.1, desc: 'Settle an ancient grudge.' },

  // Waywatcher (elf archer)
  aimedShot:   { name: 'Aimed Shot',    kind: 'phys',  target: 'enemy',      power: 1.6,  mp: 5,  crit: 0.35, desc: 'A patient, deadly-accurate shot.' },
  volley:      { name: 'Volley',        kind: 'phys',  target: 'allEnemies', power: 1.0,  mp: 8,  desc: 'A rain of arrows.' },
  huntersMark: { name: "Hunter's Mark",  kind: 'phys', target: 'enemy',      power: 0,    mp: 4,  buff: { stat: 'def', mult: 0.65 }, desc: 'Mark a foe — its guard weakens.' },
  swiftAim:    { name: 'Swift Aim',     kind: 'self',  target: 'self',       power: 0,    mp: 6,  buff: { stat: 'speed', mult: 1.5 }, desc: 'Quicken your draw.' },

  // Witch Hunter
  pistolShot:  { name: 'Pistol Shot',   kind: 'phys',  target: 'enemy',      power: 1.5,  mp: 4,  crit: 0.3, desc: 'A blessed lead ball.' },
  accusation:  { name: 'Accusation',    kind: 'magic', target: 'enemy',      power: 0,    mp: 5,  buff: { stat: 'atk', mult: 0.7 }, desc: 'Denounce a foe — it falters.' },
  blessedBlade:{ name: 'Blessed Blade', kind: 'phys',  target: 'enemy',      power: 1.8,  mp: 7,  desc: 'A silvered, sanctified strike.' },
  steelResolve:{ name: 'Steel Resolve', kind: 'self',  target: 'self',       power: 0,    mp: 5,  buff: { stat: 'res', mult: 1.5 }, desc: 'Steel yourself against sorcery.' },

  // Grey Wizard
  shadowBolt:  { name: 'Shadow Bolt',   kind: 'magic', target: 'enemy',      power: 1.6,  mp: 6,  desc: 'A bolt of grey wind.' },
  lifeDrain:   { name: 'Life Drain',    kind: 'magic', target: 'enemy',      power: 1.4,  mp: 9,  drain: 0.6, desc: "Siphon a foe's vigour." },
  enfeeble:    { name: 'Enfeeble',      kind: 'magic', target: 'enemy',      power: 0,    mp: 6,  buff: { stat: 'atk', mult: 0.65 }, desc: 'Sap a foe of its strength.' },
  miasma:      { name: 'Miasma',        kind: 'magic', target: 'allEnemies', power: 0,    mp: 12, buff: { stat: 'res', mult: 0.7 }, desc: 'A fog that unravels wards.' },

  // Halfling Physician
  firstAid:    { name: 'First Aid',     kind: 'magic', target: 'ally',       power: 1.4,  mp: 6,  heal: true, desc: 'Bind an ally\'s wounds.' },
  remedy:      { name: 'Remedy',        kind: 'magic', target: 'allAllies',  power: 0.9,  mp: 16, heal: true, desc: 'A tonic for the whole band.' },
  smokeBomb:   { name: 'Smoke Bomb',    kind: 'phys',  target: 'enemy',      power: 0,    mp: 5,  buff: { stat: 'speed', mult: 0.6 }, desc: 'Choke a foe — it slows.' },
  tonic:       { name: 'Tonic',         kind: 'magic', target: 'ally',       power: 0,    mp: 8,  buff: { stat: 'atk', mult: 1.3 }, desc: 'Steel an ally for the fight.' },

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
// exp/ap are awarded to the party per enemy defeated.
const ENEMIES = {
  goblin:  { name: 'Goblin Raider', sprite: 'goblin', atlas: 'goblin',
    maxHp: 62, maxMp: 0, atk: 20, def: 10, mag: 8, res: 8, speed: 9,  skills: ['gobStab'], exp: 9, ap: 2 },
  shaman:  { name: 'Night Shaman', sprite: 'shaman', atlas: 'necromancer',
    maxHp: 56, maxMp: 30, atk: 12, def: 8, mag: 22, res: 14, speed: 8, skills: ['hex'], exp: 12, ap: 3 },
  brute:   { name: 'Orc Brute', sprite: 'brute', atlas: 'ogre',
    maxHp: 150, maxMp: 0, atk: 30, def: 16, mag: 4, res: 8, speed: 6, skills: ['brutalClub', 'gobStab'], exp: 26, ap: 5 },
  beastman:{ name: 'Beastman Gor', sprite: 'beastman', atlas: 'chort',
    maxHp: 92, maxMp: 0, atk: 27, def: 12, mag: 6, res: 8, speed: 9, skills: ['gore', 'gobStab'], exp: 18, ap: 4 },
  marauder:{ name: 'Chaos Marauder', sprite: 'marauder', atlas: 'big_demon', boss: true,
    maxHp: 420, maxMp: 30, atk: 36, def: 22, mag: 20, res: 18, speed: 8, skills: ['cleave', 'darkBolt', 'brutalClub'], exp: 90, ap: 22 },
};

function inst(key, i) {
  return { id: key + i, ...JSON.parse(JSON.stringify(ENEMIES[key])) };
}

// --- Encounters (played in order) --------------------------
// Sized for a five-strong party.
export const ENCOUNTERS = [
  { name: 'Ambush on the Ash Road',
    intro: 'An ambush! Foes close in!',
    enemies: () => [inst('goblin', 1), inst('goblin', 2), inst('goblin', 3), inst('shaman', 1), inst('brute', 1)] },
  { name: 'The Warband',
    intro: 'A warband bars the road — a Chaos Marauder leads them!',
    enemies: () => [inst('marauder', 1), inst('beastman', 1), inst('beastman', 2), inst('shaman', 1), inst('goblin', 1)] },
];

// legacy single-encounter helper (still used by any old callers)
export function makeEncounter() { return ENCOUNTERS[0].enemies(); }
