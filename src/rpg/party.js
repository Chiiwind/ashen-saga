// ============================================================
//  Ashen Saga — party + progression (Sphere Grid)
//  Characters crawl a shared grid (rpg/spheregrid.js). Levels
//  come from EXP; grid MOVEMENT costs Sphere Levels (S.Lv);
//  grid ACTIVATION costs a matching sphere item (shared pool).
// ============================================================
import { CLASSES } from './classes.js';
import { GRID } from './spheregrid.js';
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
    sLv: 0,                            // sphere levels = movement budget
    activated: [],                     // grid node ids this character has activated
    gridPos: GRID.classStart[classId], // token position
    hp: 0, mp: 0,
  };
  const s = derivedStats(c);
  c.hp = s.maxHp; c.mp = s.maxMp;
  return c;
}

// base + per-level growth + activated stat nodes
export function derivedStats(c) {
  const cls = CLASSES[c.classId];
  const out = {};
  for (const k of STAT_KEYS) out[k] = cls.base[k] + (cls.growth[k] || 0) * (c.level - 1);
  for (const id of c.activated) {
    const n = GRID.byId[id];
    if (n && n.type === 'stat') out[n.stat] += n.amount;
  }
  for (const k of STAT_KEYS) out[k] = Math.floor(out[k]);
  return out;
}

export function knownAbilities(c) {
  const ids = [...CLASSES[c.classId].start];
  for (const id of c.activated) {
    const n = GRID.byId[id];
    if (n && n.type === 'ability' && !ids.includes(n.ability)) ids.push(n.ability);
  }
  return ids;
}

export function battleCommands(c) {
  const skills = knownAbilities(c).filter(id => id !== 'attack');
  const cmds = [{ label: 'Attack', ability: 'attack' }];
  if (skills.length) cmds.push({ label: 'Skills', group: skills });
  return cmds;
}

// ---- sphere grid operations ------------------------------
export function isUnlocked(nodeId) {
  const n = GRID.byId[nodeId];
  return !n.lock || world.unlockedNodes.has(nodeId);
}
export function neighbors(nodeId) { return GRID.adjacency[nodeId] || []; }
export function currentNode(c) { return GRID.byId[c.gridPos]; }
export function isActivated(c, nodeId) { return c.activated.includes(nodeId); }

// move the token one step to an adjacent node (costs 1 S.Lv)
export function canMove(c, nodeId) {
  return c.sLv > 0 && neighbors(c.gridPos).includes(nodeId) && isUnlocked(nodeId);
}
export function moveToken(c, nodeId) {
  if (!canMove(c, nodeId)) return false;
  c.gridPos = nodeId; c.sLv -= 1;
  return true;
}

// activate the node the token is standing on (costs a matching sphere)
export function activationSphere(c) {
  const n = currentNode(c);
  return n && (n.type === 'stat' || n.type === 'ability') ? n.sphere : null;
}
export function canActivate(c) {
  const n = currentNode(c);
  if (!n || isActivated(c, n.id) || !isUnlocked(n.id)) return false;
  if (n.type !== 'stat' && n.type !== 'ability') return false;
  return world.spheres[n.sphere] > 0;
}
export function activateNode(c) {
  if (!canActivate(c)) return false;
  const n = currentNode(c);
  world.spheres[n.sphere] -= 1;
  c.activated.push(n.id);
  if (n.type === 'stat' && n.stat === 'maxHp') c.hp += n.amount;
  if (n.type === 'stat' && n.stat === 'maxMp') c.mp += n.amount;
  return true;
}

// unlock an adjacent locked node with a key sphere (shared/permanent)
export function keyFor(nodeId) { const n = GRID.byId[nodeId]; return n.lock ? 'key' + n.lock : null; }
export function canUnlock(c, nodeId) {
  const n = GRID.byId[nodeId];
  if (!n.lock || world.unlockedNodes.has(nodeId)) return false;
  if (!neighbors(c.gridPos).includes(nodeId)) return false;
  return world.spheres['key' + n.lock] > 0;
}
export function unlockNode(c, nodeId) {
  if (!canUnlock(c, nodeId)) return false;
  const n = GRID.byId[nodeId];
  world.spheres['key' + n.lock] -= 1;
  world.unlockedNodes.add(nodeId);
  return true;
}

// ---- progression -----------------------------------------
export function expForNext(level) { return Math.round(28 * Math.pow(level, 1.5)); }

// award EXP (-> levels), Sphere Levels (movement), and spheres (activation)
export function grantRewards(party, exp, ap) {
  const events = [];
  for (const c of party) {
    c.sLv += Math.max(2, Math.round(ap / 5));
    if (c.level >= MAX_LEVEL) continue;
    c.exp += exp;
    let gained = 0;
    while (c.level < MAX_LEVEL && c.exp >= expForNext(c.level)) {
      c.exp -= expForNext(c.level); c.level++; gained++;
    }
    if (gained) {
      const s = derivedStats(c);
      c.hp = s.maxHp; c.mp = s.maxMp;
      events.push({ name: c.name, level: c.level, gained });
    }
  }
  // shared sphere drops
  const n = Math.max(2, Math.round(ap / 8));
  world.spheres.power += 2 + n;
  world.spheres.mana += 2 + n;
  world.spheres.speed += 1 + Math.round(n / 2);
  world.spheres.ability += 1 + Math.round(n / 2);
  return events;
}

// ---- battle bridge ---------------------------------------
export function toBattleHero(c) {
  const s = derivedStats(c);
  return {
    id: c.uid, name: c.name, title: CLASSES[c.classId].name,
    sprite: CLASSES[c.classId].sprite, atlas: CLASSES[c.classId].atlas,
    maxHp: s.maxHp, maxMp: s.maxMp,
    atk: s.atk, def: s.def, mag: s.mag, res: s.res, speed: s.speed,
    hp: Math.min(c.hp, s.maxHp), mp: Math.min(c.mp, s.maxMp),
    commands: battleCommands(c),
    charRef: c,
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

// a starting sphere/movement stipend so the grid is usable from the outset
export function grantStartingStipend() {
  world.spheres.power += 5; world.spheres.mana += 5; world.spheres.speed += 3;
  world.spheres.ability += 4; world.spheres.key1 += 1;
  for (const c of world.party) c.sLv += 6;
}

export function ensureParty() {
  if (!world.party || !world.party.length) {
    world.party = makeDefaultParty();
    grantStartingStipend();
  }
  return world.party;
}
