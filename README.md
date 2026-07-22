# Ashen Saga

A browser-based, FF6-inspired tactical RPG set in an original grimdark-fantasy world
(generic Warhammer-fantasy archetypes — no trademarked names, places, or characters).

**Status:** vertical slice — one playable Active Time Battle.

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

Foes: two Goblin Raiders, a Night Shaman, and an Orc Brute.

## Project layout

```
index.html          page shell, loads Phaser + the game
vendor/phaser.min.js Phaser 3 (vendored, no runtime CDN dependency)
server.js           zero-dependency static dev server
src/
  main.js           Phaser config + boot
  data.js           heroes, enemies, abilities (all balance numbers)
  sprites.js        procedural character art baked to textures
  BattleScene.js    the ATB battle system
```

## Next up (ideas)

- Sound + music
- Overworld / town exploration and NPCs
- Story framing and a second encounter
- Level-ups, equipment, status effects
- Better art (hand-drawn or imported sprite sheets)
