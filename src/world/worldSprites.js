// ============================================================
//  Ashen Saga — top-down overworld sprites
//  Small figures seen from a high angle (facing "down"/toward
//  the viewer). Flipped horizontally for left/right movement.
//  Canvas: 24 x 30, feet near y=28.
// ============================================================
const W = 24, H = 30;

function shadow(g) { g.fillStyle(0x000000, 0.28); g.fillEllipse(12, 27, 18, 6); }
function outline(g, cx, cy, r, fill, line = 0x14131a) {
  g.fillStyle(line, 1); g.fillCircle(cx, cy, r + 1);
  g.fillStyle(fill, 1); g.fillCircle(cx, cy, r);
}

const PAINTERS = {
  // Player — hooded green-cloaked adventurer
  hero(g) {
    shadow(g);
    g.fillStyle(0x2a2a30, 1); g.fillRect(8, 22, 4, 6); g.fillRect(12, 22, 4, 6); // boots
    g.fillStyle(0x2f6b46, 1); g.fillRoundedRect(6, 12, 12, 12, 3);   // cloak/body
    g.fillStyle(0x24543a, 1); g.fillRect(11, 12, 2, 12);            // cloak seam
    g.fillStyle(0x8a6a44, 1); g.fillRect(4, 14, 3, 8); g.fillRect(17, 14, 3, 8); // arms
    outline(g, 12, 8, 6, 0xe2b48c);                                 // head
    g.fillStyle(0x5a3d22, 1); g.fillRect(6, 3, 12, 5);             // hair
    g.fillStyle(0x2a2d38, 1); g.fillRect(9, 8, 2, 2); g.fillRect(13, 8, 2, 2); // eyes
  },
  villager(g) {
    shadow(g);
    g.fillStyle(0x3a2a18, 1); g.fillRect(8, 22, 4, 6); g.fillRect(12, 22, 4, 6);
    g.fillStyle(0x9a6a3a, 1); g.fillRoundedRect(6, 12, 12, 12, 3);  // brown tunic
    g.fillStyle(0xd8b48c, 1); g.fillRect(4, 14, 3, 8); g.fillRect(17, 14, 3, 8);
    outline(g, 12, 8, 6, 0xe2b48c);
    g.fillStyle(0x2a2018, 1); g.fillRect(6, 3, 12, 4);
    g.fillStyle(0x2a2d38, 1); g.fillRect(9, 8, 2, 2); g.fillRect(13, 8, 2, 2);
  },
  guard(g) {
    shadow(g);
    g.fillStyle(0x2a2a30, 1); g.fillRect(8, 22, 4, 6); g.fillRect(12, 22, 4, 6);
    g.fillStyle(0x8b93a3, 1); g.fillRoundedRect(6, 12, 12, 12, 2);  // armour
    g.fillStyle(0x6a7280, 1); g.fillRect(6, 17, 12, 2);
    g.fillStyle(0x8b93a3, 1); g.fillRect(4, 14, 3, 8); g.fillRect(17, 14, 3, 8);
    outline(g, 12, 8, 6, 0xe2b48c);
    g.fillStyle(0xb8c0cc, 1); g.fillRect(6, 2, 12, 6);             // helmet
    g.fillStyle(0x2a2d38, 1); g.fillRect(8, 7, 8, 2);             // visor
    g.fillStyle(0x6b4a2a, 1); g.fillRect(20, 2, 2, 24);          // spear shaft
    g.fillStyle(0xc0c6d0, 1); g.fillTriangle(19, 2, 23, 2, 21, -4);
  },
  merchant(g) {
    shadow(g);
    g.fillStyle(0x2a2a30, 1); g.fillRect(8, 23, 8, 5);
    g.fillStyle(0x6a3a8a, 1); g.fillTriangle(5, 24, 19, 24, 12, 12); // robe
    g.fillStyle(0xd8a838, 1); g.fillRect(11, 14, 2, 10);            // trim
    g.fillStyle(0xd8b48c, 1); g.fillRect(4, 15, 3, 7); g.fillRect(17, 15, 3, 7);
    outline(g, 12, 8, 6, 0xe2b48c);
    g.fillStyle(0x3a2a4a, 1); g.fillRect(6, 2, 12, 5);            // cap
    g.fillStyle(0x2a2d38, 1); g.fillRect(9, 8, 2, 2); g.fillRect(13, 8, 2, 2);
  },
  innkeeper(g) {
    shadow(g);
    g.fillStyle(0x3a2a18, 1); g.fillRect(8, 22, 4, 6); g.fillRect(12, 22, 4, 6);
    g.fillStyle(0xd8d0c0, 1); g.fillRoundedRect(6, 12, 12, 12, 3);  // white shirt
    g.fillStyle(0x9a6a3a, 1); g.fillRect(9, 16, 6, 8);            // apron
    g.fillStyle(0xe2b48c, 1); g.fillRect(4, 14, 3, 8); g.fillRect(17, 14, 3, 8);
    outline(g, 12, 8, 6, 0xe2b48c);
    g.fillStyle(0x6a5540, 1); g.fillRect(6, 3, 12, 4);
    g.fillStyle(0x2a2d38, 1); g.fillRect(9, 8, 2, 2); g.fillRect(13, 8, 2, 2);
    g.fillStyle(0xcaa070, 1); g.fillRect(9, 11, 6, 2);           // moustache
  },
  // roaming goblin foe (top-down)
  foe(g) {
    shadow(g);
    g.fillStyle(0x3a2a18, 1); g.fillRect(8, 22, 4, 6); g.fillRect(12, 22, 4, 6);
    g.fillStyle(0x5c3a1e, 1); g.fillRoundedRect(7, 13, 10, 11, 2);
    g.fillStyle(0x6aa03a, 1); g.fillRect(4, 15, 3, 6); g.fillRect(17, 15, 3, 6);
    outline(g, 12, 8, 6, 0x6aa03a);
    g.fillStyle(0x6aa03a, 1); g.fillTriangle(5, 8, 1, 3, 7, 6); g.fillTriangle(19, 8, 23, 3, 17, 6); // ears
    g.fillStyle(0xd23a2a, 1); g.fillRect(9, 7, 2, 2); g.fillRect(13, 7, 2, 2);
  },
  // roaming warband foe — hulking, red-marked
  foe2(g) {
    shadow(g);
    g.fillStyle(0x14141c, 1); g.fillRect(7, 22, 5, 6); g.fillRect(12, 22, 5, 6);
    g.fillStyle(0x33313e, 1); g.fillRoundedRect(4, 11, 16, 14, 3); // bulky armour
    g.fillStyle(0x8a1a1a, 1); g.fillRect(11, 12, 2, 12);
    g.fillStyle(0x3d3b48, 1); g.fillCircle(5, 13, 4); g.fillCircle(19, 13, 4);
    outline(g, 12, 7, 6, 0x4c8a2c);
    g.fillStyle(0xdcd4bc, 1); g.fillTriangle(6, 5, 2, -1, 9, 4); g.fillTriangle(18, 5, 22, -1, 15, 4); // horns
    g.fillStyle(0xff4a3a, 1); g.fillRect(9, 6, 2, 2); g.fillRect(13, 6, 2, 2);
  },
  // treasure chest — closed
  chest(g) {
    shadow(g);
    g.fillStyle(0x000000, 0.35); g.fillEllipse(12, 26, 20, 6);
    g.fillStyle(0x5a3a1c, 1); g.fillRoundedRect(4, 12, 16, 13, 2);   // body
    g.fillStyle(0x6b4a24, 1); g.fillRoundedRect(4, 8, 16, 7, 3);     // domed lid
    g.fillStyle(0x3a2410, 1); g.fillRect(4, 14, 16, 2);              // lid seam
    g.fillStyle(0xd6a93a, 1); g.fillRect(4, 10, 16, 1.5);            // gold band
    g.fillStyle(0xd6a93a, 1); g.fillRect(5, 18, 1.5, 6); g.fillRect(18, 18, 1.5, 6);
    g.fillStyle(0xf0d060, 1); g.fillRect(11, 14, 2, 4);             // lock
  },
  // treasure chest — opened (lid up, empty glint)
  chest_open(g) {
    shadow(g);
    g.fillStyle(0x000000, 0.35); g.fillEllipse(12, 26, 20, 6);
    g.fillStyle(0x2a1a0c, 1); g.fillRoundedRect(5, 13, 14, 4, 2);    // dark interior
    g.fillStyle(0x5a3a1c, 1); g.fillRoundedRect(4, 15, 16, 10, 2);   // body
    g.fillStyle(0xd6a93a, 1); g.fillRect(5, 19, 1.5, 5); g.fillRect(18, 19, 1.5, 5);
    g.fillStyle(0x6b4a24, 1); g.fillRoundedRect(3, 3, 18, 6, 3);     // raised lid
    g.fillStyle(0xd6a93a, 1); g.fillRect(3, 5, 18, 1.5);
    g.fillStyle(0x8a857a, 0.5); g.fillRect(10, 14, 4, 1);           // faint empty glint
  },
};

export function buildWorldTextures(scene) {
  for (const key of Object.keys(PAINTERS)) {
    if (scene.textures.exists('w_' + key)) continue;
    const g = scene.add.graphics();
    PAINTERS[key](g);
    g.generateTexture('w_' + key, W, H);
    g.destroy();
  }
  return { W, H };
}
