/**
 * scripts/gen-placeholders.js
 * Generates placeholder assets for Brothers Burger Game.
 * Uses ONLY built-in Node.js modules (no external deps).
 * Run: node scripts/gen-placeholders.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// ---------------------------------------------------------------------------
// PNG helpers
// ---------------------------------------------------------------------------

function crc32(buf) {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function uint32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const crcVal = crc32(Buffer.concat([typeBytes, data]));
  return Buffer.concat([uint32BE(data.length), typeBytes, data, uint32BE(crcVal)]);
}

function makePNG(w, h, r, g, b) {
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 2;   // color type: RGB
  ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;

  // Raw scanlines: filter byte (0) + RGB per pixel
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const off = y * (1 + w * 3);
    raw[off] = 0; // filter type None
    for (let x = 0; x < w; x++) {
      raw[off + 1 + x * 3]     = r;
      raw[off + 1 + x * 3 + 1] = g;
      raw[off + 1 + x * 3 + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(raw);

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdrData),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Tilemap helpers
// ---------------------------------------------------------------------------

function makeTilemapData(mapWidth, mapHeight) {
  // All zeros, then fill the last row with tile index 1 (ground)
  const data = new Array(mapWidth * mapHeight).fill(0);
  const lastRowStart = (mapHeight - 1) * mapWidth;
  for (let i = 0; i < mapWidth; i++) data[lastRowStart + i] = 1;
  return data;
}

function makeTilemap(tilesetSource) {
  const mapWidth = 50;
  const mapHeight = 15;
  return {
    width: mapWidth,
    height: mapHeight,
    tilewidth: 16,
    tileheight: 16,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tilesets: [{ firstgid: 1, source: tilesetSource }],
    layers: [
      {
        name: 'Ground',
        type: 'tilelayer',
        width: mapWidth,
        height: mapHeight,
        data: makeTilemapData(mapWidth, mapHeight),
        properties: [],
      },
      {
        name: 'Objects',
        type: 'objectgroup',
        objects: [
          { id: 1,  name: 'spawn',    type: 'spawn',     x: 100, y: 180, width: 16, height: 16 },
          { id: 2,  name: 'goal',     type: 'goal',      x: 700, y: 180, width: 32, height: 64 },
          { id: 3,  name: '',         type: 'fries',     x: 200, y: 160, width: 16, height: 16 },
          { id: 4,  name: '',         type: 'pao',       x: 250, y: 160, width: 16, height: 16 },
          { id: 5,  name: '',         type: 'alface',    x: 300, y: 160, width: 16, height: 16 },
          { id: 6,  name: '',         type: 'tomate',    x: 350, y: 160, width: 16, height: 16 },
          { id: 7,  name: '',         type: 'molho',     x: 400, y: 160, width: 16, height: 16 },
          { id: 8,  name: '',         type: 'bacon',     x: 450, y: 160, width: 16, height: 16 },
          { id: 9,  name: '',         type: 'hamburger', x: 500, y: 160, width: 16, height: 16 },
          { id: 10, name: '',         type: 'mushroom',  x: 150, y: 140, width: 16, height: 16 },
          { id: 11, name: '',         type: 'picles',    x: 320, y: 176, width: 16, height: 16 },
          { id: 12, name: '',         type: 'cebola',    x: 420, y: 176, width: 16, height: 16 },
        ],
      },
    ],
  };
}

function makeTilesetJSON(name) {
  return {
    name,
    tilewidth: 16,
    tileheight: 16,
    tilecount: 16,
    columns: 4,
    image: `${name}.png`,
    imagewidth: 64,
    imageheight: 64,
    margin: 0,
    spacing: 0,
    tiles: [],
  };
}

// ---------------------------------------------------------------------------
// File write helper
// ---------------------------------------------------------------------------

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`  [OK] ${filePath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');

console.log('\n=== Brothers Burger — Placeholder Asset Generator ===\n');

// ---- Directories ----------------------------------------------------------
const dirs = [
  path.join(PUBLIC, 'assets', 'sprites'),
  path.join(PUBLIC, 'assets', 'tilesets'),
  path.join(PUBLIC, 'assets', 'tilemaps'),
  path.join(PUBLIC, 'assets', 'audio'),
  path.join(PUBLIC, 'assets', 'audio', 'sfx'),
];
dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
console.log('Directories created.\n');

// ---- Sprites / Spritesheets -----------------------------------------------
console.log('Generating sprites...');

// logo / ui (single image, 64x64, white)
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'ui.png'), makePNG(64, 64, 255, 255, 255));

// char1 — 9 frames × 16×24 = 144×24, green
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'char1.png'), makePNG(144, 24, 50, 200, 80));

// char2 — 9 frames × 16×24 = 144×24, blue
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'char2.png'), makePNG(144, 24, 80, 120, 220));

// enemies — 9 frames × 16×16 = 144×16, red
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'enemies.png'), makePNG(144, 16, 220, 60, 60));

// bosses — 9 frames × 32×32 = 288×32, dark red
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'bosses.png'), makePNG(288, 32, 160, 30, 30));

// powerups — 3 frames × 16×16 = 48×16, orange
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'powerups.png'), makePNG(48, 16, 255, 140, 0));

// collectibles — 7 frames × 16×16 = 112×16, yellow
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'collectibles.png'), makePNG(112, 16, 255, 220, 0));

// ---- Tilesets (images) ----------------------------------------------------
console.log('\nGenerating tileset images...');

// 64×64 gray placeholder for each tileset
const tilesetNames = ['cozinha', 'rua', 'mercado', 'restaurante'];
tilesetNames.forEach(name => {
  writeFile(path.join(PUBLIC, 'assets', 'tilesets', `${name}.png`), makePNG(64, 64, 160, 160, 160));
});

// ---- Tilemaps (JSON) -------------------------------------------------------
console.log('\nGenerating tilemaps...');

const tilemapSources = ['cozinha.json', 'rua.json', 'mercado.json', 'restaurante.json'];
['fase1', 'fase2', 'fase3', 'fase4'].forEach((name, i) => {
  const json = makeTilemap(tilemapSources[i]);
  writeFile(
    path.join(PUBLIC, 'assets', 'tilemaps', `${name}.json`),
    JSON.stringify(json, null, 2),
  );
});

// ---- Tileset JSONs (Tiled external tileset format) -------------------------
console.log('\nGenerating tileset JSON files...');

tilesetNames.forEach(name => {
  const json = makeTilesetJSON(name);
  writeFile(
    path.join(PUBLIC, 'assets', 'tilemaps', `${name}.json`),
    JSON.stringify(json, null, 2),
  );
});

// ---- Audio (0-byte MP3 stubs) ---------------------------------------------
console.log('\nGenerating audio stubs...');

// Background music tracks
['fase1', 'fase2', 'fase3', 'fase4', 'boss'].forEach(name => {
  writeFile(path.join(PUBLIC, 'assets', 'audio', `${name}.mp3`), Buffer.alloc(0));
});

// SFX
['jump', 'collect', 'powerup', 'damage', 'defeat'].forEach(name => {
  writeFile(path.join(PUBLIC, 'assets', 'audio', 'sfx', `${name}.mp3`), Buffer.alloc(0));
});

console.log('\n=== Done! All placeholder assets generated. ===\n');
