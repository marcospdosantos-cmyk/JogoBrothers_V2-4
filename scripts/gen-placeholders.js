/**
 * scripts/gen-placeholders.js
 * Generates placeholder assets for Brothers Burger Game.
 * Uses ONLY built-in Node.js modules (no external deps).
 * Run: node scripts/gen-placeholders.js
 *
 * These are throwaway placeholders so the game is fully playable before the real
 * pixel art / Tiled maps / audio arrive. Tilemaps embed their tileset inline with
 * a `collides` property so the floor actually collides, and audio is valid silent
 * WAV (not 0-byte) so the WebAudio decoder never errors.
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

// Solid RGB PNG.
function makePNG(w, h, r, g, b) {
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8;   // bit depth
  ihdrData[9] = 2;   // color type: RGB
  ihdrData[10] = 0; ihdrData[11] = 0; ihdrData[12] = 0;

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
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdrData),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Spritesheet PNG where each frame gets its own flat colour, so individual frames
// are visually distinguishable while we wait for real art.
function makeSheetPNG(frameW, frameH, frameCount, baseRGB) {
  const w = frameW * frameCount;
  const h = frameH;
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const off = y * (1 + w * 3);
    raw[off] = 0;
    for (let x = 0; x < w; x++) {
      const frame = Math.floor(x / frameW);
      const shade = 1 - (frame % 4) * 0.12;       // slight per-frame variation
      raw[off + 1 + x * 3]     = Math.round(baseRGB[0] * shade);
      raw[off + 1 + x * 3 + 1] = Math.round(baseRGB[1] * shade);
      raw[off + 1 + x * 3 + 2] = Math.round(baseRGB[2] * shade);
    }
  }
  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdrData),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Audio: valid silent 8-bit mono PCM WAV
// ---------------------------------------------------------------------------

function makeSilentWav(ms = 150, rate = 8000) {
  const samples = Math.floor(rate * ms / 1000);
  const buf = Buffer.alloc(44 + samples);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);      // fmt chunk size
  buf.writeUInt16LE(1, 20);       // PCM
  buf.writeUInt16LE(1, 22);       // mono
  buf.writeUInt32LE(rate, 24);    // sample rate
  buf.writeUInt32LE(rate, 28);    // byte rate (rate * 1 channel * 1 byte)
  buf.writeUInt16LE(1, 32);       // block align
  buf.writeUInt16LE(8, 34);       // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(samples, 40);
  buf.fill(128, 44);              // 8-bit unsigned silence = 128
  return buf;
}

// ---------------------------------------------------------------------------
// Tilemap (embedded tileset + collidable ground + platforms)
// ---------------------------------------------------------------------------

const MAP_W = 50;
const MAP_H = 28;           // 28 * 16 = 448 px ~ matches the 450 px viewport
const TILE = 16;
const GROUND_TOP_ROW = MAP_H - 2;          // ground occupies the last two rows
const GROUND_SURFACE_Y = GROUND_TOP_ROW * TILE; // 416

// Floating platforms: [row, colStart, colEnd]
const PLATFORMS = [
  [MAP_H - 7, 14, 20],
  [MAP_H - 11, 28, 34],
  [MAP_H - 7, 40, 45],
];

function makeTilemapData() {
  const data = new Array(MAP_W * MAP_H).fill(0);
  for (let row = GROUND_TOP_ROW; row < MAP_H; row++) {
    for (let c = 0; c < MAP_W; c++) data[row * MAP_W + c] = 1;
  }
  for (const [row, c0, c1] of PLATFORMS) {
    for (let c = c0; c <= c1; c++) data[row * MAP_W + c] = 1;
  }
  return data;
}

function makeTilemap(tilesetName) {
  const surface = GROUND_SURFACE_Y;     // 416
  const objects = [
    { id: 1,  name: 'spawn', type: 'spawn', x: 64,  y: surface - 40, width: 16, height: 16 },
    { id: 2,  name: 'goal',  type: 'goal',  x: 776, y: surface - 80, width: 24, height: 96 },
    { id: 3,  name: '', type: 'fries',     x: 176, y: surface - 24, width: 16, height: 16 },
    { id: 4,  name: '', type: 'fries',     x: 208, y: surface - 24, width: 16, height: 16 },
    { id: 5,  name: '', type: 'fries',     x: 240, y: surface - 24, width: 16, height: 16 },
    { id: 6,  name: '', type: 'pao',       x: 248, y: (MAP_H - 8) * TILE,  width: 16, height: 16 },
    { id: 7,  name: '', type: 'alface',    x: 296, y: (MAP_H - 8) * TILE,  width: 16, height: 16 },
    { id: 8,  name: '', type: 'tomate',    x: 480, y: (MAP_H - 12) * TILE, width: 16, height: 16 },
    { id: 9,  name: '', type: 'molho',     x: 512, y: (MAP_H - 12) * TILE, width: 16, height: 16 },
    { id: 10, name: '', type: 'bacon',     x: 656, y: surface - 24, width: 16, height: 16 },
    { id: 11, name: '', type: 'hamburger', x: 688, y: surface - 24, width: 16, height: 16 },
    { id: 12, name: '', type: 'mushroom',  x: 120, y: surface - 24, width: 16, height: 16 },
    { id: 13, name: '', type: 'potato_raw', x: 384, y: surface - 24, width: 16, height: 16 },
    { id: 14, name: '', type: 'star',      x: 600, y: surface - 24, width: 16, height: 16 },
    { id: 15, name: '', type: 'picles',    x: 340, y: surface - 16, width: 16, height: 16 },
    { id: 16, name: '', type: 'cebola',    x: 540, y: surface - 16, width: 16, height: 16 },
    { id: 17, name: '', type: 'mosca',     x: 440, y: surface - 96, width: 16, height: 16 },
  ];

  return {
    width: MAP_W,
    height: MAP_H,
    tilewidth: TILE,
    tileheight: TILE,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    infinite: false,
    tilesets: [
      {
        firstgid: 1,
        name: tilesetName,
        image: `../tilesets/${tilesetName}.png`,
        imagewidth: 64,
        imageheight: 64,
        tilewidth: TILE,
        tileheight: TILE,
        tilecount: 16,
        columns: 4,
        margin: 0,
        spacing: 0,
        tiles: [
          { id: 0, properties: [{ name: 'collides', type: 'bool', value: true }] },
        ],
      },
    ],
    layers: [
      {
        name: 'Ground',
        type: 'tilelayer',
        width: MAP_W,
        height: MAP_H,
        x: 0,
        y: 0,
        opacity: 1,
        visible: true,
        data: makeTilemapData(),
        properties: [],
      },
      {
        name: 'Objects',
        type: 'objectgroup',
        objects,
      },
    ],
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

console.log('\n=== Brothers Burger - Placeholder Asset Generator ===\n');

const dirs = [
  path.join(PUBLIC, 'assets', 'sprites'),
  path.join(PUBLIC, 'assets', 'tilesets'),
  path.join(PUBLIC, 'assets', 'tilemaps'),
  path.join(PUBLIC, 'assets', 'audio'),
  path.join(PUBLIC, 'assets', 'audio', 'sfx'),
];
dirs.forEach(d => fs.mkdirSync(d, { recursive: true }));
console.log('Directories ready.\n');

// ---- Sprites / Spritesheets -----------------------------------------------
console.log('Generating sprites...');

writeFile(path.join(PUBLIC, 'assets', 'sprites', 'ui.png'), makePNG(64, 64, 255, 210, 40));

// Characters need 12 frames (0-11): small uses 0-7, big uses 8-11.
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'char1.png'), makeSheetPNG(16, 24, 12, [60, 200, 90]));
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'char2.png'), makeSheetPNG(16, 24, 12, [80, 130, 230]));

// Enemies: 9 frames (0-8).
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'enemies.png'), makeSheetPNG(16, 16, 9, [220, 70, 70]));

// Bosses: 9 frames (0-8) at 32x32.
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'bosses.png'), makeSheetPNG(32, 32, 9, [170, 40, 40]));

// Power-ups: 3 frames (mushroom, potato_raw, star).
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'powerups.png'), makeSheetPNG(16, 16, 3, [255, 150, 20]));

// Collectibles: 7 frames (6 ingredients + fries).
writeFile(path.join(PUBLIC, 'assets', 'sprites', 'collectibles.png'), makeSheetPNG(16, 16, 7, [255, 220, 40]));

// ---- Tileset images -------------------------------------------------------
console.log('\nGenerating tileset images...');
const tilesetColors = {
  cozinha:     [200, 180, 150],
  rua:         [120, 120, 130],
  mercado:     [150, 190, 160],
  restaurante: [170, 130, 110],
};
Object.entries(tilesetColors).forEach(([name, rgb]) => {
  writeFile(path.join(PUBLIC, 'assets', 'tilesets', `${name}.png`), makePNG(64, 64, rgb[0], rgb[1], rgb[2]));
});

// ---- Tilemaps (embedded tilesets) -----------------------------------------
console.log('\nGenerating tilemaps...');
const phaseTilesets = ['cozinha', 'rua', 'mercado', 'restaurante'];
['fase1', 'fase2', 'fase3', 'fase4'].forEach((name, i) => {
  writeFile(
    path.join(PUBLIC, 'assets', 'tilemaps', `${name}.json`),
    JSON.stringify(makeTilemap(phaseTilesets[i]), null, 2),
  );
});

// ---- Audio (valid silent WAV) ---------------------------------------------
console.log('\nGenerating audio...');
['fase1', 'fase2', 'fase3', 'fase4', 'boss'].forEach(name => {
  writeFile(path.join(PUBLIC, 'assets', 'audio', `${name}.wav`), makeSilentWav(400));
});
['jump', 'collect', 'powerup', 'damage', 'defeat'].forEach(name => {
  writeFile(path.join(PUBLIC, 'assets', 'audio', 'sfx', `${name}.wav`), makeSilentWav(120));
});

console.log('\n=== Done! All placeholder assets generated. ===\n');
