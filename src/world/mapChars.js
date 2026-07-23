// ============================================================
//  Ashen Saga — overworld/town character mapping
//  Which sprite (from the superdark NPC atlas, key 'npc') the
//  walking player + townsfolk use. Battle uses the 0x72 atlas;
//  the map uses these townsfolk-style sprites.
// ============================================================

// party leader's class -> overworld avatar sprite
export const CLASS_MAP_CHAR = {
  greatsword: 'knight_heavy',
  priest: 'knight',
  brightWizard: 'mage',
  greyWizard: 'mage',
  waywatcher: 'archer',
  physician: 'alchemist',
  slayer: 'knight_elite',
  witchHunter: 'executioner',
};

// townsfolk sprites referenced by the town scene
export const NPC_CHARS = ['knight', 'merchant', 'butcher', 'townsfolk_m', 'townsfolk_f'];

// every 'npc'-atlas character that needs idle/run animations registered
export const ALL_MAP_CHARS = [...new Set([
  ...Object.values(CLASS_MAP_CHAR),
  ...NPC_CHARS,
])];
