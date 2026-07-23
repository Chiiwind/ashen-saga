// ============================================================
//  Ashen Saga — shared world state
//  Persists across scene changes (module state survives scene
//  restarts; it only resets on a full page reload).
// ============================================================
export const world = {
  party: [],                 // the 5 chosen characters (see rpg/party.js)
  // shared sphere-grid economy (FF10-style)
  spheres: { power: 0, mana: 0, speed: 0, ability: 0, key1: 0, key2: 0, key3: 0, key4: 0 },
  unlockedNodes: new Set(),  // grid lock nodes opened (shared by whole party)
  playerTile: null,          // { x, y } where the hero stands on the overworld
  defeatedFoes: new Set(),   // ids of roaming foes already beaten
  visitedTown: false,
};

export function resetWorld() {
  world.party = [];
  world.spheres = { power: 0, mana: 0, speed: 0, ability: 0, key1: 0, key2: 0, key3: 0, key4: 0 };
  world.unlockedNodes = new Set();
  world.playerTile = null;
  world.defeatedFoes = new Set();
  world.visitedTown = false;
}
