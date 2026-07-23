# Ashen Saga — Progression & Areas Plan

A living design doc for the whole-game arc. The current build (the Ashen Wilds +
Aldenmoor + the Chaos Marauder) is **Act I** — a small slice of the plan below.
Everything is sized so the systems (levels, sphere grid, gold, gear) have room to
grow across the entire game.

## The four progression axes

| Axis | Source | Effect | Gate |
|------|--------|--------|------|
| **Character Level** (1→60) | EXP from battles | base stat growth | soft — enemies scale by act |
| **Sphere Grid** | S.Lv (move) + spheres (activate) | stats + abilities | **Key spheres** (Lv1–4) gate deeper regions |
| **Equipment** | loot + shops (gold) | weapon/armour/accessory stat mods | gear tiers per act |
| **Gold** | battle drops | inns (heal), shops (gear, spheres) | prices scale per act |

The **Key spheres are the master gate**: each act drops the next Key tier, which
unlocks the next band of the grid. So grid power and area progress advance together
— the grid literally "accommodates the whole game" because you can only reach its
outer regions once later acts hand you Lv2/3/4 keys.

## Act structure (level range · hub · enemies · boss · unlocks)

### Act I — The Ashen Wilds  ·  Lv 1–8   *(BUILT)*
- **Story:** the green tide spills from the old Ashmoor Mine under the warboss **Grukk Skullsplitter**; Aldenmoor sends for wardens (you). Intro cutscene → clear the mine → slay Grukk → "End of Act I".
- **Hub:** Aldenmoor (village). Inn (heals), Pedlar Rosa's shop, Watchman Corin gives the mine quest.
- **Areas:** the Ashen Wilds overworld (random greenskin battles as you travel) → the **Ashmoor Mine**, a 4-screen dungeon (Descent → Warrens → Ore Caverns → Grukk's Throne) with split paths, treasure chests, random encounters, and set-piece brutes.
- **Enemies:** goblins, orc grunts/brutes, ogres, night shamans. **Boss:** Grukk Skullsplitter (+ orc guard).
- **Encounters:** random battles on field tiles (overworld + mine floors 0–2); bosses/brutes are visible set-pieces. Chests tracked in `world.openedChests`; floors linked by stairs via `world.dungeonFloor`/`dungeonEntry`.
- **Unlocks:** the starting grid ring; **Lv1 Key spheres** → first locked band.
- **Gear tier:** Iron. **Spheres:** Power / Mana / Speed / Ability.

### Act II — The Blighted Marches  ·  Lv 8–18
- **Hub:** Grimfen (fortified hamlet).
- **Areas:** rotting marsh, a drowned village, the Barrow crypts.
- **Enemies:** skeletons, zombies, swamp-fiends (muddy/swampy), plague shamans.
- **Boss:** the Barrow Necromancer (raises undead mid-fight).
- **Unlocks:** **Lv2 Key spheres** → second grid band; **Fortune spheres** + Luck stat introduced.
- **Gear tier:** Steel.

### Act III — The Ironpeak Reaches  ·  Lv 18–28
- **Hub:** Karak-Var (dwarf hold).
- **Areas:** switchback passes, the deep mines, a collapsed hall.
- **Enemies:** orcs, ogres, chaos-touched dwarfs, cave trolls.
- **Boss:** Gorthok the Warlord (orc, summons adds).
- **Unlocks:** **Lv3 Key spheres**; **Teleport spheres** (jump your token to any node you've already activated).
- **Gear tier:** Dwarven / Mithril.

### Act IV — The Chaos Wastes  ·  Lv 28–42
- **Hub:** a wandering war-camp (mobile hub).
- **Areas:** warped wastes, a daemon-haunted battlefield, the Brass Fortress.
- **Enemies:** chaos warriors, big demons, beastman hordes, chort packs.
- **Boss:** the Chaos Champion (multi-phase).
- **Unlocks:** **Lv4 Key spheres** → the endgame grid region; **Warp spheres** (empty then re-spec a node).
- **Gear tier:** Chaos-forged (risk/reward: strong with drawbacks).

### Act V — The Ashfall Rift  ·  Lv 42–60
- **Hub:** none (point of no return, with a save-warp back).
- **Areas:** the Rift descent, the Heart of Ashfall.
- **Enemies:** everything, elite variants; **superbosses** in optional side-nodes.
- **Boss:** the source of the Ashfall.
- **Unlocks:** full grid; relic gear; secret classes/abilities in optional locked nodes.

## System scaling by act

- **EXP curve:** `expForNext(level) = round(32 * rung^1.85 * 5.5^band)` where each act is a 10-level *band* and `rung` is 1–10 within it. Cost climbs steeply toward the top of a band → a **soft cap** if you over-grind one area; crossing into the next act resets the rung cheap, and that act's foes pay ~`5.5×` more EXP (`actExpScale(act)`), which carries the next ten levels. So: steady progress in-area, a wall past it, a fresh ramp each act.
- **Gold:** enemies drop gold ≈ their EXP. Inn rest costs `~8 × avg party level`. Shops sell current-act gear + a few spheres.
- **Sphere economy:** battles grant S.Lv (movement) + typed spheres; rarer high-tier spheres (HP+40, big abilities) sit behind Key locks. Fortune/Teleport/Warp spheres are act-gated as above.
- **Sphere grid growth:** each act = a new **band/region** appended in `spheregrid.js` (more stat/ability nodes + that act's Key locks + a couple of cross-class ability nodes so builds diversify late).

## Build order (features supporting the plan)

1. ✅ Sphere Grid (faithful FF10) — engine that scales.
2. **Save/load** — persist party + world across sessions. *(this pass)*
3. **Gold + Inn** — economy foundation; inns heal for gold. *(this pass)*
4. ✅ **Loot / Equipment + Shops** — 60+ items over 5 tiers, class equip rules
   (weapon types, armour weights, accessory slots), effects (crit/lifesteal),
   inventory, battle drops, equip screen (I), merchant shop, stat integration.
5. **Sphere grid expansion** — Fortune + Teleport/Warp, Act II+ regions behind Key locks. *(next)*
6. **Content** — author Acts II→V areas/enemies/bosses/hubs against this doc.
