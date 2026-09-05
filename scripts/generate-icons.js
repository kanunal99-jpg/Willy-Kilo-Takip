import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Generates a valid uncompressed/deflated RGBA PNG
function createPng(width, height, drawPixel) {
  // PNG signature
  const signature = Buffer.from([139, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: 0
  ihdrData[11] = 0; // Filter: 0
  ihdrData[12] = 0; // Interlace: 0

  const ihdr = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressedData);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[n] = c;
}

function drawWilly(x, y, w, h) {
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const r2 = nx * nx + ny * ny;

  // Background dark rounded box
  const absX = Math.abs(nx);
  const absY = Math.abs(ny);
  if (absX > 0.95 || absY > 0.95) return [15, 23, 42, 255]; // outer corner

  // Ring around Willy
  const ringDist = Math.abs(Math.sqrt(r2) - 0.72);
  if (ringDist < 0.08) {
    if (ny < 0.3) {
      return [16, 185, 129, 255]; // emerald ring
    } else {
      return [6, 182, 212, 255]; // cyan
    }
  }

  // Willy Face (oval in center)
  const faceX = nx / 0.5;
  const faceY = (ny - 0.08) / 0.45;
  const faceR = faceX * faceX + faceY * faceY;

  // Horns
  const hornL = Math.hypot(nx + 0.25, ny + 0.35);
  const hornR = Math.hypot(nx - 0.25, ny + 0.35);
  if (hornL < 0.15 || hornR < 0.15) {
    return [6, 182, 212, 255];
  }

  if (faceR < 1.0) {
    // Eyes
    const eyeL = Math.hypot(nx + 0.18, ny + 0.02);
    const eyeR = Math.hypot(nx - 0.18, ny + 0.02);
    if (eyeL < 0.05 || eyeR < 0.05) {
      // pupil highlight
      if (Math.hypot(nx + 0.16, ny + 0.005) < 0.02 || Math.hypot(nx - 0.16, ny + 0.005) < 0.02) {
        return [255, 255, 255, 255];
      }
      return [15, 23, 42, 255];
    }
    // Cheeks
    if (Math.hypot(nx + 0.26, ny - 0.12) < 0.06 || Math.hypot(nx - 0.26, ny - 0.12) < 0.06) {
      return [244, 63, 94, 255]; // rose pink cheek
    }
    // Smile
    const smileDist = Math.hypot(nx, ny - 0.12);
    if (smileDist < 0.12 && ny > 0.12) {
      return [15, 23, 42, 255];
    }

    // Body gradient emerald to cyan
    return [
      Math.floor(16 + (nx + 1) * 10),
      Math.floor(185 - ny * 30),
      Math.floor(160 + ny * 60),
      255
    ];
  }

  // Flame badge top
  const flameDist = Math.hypot(nx, ny + 0.55);
  if (flameDist < 0.12) {
    return [249, 115, 22, 255]; // orange flame
  }

  // Background deep slate
  return [15, 23, 42, 255];
}

const pub = path.resolve('public');
fs.writeFileSync(path.join(pub, 'pwa-192x192.png'), createPng(192, 192, drawWilly));
fs.writeFileSync(path.join(pub, 'pwa-512x512.png'), createPng(512, 512, drawWilly));
fs.writeFileSync(path.join(pub, 'apple-touch-icon.png'), createPng(180, 180, drawWilly));
console.log('PNG icons created successfully!');
