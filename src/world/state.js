// ============================================================
//  Ashen Saga — shared world state
//  Persists across scene changes (module state survives scene
//  restarts; it only resets on a full page reload).
// ============================================================
export const world = {
  party: [],                 // the 5 chosen characters (see rpg/party.js)
  playerTile: null,          // { x, y } where the hero stands on the overworld
  defeatedFoes: new Set(),   // ids of roaming foes already beaten
  visitedTown: false,
};

export function resetWorld() {
  world.party = [];
  world.playerTile = null;
  world.defeatedFoes = new Set();
  world.visitedTown = false;
}
