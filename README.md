# Ashen Saga

A browser-based, FF6-inspired tactical RPG set in an original grimdark-fantasy world
(generic Warhammer-fantasy archetypes — no trademarked names, places, or characters).

**Status:** playable slice — explore an overworld and a town, then fight
Active-Time battles (with synthesized sound, particles, and a boss).

## Play

```
node server.js
```

Then open http://localhost:5178

**Explore (overworld + town):**
- Arrows / WASD to walk. The camera follows you.
- `Space` / `Enter` to talk to townsfolk; step on the town door to enter, on the gate to leave.
- Walk into a roaming foe to start a battle. Beaten foes stay beaten.

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
  world/
    tiles.js        tile codes, walkability, per-tile drawing
    worldSprites.js top-down overworld/town character art
    state.js        cross-scene world state (position, beaten foes)
    MapScene.js     base explore scene: tiles, movement, camera, dialogue
  scenes/
    OverworldScene.js  the world map, town gateway, roaming foes
    TownScene.js       walled town, buildings, NPCs, gate
```

## Next up (ideas)

- Persistent party HP across battles + an inn that actually heals
- Level-ups / rewards on victory
- Story framing (why this band fights) and more towns/encounters
- Status effects (poison, stun), elemental weaknesses, equipment
- Better art (hand-drawn or imported sprite sheets)
