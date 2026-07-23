// ============================================================
//  Ashen Saga — item catalog + equip rules
//  Weapons / Armour / Accessories across 5 gear tiers
//  (Iron→Steel→Mithril→Chaos→Relic, one per act — see docs/DESIGN.md).
//  mods add to derived stats; effect{crit,lifesteal} hook into combat.
// ============================================================

// which weapon categories + armour weights each class can equip, and how
// many accessory slots it has (mages/support carry more trinkets).
export const CLASS_EQUIP = {
  greatsword:  { weapons: ['blade', 'axe', 'mace'],   weights: ['heavy', 'medium'], accSlots: 1 },
  priest:      { weapons: ['mace', 'blade'],          weights: ['heavy', 'medium'], accSlots: 2 },
  brightWizard:{ weapons: ['staff'],                  weights: ['light'],           accSlots: 3 },
  slayer:      { weapons: ['axe', 'blade'],           weights: ['medium', 'light'], accSlots: 1 },
  waywatcher:  { weapons: ['bow', 'dagger'],          weights: ['light', 'medium'], accSlots: 2 },
  witchHunter: { weapons: ['pistol', 'blade'],        weights: ['medium', 'light'], accSlots: 2 },
  greyWizard:  { weapons: ['staff', 'dagger'],        weights: ['light'],           accSlots: 3 },
  physician:   { weapons: ['dagger', 'staff'],        weights: ['light'],           accSlots: 3 },
};

export const TIER_NAME = { 1: 'Iron', 2: 'Steel', 3: 'Mithril', 4: 'Chaos', 5: 'Relic' };
export const WEIGHT_LABEL = { light: 'Light', medium: 'Medium', heavy: 'Heavy' };
export const WPN_LABEL = { blade: 'Blade', axe: 'Axe', mace: 'Mace', staff: 'Staff', bow: 'Bow', pistol: 'Pistol', dagger: 'Dagger' };

// builders
const W = (id, name, tier, wpn, price, mods, effect) => ({ id, name, type: 'weapon', tier, wpn, price, mods, effect });
const A = (id, name, tier, weight, price, mods, effect) => ({ id, name, type: 'armour', tier, weight, price, mods, effect });
const C = (id, name, tier, price, mods, effect) => ({ id, name, type: 'accessory', tier, price, mods, effect });

const LIST = [
  // ---- BLADES (greatsword / priest / slayer / witch hunter) ----
  W('iron_sword', 'Iron Sword', 1, 'blade', 40, { atk: 8 }),
  W('iron_greatsword', 'Iron Greatsword', 1, 'blade', 70, { atk: 12, speed: -1 }),
  W('steel_longsword', 'Steel Longsword', 2, 'blade', 170, { atk: 17 }),
  W('mithril_blade', 'Mithril Blade', 3, 'blade', 520, { atk: 27 }, { crit: 0.1, desc: 'Keen edge — higher crit.' }),
  W('chaos_cleaver', 'Chaos Cleaver', 4, 'blade', 1300, { atk: 41 }, { lifesteal: 0.15, desc: 'Drinks the blood of the slain.' }),
  W('godsbane', 'Godsbane', 5, 'blade', 3200, { atk: 58 }, { crit: 0.2, desc: 'A relic blade forged to slay gods.' }),

  // ---- AXES (greatsword / slayer) ----
  W('iron_axe', 'Iron Axe', 1, 'axe', 44, { atk: 9 }),
  W('steel_waraxe', 'Steel War-Axe', 2, 'axe', 175, { atk: 18 }),
  W('slayer_axe', 'Slayer Axe', 3, 'axe', 540, { atk: 29 }, { crit: 0.12, desc: 'A doom-seeker\'s blade.' }),
  W('chaos_greataxe', 'Chaos Greataxe', 4, 'axe', 1350, { atk: 43, speed: -1 }, { desc: 'Immense and cruel.' }),
  W('worldsplitter', 'Worldsplitter', 5, 'axe', 3300, { atk: 60, speed: -1 }, { crit: 0.15, desc: 'It has felled titans.' }),

  // ---- MACES (greatsword / priest) ----
  W('iron_mace', 'Iron Mace', 1, 'mace', 38, { atk: 7 }),
  W('steel_maul', 'Steel Maul', 2, 'mace', 165, { atk: 16 }),
  W('blessed_hammer', 'Blessed Hammer', 3, 'mace', 520, { atk: 25, mag: 8 }, { desc: 'Smites the unclean.' }),
  W('star_of_dawn', 'Star of Dawn', 4, 'mace', 1300, { atk: 39, mag: 12 }, { desc: 'Holy light wreathes its head.' }),
  W('sigmarite_maul', 'Sigmarite Maul', 5, 'mace', 3200, { atk: 56, mag: 18 }, { desc: 'A relic of the faithful.' }),

  // ---- STAVES (bright wizard / grey wizard / physician) ----
  W('ash_staff', 'Ash Staff', 1, 'staff', 40, { mag: 8 }),
  W('ember_staff', 'Ember Staff', 2, 'staff', 165, { mag: 16 }),
  W('runed_staff', 'Runed Staff', 3, 'staff', 520, { mag: 27, maxMp: 10 }),
  W('chaos_scepter', 'Chaos Scepter', 4, 'staff', 1300, { mag: 41, maxMp: 15 }, { lifesteal: 0.1, desc: 'Siphons the caster\'s foes.' }),
  W('staff_of_ages', 'Staff of Ages', 5, 'staff', 3200, { mag: 58, maxMp: 30 }, { desc: 'Older than the Wilds.' }),

  // ---- BOWS (waywatcher) ----
  W('hunting_bow', 'Hunting Bow', 1, 'bow', 40, { atk: 7, speed: 1 }),
  W('yew_longbow', 'Yew Longbow', 2, 'bow', 165, { atk: 15, speed: 1 }, { crit: 0.15, desc: 'Patient and precise.' }),
  W('elven_greatbow', 'Elven Greatbow', 3, 'bow', 520, { atk: 25, speed: 2 }, { crit: 0.2, desc: 'Sings as it looses.' }),
  W('chaos_recurve', 'Chaos Recurve', 4, 'bow', 1300, { atk: 39, speed: 2 }, { crit: 0.22, desc: 'Its arrows never miss the heart.' }),
  W('windsong', 'Windsong', 5, 'bow', 3200, { atk: 55, speed: 3 }, { crit: 0.28, desc: 'A relic of the wood elves.' }),

  // ---- PISTOLS (witch hunter) ----
  W('flintlock', 'Flintlock Pistol', 1, 'pistol', 45, { atk: 8 }, { crit: 0.2, desc: 'A blessed lead ball.' }),
  W('silver_pistol', 'Silver Pistol', 2, 'pistol', 175, { atk: 16 }, { crit: 0.25, desc: 'Bane of the damned.' }),
  W('repeater_pistol', 'Repeater Pistol', 3, 'pistol', 540, { atk: 26, speed: 1 }, { crit: 0.28, desc: 'Rapid and deadly.' }),
  W('hexbane_pistol', 'Hexbane Pistol', 4, 'pistol', 1350, { atk: 40 }, { crit: 0.32, desc: 'Fires witch-killing shot.' }),
  W('judgement', 'Judgement', 5, 'pistol', 3300, { atk: 56 }, { crit: 0.38, lifesteal: 0.1, desc: 'The last word.' }),

  // ---- DAGGERS (waywatcher / grey wizard / physician) ----
  W('iron_dagger', 'Iron Dagger', 1, 'dagger', 30, { atk: 5, speed: 2 }),
  W('rondel', 'Rondel Dagger', 2, 'dagger', 130, { atk: 11, speed: 2 }, { crit: 0.2, desc: 'Finds the gaps in armour.' }),
  W('mithril_kris', 'Mithril Kris', 3, 'dagger', 460, { atk: 18, speed: 3, mag: 6 }, { crit: 0.22, desc: 'A blade for surgeons and sorcerers.' }),
  W('venom_fang', 'Venom Fang', 4, 'dagger', 1150, { atk: 28, speed: 3 }, { lifesteal: 0.12, crit: 0.25, desc: 'Weeps a green ichor.' }),
  W('heartseeker', 'Heartseeker', 5, 'dagger', 2900, { atk: 40, speed: 4 }, { crit: 0.4, desc: 'It knows where you live.' }),

  // ---- HEAVY ARMOUR (greatsword / priest) ----
  A('iron_plate', 'Iron Plate', 1, 'heavy', 60, { def: 8, maxHp: 10, speed: -1 }),
  A('steel_plate', 'Steel Plate', 2, 'heavy', 220, { def: 16, maxHp: 25, speed: -2 }),
  A('mithril_plate', 'Mithril Plate', 3, 'heavy', 640, { def: 26, maxHp: 45, speed: -1 }),
  A('chaos_plate', 'Chaos Plate', 4, 'heavy', 1550, { def: 40, maxHp: 70, res: 8, speed: -2 }),
  A('relic_aegis', 'Relic Aegis', 5, 'heavy', 3600, { def: 56, maxHp: 110, res: 14, speed: -1 }),

  // ---- MEDIUM ARMOUR (most martial classes) ----
  A('leather_brigandine', 'Leather Brigandine', 1, 'medium', 50, { def: 6, res: 4 }),
  A('chainmail', 'Chainmail', 2, 'medium', 190, { def: 12, res: 8, maxHp: 10 }),
  A('mithril_mail', 'Mithril Mail', 3, 'medium', 560, { def: 20, res: 14, maxHp: 20 }),
  A('chaos_harness', 'Chaos Harness', 4, 'medium', 1400, { def: 31, res: 22, maxHp: 35 }),
  A('dragonscale', 'Dragonscale', 5, 'medium', 3400, { def: 44, res: 32, maxHp: 60, speed: 1 }),

  // ---- LIGHT ARMOUR (casters / rogues) ----
  A('padded_robe', 'Padded Robe', 1, 'light', 45, { def: 3, res: 6, maxMp: 8, speed: 1 }),
  A('mage_robe', 'Mage Robe', 2, 'light', 175, { def: 6, res: 12, maxMp: 16, speed: 1 }),
  A('warded_robe', 'Warded Robe', 3, 'light', 530, { def: 10, res: 20, maxMp: 28, speed: 1 }),
  A('shadowsilk', 'Shadowsilk', 4, 'light', 1350, { def: 15, res: 30, maxMp: 40, speed: 2 }),
  A('robe_of_ages', 'Robe of Ages', 5, 'light', 3300, { def: 22, res: 42, maxMp: 60, speed: 2 }),

  // ---- ACCESSORIES ----
  C('ring_vigor', 'Ring of Vigour', 1, 100, { maxHp: 20 }),
  C('ring_focus', 'Ring of Focus', 1, 100, { maxMp: 15 }),
  C('swift_boots', 'Swift Boots', 1, 120, { speed: 2 }),
  C('power_band', 'Band of Power', 2, 260, { atk: 5 }),
  C('arcane_band', 'Band of the Arcane', 2, 260, { mag: 5 }),
  C('guardian_charm', 'Guardian Charm', 2, 300, { def: 4, res: 4 }),
  C('eagle_eye', 'Eagle-Eye Charm', 2, 400, {}, { crit: 0.1, desc: '+10% crit.' }),
  C('greater_vigor', 'Greater Ring of Vigour', 3, 620, { maxHp: 45 }),
  C('amulet_flame', 'Amulet of Flame', 3, 620, { mag: 7 }, { desc: 'Fire runs hotter (+MAG).' }),
  C('talisman_wards', 'Talisman of Wards', 3, 560, { res: 10 }),
  C('vampiric_ring', 'Vampiric Ring', 3, 750, {}, { lifesteal: 0.1, desc: 'Heal for 10% of damage dealt.' }),
  C('boots_alacrity', 'Boots of Alacrity', 3, 640, { speed: 3 }),
  C('sigil_might', 'Sigil of Might', 4, 1200, { atk: 9 }),
  C('sigil_sorcery', 'Sigil of Sorcery', 4, 1200, { mag: 9 }),
  C('aegis_amulet', 'Aegis Amulet', 4, 1300, { def: 8, res: 8, maxHp: 30 }),
  C('bloodthirster', 'Bloodthirster Torc', 4, 1500, { atk: 6 }, { lifesteal: 0.18, desc: 'Drink deep.' }),
  C('crown_kings', 'Crown of Kings', 5, 3000, { atk: 8, mag: 8, maxHp: 40 }),
  C('assassins_eye', "Assassin's Eye", 5, 2800, { speed: 3 }, { crit: 0.2, desc: '+20% crit.' }),
];

export const ITEMS = {};
for (const it of LIST) ITEMS[it.id] = it;

export function itemById(id) { return ITEMS[id]; }

// starting kit each class gets on creation (id list)
export const CLASS_STARTER_GEAR = {
  greatsword: ['iron_greatsword', 'iron_plate'],
  priest: ['iron_mace', 'leather_brigandine'],
  brightWizard: ['ash_staff', 'padded_robe'],
  slayer: ['iron_axe', 'leather_brigandine'],
  waywatcher: ['hunting_bow', 'padded_robe'],
  witchHunter: ['flintlock', 'leather_brigandine'],
  greyWizard: ['ash_staff', 'padded_robe'],
  physician: ['iron_dagger', 'padded_robe'],
};

// what a class may equip in a given slot
export function canClassUse(classId, item) {
  const eq = CLASS_EQUIP[classId];
  if (!eq) return false;
  if (item.type === 'weapon') return eq.weapons.includes(item.wpn);
  if (item.type === 'armour') return eq.weights.includes(item.weight);
  if (item.type === 'accessory') return true;
  return false;
}
