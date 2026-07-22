# Ashen Saga

A browser-based, FF6-inspired tactical RPG set in an original grimdark-fantasy world
(generic Warhammer-fantasy archetypes — no trademarked names, places, or characters).

**Status:** vertical slice — two chained Active Time Battles with synthesized
sound, particle effects, and a boss encounter.

## Play

```
node server.js
```

Then open http://localhost:5178

- **Gauges** fill in real time. When a hero's ATB bar is full, time pauses (Wait mode) and you choose a command.
- **Mouse:** hover + click menu items and targets.
- **Keyboard:** arrows to move, `Enter`/`Space` to confirm, `Esc` to go back.

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
  main.js           Phaser config + boot
  data.js           heroes, enemies, abilities, encounters (all balance numbers)
  sprites.js        procedural character + particle art baked to textures
  audio.js          synthesized SFX + music (Web Audio, no asset files)
  BattleScene.js    the ATB battle system + encounter flow
```

## Next up (ideas)

- More encounters + a proper boss fight arc
- Overworld / town exploration and NPCs
- Story framing (why this band fights)
- Level-ups, equipment, status effects (poison, stun), elemental weaknesses
- Better art (hand-drawn or imported sprite sheets)
