# Ashen Saga

A browser-based, FF6-inspired tactical RPG set in an original grimdark-fantasy world
(generic Warhammer-fantasy archetypes — no trademarked names, places, or characters).

**Status:** playable slice — build a party of five from a class roster,
explore an overworld and town, fight Active-Time battles, and grow your
heroes through levels and branching skill trees.

## Play

```
node server.js
```

Then open http://localhost:5178

**Create your band:** at the start, pick a class and name for each of your five
heroes from a roster of eight (Greatsword, Warrior Priest, Bright Wizard, Dwarf
Slayer, Waywatcher, Witch Hunter, Grey Wizard, Halfling Physician).

**Explore (overworld + town):**
- Arrows / WASD to walk. The camera follows you.
- `Space` / `Enter` to talk to townsfolk; step on the town door to enter, on the gate to leave.
- `M` opens the party & skill-tree menu.
- Walk into a roaming foe to start a battle. Beaten foes stay beaten.

**Grow your heroes:** battles grant **EXP** (→ levels → higher stats) and **AP**.
Spend AP in each hero's **branching skill tree** (`M`) to learn new abilities,
rank up, and buy stat boosts. Wounds and progress persist between fights.

**Battle:**
- Gauges fill in real time. When a hero's ATB bar is full, time pauses (Wait mode) and you choose a command.
- Mouse: hover + click menu items and targets. Keyboard: arrows + `Enter`/`Space`, `Esc` to go back.

## The band

| Hero | Archetype | Signature |
|------|-----------|-----------|
| Ser Aldric | Warrior Priest | Smite / Healing Prayer |
| Magda | Bright Wizard | Fireball / Cinder Storm (all foes) |
| Grimm | Dwarf Slayer | Reckless Swing (recoil) / Oath Roar (self buff) |

**Encounters (played in sequence):**
1. *Ambush on the Ash Road* — two Goblin Raiders, a Night Shaman, an Orc Brute.
2. *The Warband* — a **Chaos Marauder** (boss) with two Beastmen and a goblin.

Between fights your band is patched up (survivors healed, the fallen revived).
The boss is meant to punish autopilot — win it by actually using your abilities.

**Sound & effects:** all audio is synthesized in code (Web Audio) — combat SFX
plus a moody looping battle track — so there are no audio files to ship. Sound
starts on your first click or key press (browser autoplay rules). Visual polish
is particle-based (fire embers, hit sparks, heal motes, drifting ash) with a
vignette.

## Project layout

```
index.html          page shell, loads Phaser + the game
vendor/phaser.min.js Phaser 3 (vendored, no runtime CDN dependency)
server.js           zero-dependency static dev server
src/
  main.js           Phaser config + boot (registers all scenes)
  data.js           heroes, enemies, abilities, encounters (all balance numbers)
  sprites.js        procedural battle + particle art baked to textures
  audio.js          synthesized SFX + music (Web Audio, no asset files)
  BattleScene.js    the ATB battle system + encounter flow
  rpg/
    classes.js      8 classes: base stats, growth, skill trees
    party.js        characters, derived stats, EXP/levels, AP, learning
  world/
    tiles.js        tile codes, walkability, per-tile drawing
    worldSprites.js top-down overworld/town character art
    state.js        cross-scene world state (party, position, beaten foes)
    MapScene.js     base explore scene: tiles, movement, camera, dialogue
  scenes/
    PartyCreateScene.js  name + class picker for your five heroes
    PartyMenuScene.js    party list + branching skill trees (spend AP)
    OverworldScene.js    the world map, town gateway, roaming foes
    TownScene.js         walled town, buildings, NPCs, gate
```

## Next up (ideas)

- An inn that actually heals (spend gold to rest)
- Equipment / loot and gold from battles
- Status effects (poison, stun), elemental weaknesses
- More towns, encounters, and story framing
- Save/load (persist the party between sessions)
- Better art (hand-drawn or imported sprite sheets)
