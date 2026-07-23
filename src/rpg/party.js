// ============================================================
//  Ashen Saga — party + progression
//  Character instances, derived stats, EXP/levels, AP, and the
//  skill-tree operations. The party lives in world.party.
// ============================================================
import { CLASSES } from './classes.js';
import { ABILITIES } from '../data.js';
import { world } from '../world/state.js';

const STAT_KEYS = ['maxHp', 'maxMp', 'atk', 'def', 'mag', 'res', 'speed'];
const MAX_LEVEL = 50;

let _uid = 0;
export function makeCharacter(name, classId) {
  const cls = CLASSES[classId];
  const c = {
    uid: 'c' + (++_uid),
    name: name || cls.name,
    classId,
    level: 1,
    exp: 0,
    ap: 0,
    learned: [],       // node ids
    hp: 0, mp: 0,      // current (persistent); filled below
  };
  const s = derivedStats(c);
  c.hp = s.maxHp; c.mp = s.maxMp;
  return c;
}

// base + per-level growth + learned stat nodes
export function derivedStats(c) {
  const cls = CLASSES[c.classId];
  const out = {};
  for (const k of STAT_KEYS) {
    out[k] = cls.base[k] + (cls.growth[k] || 0) * (c.level - 1);
  }
  for (const id of c.learned) {
    const n = nodeById(c.classId, id);
    if (n && n.type === 'stat') out[n.stat] += n.amount;
  }
  for (const k of STAT_KEYS) out[k] = Math.floor(out[k]);
  return out;
}

export function knownAbilities(c) {
  const cls = CLASSES[c.classId];
  const ids = [...cls.start];
  for (const id of c.learned) {
    const n = nodeById(c.classId, id);
    if (n && n.type === 'ability' && !ids.includes(n.ability)) ids.push(n.ability);
  }
  return ids;
}

// battle command menu: Attack + a Skills group of everything else known
export function battleCommands(c) {
  const known = knownAbilities(c);
  const skills = known.filter(id => id !== 'attack');
  const cmds = [{ label: 'Attack', ability: 'attack' }];
  if (skills.length) cmds.push({ label: 'Skills', group: skills });
  return cmds;
}

// ---- skill tree ------------------------------------------
export function nodeById(classId, nodeId) {
  return CLASSES[classId].tree.find(n => n.id === nodeId);
}

export function isLearned(c, nodeId) { return c.learned.includes(nodeId); }

// learnable = not yet learned AND (root OR any prerequisite learned)
export function isLearnable(c, nodeId) {
  if (isLearned(c, nodeId)) return false;
  const n = nodeById(c.classId, nodeId);
  if (!n) return false;
  if (n.root) return true;
  return n.req.some(r => isLearned(c, r));
}

export function canAfford(c, nodeId) {
  const n = nodeById(c.classId, nodeId);
  return !!n && c.ap >= n.ap;
}

export function learnNode(c, nodeId) {
  if (!isLearnable(c, nodeId) || !canAfford(c, nodeId)) return false;
  const n = nodeById(c.classId, nodeId);
  c.ap -= n.ap;
  c.learned.push(nodeId);
  // learning a stat node raises max HP/MP → top up current by the gain
  if (n.type === 'stat' && n.stat === 'maxHp') c.hp += n.amount;
  if (n.type === 'stat' && n.stat === 'maxMp') c.mp += n.amount;
  return true;
}

// ---- progression -----------------------------------------
export function expForNext(level) { return Math.round(28 * Math.pow(level, 1.5)); }

// award exp + ap to the whole party; return level-up events for display
export function grantRewards(party, exp, ap) {
  const events = [];
  for (const c of party) {
    c.ap += ap;
    if (c.level >= MAX_LEVEL) continue;
    c.exp += exp;
    let gained = 0;
    while (c.level < MAX_LEVEL && c.exp >= expForNext(c.level)) {
      c.exp -= expForNext(c.level);
      c.level++;
      gained++;
    }
    if (gained) {
      const s = derivedStats(c);
      c.hp = s.maxHp; c.mp = s.maxMp;      // full restore on level-up
      events.push({ name: c.name, level: c.level, gained });
    }
  }
  return events;
}

// ---- battle bridge ---------------------------------------
// Build the combatant object BattleScene needs from a character.
export function toBattleHero(c) {
  const s = derivedStats(c);
  return {
    id: c.uid, name: c.name, title: CLASSES[c.classId].name,
    sprite: CLASSES[c.classId].sprite, atlas: CLASSES[c.classId].atlas,
    maxHp: s.maxHp, maxMp: s.maxMp,
    atk: s.atk, def: s.def, mag: s.mag, res: s.res, speed: s.speed,
    hp: Math.min(c.hp, s.maxHp), mp: Math.min(c.mp, s.maxMp),
    commands: battleCommands(c),
    charRef: c,                     // write hp/mp back after battle
  };
}

// ---- party helpers ---------------------------------------
export function makeDefaultParty() {
  return [
    makeCharacter('Bram', 'greatsword'),
    makeCharacter('Aldric', 'priest'),
    makeCharacter('Magda', 'brightWizard'),
    makeCharacter('Faelan', 'waywatcher'),
    makeCharacter('Poppy', 'physician'),
  ];
}

// seed a default party if none exists yet (until the creator screen runs)
export function ensureParty() {
  if (!world.party || !world.party.length) world.party = makeDefaultParty();
  return world.party;
}
