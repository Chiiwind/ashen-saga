// ============================================================
//  Ashen Saga — procedural sprite art
//  Each unit is drawn into a Graphics object and baked to a
//  texture. Figures are drawn facing RIGHT; the battle scene
//  flips the party to face left.
//  Canvas per unit: 72 x 88, feet at y=82.
// ============================================================

const W = 72, H = 88;

// small helpers -------------------------------------------------
function shadow(g) {
  g.fillStyle(0x000000, 0.35);
  g.fillEllipse(36, 83, 46, 12);
}
function outlineRect(g, x, y, w, h, fill, line = 0x14131a) {
  g.fillStyle(line, 1); g.fillRect(x - 1, y - 1, w + 2, h + 2);
  g.fillStyle(fill, 1);  g.fillRect(x, y, w, h);
}

// --- individual unit painters ---------------------------------
const PAINTERS = {
  // Warrior Priest — steel armour, white/gold tabard, mace
  priest(g) {
    shadow(g);
    outlineRect(g, 26, 52, 9, 26, 0x9aa2b0);   // left leg
    outlineRect(g, 38, 52, 9, 26, 0x9aa2b0);   // right leg
    g.fillStyle(0x3a3d48); g.fillRect(25, 74, 12, 6); g.fillRect(37, 74, 12, 6); // boots
    outlineRect(g, 23, 30, 26, 24, 0x8b93a3);  // torso armour
    outlineRect(g, 33, 30, 7, 26, 0xe6dcc0);   // tabard
    g.fillStyle(0xd8a838); g.fillRect(34, 40, 5, 5); // holy sigil
    g.fillStyle(0x8b93a3); g.fillCircle(24, 32, 6); g.fillCircle(48, 32, 6); // pauldrons
    outlineRect(g, 30, 12, 14, 12, 0xb8c0cc);  // helmet
    g.fillStyle(0xe2b48c); g.fillRect(32, 18, 10, 6); // face slit
    g.fillStyle(0x2a2d38); g.fillRect(33, 20, 8, 2);  // visor shade
    g.fillStyle(0xd8a838); g.fillRect(35, 8, 4, 5);   // crest
    // mace on the right
    g.fillStyle(0x6b4a2a); g.fillRect(52, 34, 4, 26);
    g.fillStyle(0xb8c0cc); g.fillCircle(54, 30, 7);
    g.fillStyle(0x8b93a3); g.fillCircle(51, 28, 2); g.fillCircle(57, 28, 2); g.fillCircle(54, 24, 2);
  },

  // Bright Wizard — crimson robe, pointed hat, glowing staff
  wizard(g) {
    shadow(g);
    g.fillStyle(0x14131a); g.fillTriangle(20, 78, 52, 78, 36, 40); // robe outline
    g.fillStyle(0xb02a2a); g.fillTriangle(22, 76, 50, 76, 36, 42); // robe
    g.fillStyle(0x7a1818); g.fillTriangle(36, 44, 44, 74, 36, 74); // robe shade
    g.fillStyle(0xd8a838); g.fillRect(35, 60, 2, 14);              // trim
    outlineRect(g, 30, 30, 12, 14, 0xb02a2a);  // upper body
    g.fillStyle(0xe2b48c); g.fillCircle(36, 24, 8);  // head
    g.fillStyle(0x2a2d38); g.fillRect(33, 23, 2, 2); g.fillRect(39, 23, 2, 2); // eyes
    // pointed hat
    g.fillStyle(0x14131a); g.fillTriangle(24, 16, 48, 16, 40, -6);
    g.fillStyle(0x8b1a1a); g.fillTriangle(26, 15, 46, 15, 39, -3);
    g.fillStyle(0x2a2d38); g.fillRect(24, 14, 24, 4); // brim
    // staff with ember
    g.fillStyle(0x6b4a2a); g.fillRect(52, 20, 4, 58);
    g.fillStyle(0xff7a1a); g.fillCircle(54, 16, 7);
    g.fillStyle(0xffd24a); g.fillCircle(54, 16, 3);
  },

  // Dwarf Slayer — bare-chested, orange mohawk, big axe, tattoos
  slayer(g) {
    shadow(g);
    outlineRect(g, 26, 56, 9, 22, 0x3d2f22);   // left leg (breeches)
    outlineRect(g, 38, 56, 9, 22, 0x3d2f22);   // right leg
    outlineRect(g, 24, 36, 24, 22, 0xdca878);  // bare torso
    g.fillStyle(0x2a5db0); g.fillRect(28, 40, 3, 12); g.fillRect(41, 42, 3, 10); // woad tattoos
    g.fillStyle(0x2a5db0); g.fillRect(34, 44, 4, 3);
    g.fillStyle(0x8b93a3); g.fillRect(24, 54, 24, 4); // belt buckle band
    g.fillStyle(0xdca878); g.fillCircle(36, 28, 8);   // head
    g.fillStyle(0xc47a3a); g.fillRect(33, 30, 8, 6);  // beard
    g.fillStyle(0x2a2d38); g.fillRect(33, 25, 2, 2); g.fillRect(39, 25, 2, 2); // eyes
    // flaming orange mohawk
    g.fillStyle(0xff6a1a);
    g.fillTriangle(30, 22, 34, 22, 32, 8);
    g.fillTriangle(34, 22, 38, 22, 36, 4);
    g.fillTriangle(38, 22, 42, 22, 40, 9);
    // great axe on the right
    g.fillStyle(0x6b4a2a); g.fillRect(52, 22, 4, 58);
    g.fillStyle(0x14131a); g.fillTriangle(46, 20, 68, 30, 46, 40);
    g.fillStyle(0xc0c6d0); g.fillTriangle(48, 24, 64, 30, 48, 37);
  },

  // Goblin Raider — small, green, big ears, crude dagger
  goblin(g) {
    shadow(g);
    outlineRect(g, 30, 54, 6, 20, 0x4a7a2a);   // legs
    outlineRect(g, 38, 54, 6, 20, 0x4a7a2a);
    outlineRect(g, 28, 38, 18, 18, 0x5c3a1e);  // ragged tunic
    g.fillStyle(0x6aa03a); g.fillCircle(37, 30, 9);  // head
    g.fillStyle(0x6aa03a); g.fillTriangle(28, 30, 20, 20, 30, 26); // left ear
    g.fillStyle(0x6aa03a); g.fillTriangle(46, 30, 54, 20, 44, 26); // right ear
    g.fillStyle(0xd23a2a); g.fillRect(33, 28, 2, 2); g.fillRect(40, 28, 2, 2); // red eyes
    g.fillStyle(0xf0f0e0); g.fillRect(34, 34, 6, 2); // teeth
    // dagger
    g.fillStyle(0x6b4a2a); g.fillRect(48, 46, 3, 8);
    g.fillStyle(0xc0c6d0); g.fillTriangle(47, 46, 52, 46, 49, 32);
  },

  // Night Shaman — hooded goblin caster with a totem
  shaman(g) {
    shadow(g);
    g.fillStyle(0x14131a); g.fillTriangle(24, 76, 50, 76, 37, 34); // robe outline
    g.fillStyle(0x3a2e5a); g.fillTriangle(26, 74, 48, 74, 37, 36); // dark robe
    g.fillStyle(0x5a4a80); g.fillRect(35, 50, 4, 24);              // trim
    g.fillStyle(0x6aa03a); g.fillCircle(37, 30, 8);   // face
    g.fillStyle(0xd2c24a); g.fillRect(33, 30, 2, 2); g.fillRect(40, 30, 2, 2); // eyes
    // hood
    g.fillStyle(0x2a2140); g.fillTriangle(25, 34, 49, 34, 37, 12);
    g.fillStyle(0x3a2e5a); g.fillTriangle(28, 33, 46, 33, 37, 16);
    // totem staff with skull glow
    g.fillStyle(0x4a3420); g.fillRect(50, 26, 4, 52);
    g.fillStyle(0xe8e0d0); g.fillCircle(52, 22, 6);
    g.fillStyle(0x1a1a22); g.fillCircle(50, 22, 1.5); g.fillCircle(54, 22, 1.5);
    g.fillStyle(0x8affd2, 0.5); g.fillCircle(52, 22, 9);
  },

  // Orc Brute — big, hulking, tusks, crude club
  brute(g) {
    shadow(g);
    outlineRect(g, 24, 56, 12, 22, 0x3a6a24);  // legs
    outlineRect(g, 40, 56, 12, 22, 0x3a6a24);
    outlineRect(g, 18, 30, 40, 28, 0x4c8a2c);  // huge torso
    g.fillStyle(0x2a4a18); g.fillRect(18, 44, 40, 4); // gut shade
    g.fillStyle(0x5c3a1e); g.fillRect(18, 52, 40, 6); // belt
    g.fillStyle(0x4c8a2c); g.fillCircle(20, 30, 9); g.fillCircle(56, 30, 9); // shoulders
    g.fillStyle(0x4c8a2c); g.fillCircle(38, 22, 12);  // head
    g.fillStyle(0xd23a2a); g.fillRect(33, 19, 3, 3); g.fillRect(42, 19, 3, 3); // eyes
    g.fillStyle(0xf0efe0); g.fillTriangle(33, 28, 36, 28, 34, 33); // tusk
    g.fillStyle(0xf0efe0); g.fillTriangle(42, 28, 45, 28, 44, 33); // tusk
    // club on the right
    g.fillStyle(0x5a3d22); g.fillRect(58, 26, 6, 40);
    g.fillStyle(0x6b4a2a); g.fillRoundedRect(54, 14, 16, 20, 6);
    g.fillStyle(0x3a2a18); g.fillCircle(60, 20, 2); g.fillCircle(64, 26, 2);
  },
};

// Build every unit texture once. Call from scene create().
export function buildUnitTextures(scene) {
  for (const key of Object.keys(PAINTERS)) {
    if (scene.textures.exists('unit_' + key)) continue;
    const g = scene.add.graphics();
    PAINTERS[key](g);
    g.generateTexture('unit_' + key, W, H);
    g.destroy();
  }
  return { W, H };
}
