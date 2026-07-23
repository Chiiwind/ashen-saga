// ============================================================
//  Ashen Saga — shared world state
//  Persists across scene changes (module state survives scene
//  restarts; it only resets on a full page reload).
// ============================================================
const freshSpheres = () => ({ power: 0, mana: 0, speed: 0, ability: 0, fortune: 0, key1: 0, key2: 0, key3: 0, key4: 0 });

export const world = {
  party: [],                 // the 5 chosen characters (see rpg/party.js)
  gold: 0,
  // shared sphere-grid economy (FF10-style)
  spheres: freshSpheres(),
  unlockedNodes: new Set(),  // grid lock nodes opened (shared by whole party)
  playerTile: null,          // { x, y } where the hero stands on the overworld
  defeatedFoes: new Set(),   // ids of roaming foes already beaten
  visitedTown: false,
};

export function resetWorld() {
  world.party = [];
  world.gold = 0;
  world.spheres = freshSpheres();
  world.unlockedNodes = new Set();
  world.playerTile = null;
  world.defeatedFoes = new Set();
  world.visitedTown = false;
}

// ---- save / load (localStorage) --------------------------
const SAVE_KEY = 'ashenSaga.save.v1';

export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}
export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
}
export function saveGame() {
  try {
    const data = {
      party: world.party,
      gold: world.gold,
      spheres: world.spheres,
      unlockedNodes: [...world.unlockedNodes],
      playerTile: world.playerTile,
      defeatedFoes: [...world.defeatedFoes],
      visitedTown: world.visitedTown,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) { return false; }
}
export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    world.party = d.party || [];
    world.gold = d.gold || 0;
    world.spheres = Object.assign(freshSpheres(), d.spheres || {});
    world.unlockedNodes = new Set(d.unlockedNodes || []);
    world.playerTile = d.playerTile || null;
    world.defeatedFoes = new Set(d.defeatedFoes || []);
    world.visitedTown = !!d.visitedTown;
    return world.party.length > 0;
  } catch (e) { return false; }
}
