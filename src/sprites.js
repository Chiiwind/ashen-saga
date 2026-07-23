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

  // Greatsword — heavy plate soldier with a huge two-hander
  warrior(g) {
    shadow(g);
    outlineRect(g, 25, 52, 10, 26, 0x7a828e);   // legs (plate)
    outlineRect(g, 39, 52, 10, 26, 0x7a828e);
    g.fillStyle(0x2a2d38); g.fillRect(24, 74, 12, 6); g.fillRect(38, 74, 12, 6);
    outlineRect(g, 22, 28, 28, 26, 0x9aa2b0);   // breastplate
    g.fillStyle(0x6a7280); g.fillRect(22, 40, 28, 3);
    g.fillStyle(0xb8c0cc); g.fillCircle(23, 30, 7); g.fillCircle(49, 30, 7); // pauldrons
    outlineRect(g, 30, 12, 14, 13, 0xb8c0cc);   // helm
    g.fillStyle(0x2a2d38); g.fillRect(32, 18, 10, 4);  // visor
    g.fillStyle(0x9aa2b0); g.fillTriangle(35, 8, 39, 8, 37, 2); // crest
    // greatsword held high on the right
    g.fillStyle(0x6b4a2a); g.fillRect(53, 42, 4, 10);
    g.fillStyle(0x8b93a3); g.fillRect(50, 44, 10, 4);  // crossguard
    g.fillStyle(0xd8dde4); g.fillRect(54, 2, 3, 42);   // blade
    g.fillStyle(0xf0f4f8); g.fillRect(54, 2, 1, 42);
  },

  // Waywatcher — hooded elf archer with a longbow
  archer(g) {
    shadow(g);
    outlineRect(g, 27, 54, 8, 24, 0x2f5a3a);   // legs
    outlineRect(g, 39, 54, 8, 24, 0x2f5a3a);
    g.fillStyle(0x1f3d28); g.fillRect(26, 74, 10, 6); g.fillRect(38, 74, 10, 6);
    outlineRect(g, 25, 32, 24, 24, 0x3f7d52);  // green tunic/cloak
    g.fillStyle(0x2f5a3a); g.fillRect(25, 44, 24, 3);
    g.fillStyle(0xe2b48c); g.fillCircle(37, 24, 8);   // face
    g.fillStyle(0x2a5a38); g.fillTriangle(27, 24, 47, 24, 37, 6); // hood
    g.fillStyle(0x1f4a2c); g.fillTriangle(30, 22, 44, 22, 37, 10);
    g.fillStyle(0x2a2d38); g.fillRect(33, 22, 2, 2); g.fillRect(39, 22, 2, 2);
    // longbow on the right
    g.lineStyle(3, 0x6b4a2a, 1);
    g.beginPath(); g.arc(56, 34, 26, -1.1, 1.1, false); g.strokePath();
    g.lineStyle(1, 0xcfc8b0, 1);
    g.beginPath(); g.moveTo(56 + 26 * Math.cos(-1.1), 34 + 26 * Math.sin(-1.1));
    g.lineTo(56 + 26 * Math.cos(1.1), 34 + 26 * Math.sin(1.1)); g.strokePath();
    g.lineStyle();
  },

  // Witch Hunter — black hat + coat, pistol and blade
  hunter(g) {
    shadow(g);
    outlineRect(g, 27, 54, 8, 24, 0x2a2a30);   // legs
    outlineRect(g, 39, 54, 8, 24, 0x2a2a30);
    g.fillStyle(0x14141a); g.fillRect(26, 74, 10, 6); g.fillRect(38, 74, 10, 6);
    outlineRect(g, 25, 30, 24, 26, 0x33313e);  // black coat
    g.fillStyle(0xe8e0d0); g.fillRect(35, 30, 4, 24); // white shirt line
    g.fillStyle(0x8a1a1a); g.fillRect(25, 42, 24, 3); // red sash
    g.fillStyle(0xe2b48c); g.fillCircle(37, 22, 8);   // face
    g.fillStyle(0x2a2d38); g.fillRect(33, 21, 2, 2); g.fillRect(39, 21, 2, 2);
    g.fillStyle(0x1a1a1f); g.fillRect(27, 12, 20, 5); // hat brim
    g.fillStyle(0x1a1a1f); g.fillRect(31, 4, 12, 9);  // hat crown
    // pistol
    g.fillStyle(0x3a2a1a); g.fillRect(50, 40, 10, 4);
    g.fillStyle(0x6a6a72); g.fillRect(56, 38, 6, 3);
  },

  // Grey Wizard — grey robe + wide hat, wisp of grey wind
  greywiz(g) {
    shadow(g);
    g.fillStyle(0x14131a); g.fillTriangle(20, 78, 52, 78, 36, 40); // robe outline
    g.fillStyle(0x6a6a74); g.fillTriangle(22, 76, 50, 76, 36, 42);
    g.fillStyle(0x4c4c56); g.fillTriangle(36, 44, 44, 74, 36, 74);
    outlineRect(g, 30, 30, 12, 14, 0x6a6a74);
    g.fillStyle(0xe2b48c); g.fillCircle(36, 24, 8);
    g.fillStyle(0x2a2d38); g.fillRect(33, 23, 2, 2); g.fillRect(39, 23, 2, 2);
    g.fillStyle(0xbcbcc6); g.fillRect(31, 26, 10, 3); // grey beard
    g.fillStyle(0x3a3a42); g.fillTriangle(22, 16, 50, 16, 36, 2); // wide hat
    g.fillStyle(0x2a2a30); g.fillRect(22, 14, 28, 4);
    // grey-wind staff
    g.fillStyle(0x4a4438); g.fillRect(52, 20, 4, 58);
    g.fillStyle(0xbcc0c8, 0.5); g.fillCircle(54, 16, 8);
    g.fillStyle(0xe8ecf0, 0.8); g.fillCircle(54, 16, 3);
  },

  // Halfling Physician — small, satchel, apron, herb pouch
  physician(g) {
    shadow(g);
    g.fillStyle(0x3a2a18); g.fillRect(28, 58, 5, 18); g.fillRect(39, 58, 5, 18); // stubby legs
    g.fillStyle(0x2a2018); g.fillRect(27, 72, 7, 6); g.fillRect(38, 72, 7, 6);
    outlineRect(g, 26, 40, 20, 20, 0xd8d0c0);  // white shirt
    g.fillStyle(0x9a6a3a); g.fillRect(29, 44, 14, 12); // apron
    g.fillStyle(0x6a4a2a); g.fillRect(44, 42, 8, 12);  // satchel
    g.fillStyle(0xd8a838); g.fillRect(46, 46, 4, 3);
    g.fillStyle(0xe2b48c); g.fillCircle(36, 32, 9);    // big head
    g.fillStyle(0x2a2d38); g.fillRect(32, 31, 2, 2); g.fillRect(39, 31, 2, 2);
    g.fillStyle(0xc47a3a); g.fillRect(29, 22, 14, 6);  // curly hair
    g.fillStyle(0xc47a3a); g.fillCircle(30, 26, 3); g.fillCircle(42, 26, 3);
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

  // Beastman Gor — goat-headed, furred, crude cleaver
  beastman(g) {
    shadow(g);
    outlineRect(g, 28, 56, 8, 22, 0x5a4432);   // furry legs
    outlineRect(g, 40, 56, 8, 22, 0x5a4432);
    g.fillStyle(0x2a2018); g.fillRect(27, 74, 10, 6); g.fillRect(39, 74, 10, 6); // hooves
    outlineRect(g, 24, 34, 26, 24, 0x6b5238);  // furred torso
    g.fillStyle(0x4a3826); g.fillRect(24, 46, 26, 4); // belly shade
    g.fillStyle(0x8a6a44); g.fillCircle(24, 36, 6); g.fillCircle(50, 36, 6); // shoulders
    // goat head
    g.fillStyle(0x7a5c3c); g.fillEllipse(38, 24, 18, 16);
    g.fillStyle(0x5a4432); g.fillEllipse(42, 27, 10, 9);   // snout
    g.fillStyle(0xd23a2a); g.fillRect(35, 21, 2, 2); g.fillRect(41, 21, 2, 2); // eyes
    // curved horns
    g.fillStyle(0xe8e0c8);
    g.fillTriangle(30, 16, 34, 18, 22, 4);
    g.fillTriangle(44, 16, 40, 18, 54, 4);
    // cleaver
    g.fillStyle(0x4a3420); g.fillRect(52, 30, 4, 40);
    g.fillStyle(0x14131a); g.fillRect(50, 26, 18, 14);
    g.fillStyle(0x9aa0aa); g.fillRect(52, 28, 14, 10);
  },

  // Chaos Marauder (boss) — dark plate, horned helm, great axe
  marauder(g) {
    shadow(g);
    g.fillStyle(0x000000, 0.2); g.fillEllipse(36, 84, 56, 12); // heavier shadow
    outlineRect(g, 25, 54, 10, 26, 0x2a2a34);  // armoured legs
    outlineRect(g, 39, 54, 10, 26, 0x2a2a34);
    g.fillStyle(0x14141c); g.fillRect(24, 76, 12, 6); g.fillRect(38, 76, 12, 6);
    outlineRect(g, 20, 28, 32, 28, 0x33313e);  // dark plate torso
    g.fillStyle(0x8a1a1a); g.fillRect(34, 30, 4, 24); // blood-red trim
    g.fillStyle(0xd8a838); g.fillRect(33, 40, 6, 4);  // chaos boss
    // spiked pauldrons
    g.fillStyle(0x3d3b48); g.fillCircle(21, 30, 8); g.fillCircle(51, 30, 8);
    g.fillStyle(0x1a1a22); g.fillTriangle(15, 26, 21, 22, 18, 34);
    g.fillStyle(0x1a1a22); g.fillTriangle(57, 26, 51, 22, 54, 34);
    // horned helm
    outlineRect(g, 29, 12, 16, 14, 0x26252f);
    g.fillStyle(0x8a1a1a); g.fillRect(32, 17, 10, 3);  // eye slit glow
    g.fillStyle(0xff4a3a); g.fillRect(33, 18, 3, 1); g.fillRect(39, 18, 3, 1);
    g.fillStyle(0xdcd4bc);                              // horns
    g.fillTriangle(29, 14, 33, 12, 18, 2);
    g.fillTriangle(45, 14, 41, 12, 56, 2);
    // great axe
    g.fillStyle(0x2a1c12); g.fillRect(56, 16, 5, 62);
    g.fillStyle(0x14131a); g.fillTriangle(48, 12, 74, 24, 48, 36);
    g.fillStyle(0x6a2020); g.fillTriangle(50, 16, 70, 24, 50, 33);  // blood-iron blade
    g.fillStyle(0xb03030); g.fillTriangle(52, 19, 64, 24, 52, 30);
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
  buildFxTextures(scene);
  return { W, H };
}

// Small particle textures (soft glow dot + ash fleck).
export function buildFxTextures(scene) {
  if (!scene.textures.exists('p_dot')) {
    const g = scene.add.graphics();
    // fake radial glow: concentric fading rings
    for (let r = 8; r >= 1; r--) {
      g.fillStyle(0xffffff, 0.16);
      g.fillCircle(8, 8, r);
    }
    g.generateTexture('p_dot', 16, 16);
    g.destroy();
  }
  if (!scene.textures.exists('p_ash')) {
    const g = scene.add.graphics();
    g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 3, 3);
    g.generateTexture('p_ash', 3, 3);
    g.destroy();
  }
}
