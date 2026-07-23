// ============================================================
//  Ashen Saga — Sphere Grid (FF10-style)
//  ONE shared, data-driven grid. Each character has a token that
//  crawls it: spend Sphere Levels (S.Lv) to move a node, spend a
//  matching sphere item to activate a node (permanent for that
//  character). Some nodes are locked behind Lv1-4 key spheres.
//
//  The engine doesn't care how big the grid is — this file just
//  generates the current content (8 class "arms" around a hub +
//  a shared ring + a locked outer band). Grow the game by adding
//  more nodes/edges here; the scene pans/zooms to fit.
// ============================================================

// which sphere item activates a stat node
export const SPHERE_FOR_STAT = {
  maxHp: 'power', atk: 'power', def: 'power',
  maxMp: 'mana', mag: 'mana', res: 'mana',
  speed: 'speed',
};
export const SPHERE_LABEL = { power: 'Power', mana: 'Mana', speed: 'Speed', ability: 'Ability' };
export const SPHERE_COLOR = { power: 0xff5a5a, mana: 0x5a8aff, speed: 0x5aff8a, ability: 0xffd24a };
export const KEY_LABEL = { key1: 'Lv1 Key', key2: 'Lv2 Key', key3: 'Lv3 Key', key4: 'Lv4 Key' };

// node builders
const stat = (s, amount) => ({ type: 'stat', stat: s, amount, sphere: SPHERE_FOR_STAT[s] });
const abil = (id) => ({ type: 'ability', ability: id, sphere: 'ability' });
const empty = () => ({ type: 'empty' });

// each class's arm: 5 nodes from the class's identity (stats + its abilities)
const ARMS = {
  greatsword:  [stat('maxHp', 24), abil('guard'),      stat('def', 4),   abil('heroicBlow'),   abil('rally')],
  priest:      [stat('maxMp', 12), abil('smite'),      stat('mag', 4),   abil('greaterHeal'),  abil('righteousFury')],
  brightWizard:[stat('maxMp', 12), abil('flameLance'), stat('mag', 5),   abil('cinderStorm'),  abil('conflagration')],
  slayer:      [stat('maxHp', 26), abil('oathRoar'),   stat('atk', 5),   abil('whirlwind'),    abil('grudgeStrike')],
  waywatcher:  [stat('speed', 2),  abil('huntersMark'),stat('atk', 4),   abil('volley'),       abil('swiftAim')],
  witchHunter: [stat('atk', 3),    abil('accusation'), stat('res', 3),   abil('blessedBlade'), abil('steelResolve')],
  greyWizard:  [stat('maxMp', 12), abil('enfeeble'),   stat('mag', 5),   abil('lifeDrain'),    abil('miasma')],
  physician:   [stat('maxMp', 12), abil('tonic'),      stat('mag', 4),   abil('remedy'),       abil('smokeBomb')],
};
// arm order fixes each class's angle around the hub
const ARM_ORDER = ['greatsword', 'priest', 'brightWizard', 'greyWizard', 'physician', 'waywatcher', 'witchHunter', 'slayer'];

// generic shared stat nodes cycled around the ring between arms
const RING_STATS = [stat('maxHp', 15), stat('atk', 3), stat('maxMp', 10), stat('def', 3), stat('mag', 3), stat('speed', 1), stat('res', 3), stat('maxHp', 15)];
// outer band (behind locks) — juicier shared nodes + a couple of cross-class abilities
const OUTER = [stat('maxHp', 40), abil('flameLance'), stat('atk', 6), abil('greaterHeal'), stat('mag', 6), abil('rally'), stat('def', 6), abil('swiftAim')];

function build() {
  const nodes = [];
  const edges = [];
  const classStart = {};
  let _id = 0;
  const add = (x, y, spec) => { const n = { id: 'n' + (_id++), x, y, ...spec }; nodes.push(n); return n; };
  const link = (a, b) => { if (a && b) edges.push([a.id, b.id]); };

  const TAU = Math.PI * 2;
  const R0 = 2.4, DR = 1.7;   // inner radius + per-ring spacing

  // hub
  const hub = add(0, 0, empty());

  // 8 class arms
  const arms = ARM_ORDER.map((cid, k) => {
    const ang = (k / 8) * TAU - TAU / 4;   // start straight up
    const nn = ARMS[cid].map((spec, j) => {
      const r = R0 + j * DR;
      return add(+(Math.cos(ang) * r).toFixed(2), +(Math.sin(ang) * r).toFixed(2), spec);
    });
    link(hub, nn[0]);
    for (let j = 1; j < nn.length; j++) link(nn[j - 1], nn[j]);
    classStart[cid] = nn[0].id;
    return { cid, ang, nn };
  });

  // shared ring nodes between adjacent arms (webs the arms together)
  const RING_RADII = [1, 2, 3];   // arm-node indices to bridge
  arms.forEach((arm, k) => {
    const next = arms[(k + 1) % 8];
    const midAng = arm.ang + TAU / 16;
    RING_RADII.forEach((j) => {
      const r = R0 + j * DR;
      const sn = add(+(Math.cos(midAng) * r).toFixed(2), +(Math.sin(midAng) * r).toFixed(2), RING_STATS[(k + j) % RING_STATS.length]);
      link(sn, arm.nn[j]);
      link(sn, next.nn[j]);
    });
  });

  // outer band: a lock in front of each arm tip, then an outer shared node
  const rLock = R0 + 5 * DR, rOuter = R0 + 6.1 * DR;
  arms.forEach((arm, k) => {
    const ang = arm.ang;
    const lock = add(+(Math.cos(ang) * rLock).toFixed(2), +(Math.sin(ang) * rLock).toFixed(2), { type: 'empty', lock: (k % 2 === 0) ? 1 : 2 });
    const outer = add(+(Math.cos(ang) * rOuter).toFixed(2), +(Math.sin(ang) * rOuter).toFixed(2), OUTER[k]);
    link(arm.nn[arm.nn.length - 1], lock);
    link(lock, outer);
  });
  // connect outer band into a ring so it's traversable once unlocked
  const outerNodes = nodes.filter(n => Math.hypot(n.x, n.y) > rOuter - 0.2);
  for (let i = 0; i < outerNodes.length; i++) {
    // (outer nodes are added interleaved with locks; link consecutive outer-radius nodes)
  }

  const byId = {};
  for (const n of nodes) byId[n.id] = n;
  return { nodes, edges, byId, classStart, adjacency: buildAdj(nodes, edges) };
}

function buildAdj(nodes, edges) {
  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  return adj;
}

// the one shared grid (built once)
export const GRID = build();

export function nodeLabel(n) {
  if (n.type === 'ability') return n.ability;
  if (n.type === 'stat') {
    const lab = { maxHp: 'HP', maxMp: 'MP', atk: 'ATK', def: 'DEF', mag: 'MAG', res: 'RES', speed: 'SPD' }[n.stat];
    return '+' + n.amount + ' ' + lab;
  }
  if (n.lock) return 'Lv' + n.lock + ' Lock';
  return '';
}
