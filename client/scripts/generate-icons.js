const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create PNG buffer using pure Node.js zlib
function createPng(width, height, renderPixel) {
  // RGBA buffer: 4 bytes per pixel + 1 filter byte per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    rawData[rowStart] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelStart = rowStart + 1 + x * 4;
      const [r, g, b, a] = renderPixel(x, y, width, height);
      rawData[pixelStart] = r;
      rawData[pixelStart + 1] = g;
      rawData[pixelStart + 2] = b;
      rawData[pixelStart + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    // Calculate CRC32 for type + data
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC32 table & function
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', deflated);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Precompute CRC table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

// Rasterizer for AttendancePro Icon:
// Rounded rect with indigo->violet gradient (#4f46e5 to #7c3aed), "HR" emblem with clock accent.
function renderAppIcon(x, y, w, h, isMaskable = false) {
  // Normalize coordinates 0..1
  const nx = x / w;
  const ny = y / h;

  // Background gradient: Top-Left (79, 70, 229) to Bottom-Right (124, 58, 237)
  const grad = (nx + ny) / 2;
  const bgR = Math.round(79 + grad * (124 - 79));
  const bgG = Math.round(70 + grad * (58 - 70));
  const bgB = Math.round(229 + grad * (237 - 229));

  // Corner radius (if not maskable)
  if (!isMaskable) {
    const radius = 0.22; // 22% corner radius
    const cx = nx < radius ? radius : nx > 1 - radius ? 1 - radius : nx;
    const cy = ny < radius ? radius : ny > 1 - radius ? 1 - radius : ny;
    const dx = nx - cx;
    const dy = ny - cy;
    const distSq = dx * dx + dy * dy;
    if (distSq > radius * radius) {
      return [0, 0, 0, 0]; // Transparent outside rounded corner
    }
  }

  // Safe area for maskable icon: keep icon content within center 60%
  const scale = isMaskable ? 0.75 : 1.0;
  const cx = (nx - 0.5) / scale + 0.5;
  const cy = (ny - 0.5) / scale + 0.5;

  // Draw "HR" text and clock badge
  // Letter "H": x in [0.26, 0.44], y in [0.26, 0.64]
  let isWhite = false;

  // H Left bar: x in [0.26, 0.32], y in [0.28, 0.68]
  if (cx >= 0.26 && cx <= 0.32 && cy >= 0.28 && cy <= 0.68) isWhite = true;
  // H Right bar: x in [0.40, 0.46], y in [0.28, 0.68]
  if (cx >= 0.40 && cx <= 0.46 && cy >= 0.28 && cy <= 0.68) isWhite = true;
  // H Crossbar: x in [0.30, 0.42], y in [0.45, 0.51]
  if (cx >= 0.30 && cx <= 0.42 && cy >= 0.45 && cy <= 0.51) isWhite = true;

  // Letter "R": x in [0.54, 0.74], y in [0.28, 0.68]
  // R Left bar: x in [0.54, 0.60], y in [0.28, 0.68]
  if (cx >= 0.54 && cx <= 0.60 && cy >= 0.28 && cy <= 0.68) isWhite = true;
  // R Top loop: Top bar x in [0.58, 0.70], y in [0.28, 0.34]
  if (cx >= 0.58 && cx <= 0.70 && cy >= 0.28 && cy <= 0.34) isWhite = true;
  // R Top loop: Right vertical x in [0.68, 0.74], y in [0.32, 0.48]
  if (cx >= 0.68 && cx <= 0.74 && cy >= 0.32 && cy <= 0.48) isWhite = true;
  // R Mid crossbar: x in [0.58, 0.70], y in [0.45, 0.51]
  if (cx >= 0.58 && cx <= 0.70 && cy >= 0.45 && cy <= 0.51) isWhite = true;
  // R Diagonal leg: from (0.62, 0.49) to (0.74, 0.68)
  if (cx >= 0.62 && cx <= 0.74 && cy >= 0.49 && cy <= 0.68) {
    const expectedX = 0.62 + (cy - 0.49) * (0.12 / 0.19);
    if (Math.abs(cx - expectedX) <= 0.04) isWhite = true;
  }

  // Small Badge/Dot (Amber dot like in the app UI): Center at (0.78, 0.26)
  const dotDx = cx - 0.78;
  const dotDy = cy - 0.26;
  if (dotDx * dotDx + dotDy * dotDy <= 0.05 * 0.05) {
    return [245, 158, 11, 255]; // Amber-500
  }

  if (isWhite) {
    return [255, 255, 255, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate Icons
console.log('Generating PWA Icons...');

const sizes = [
  { name: 'icon-192x192.png', size: 192, maskable: false },
  { name: 'icon-512x512.png', size: 512, maskable: false },
  { name: 'maskable-icon-192x192.png', size: 192, maskable: true },
  { name: 'maskable-icon-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const { name, size, maskable } of sizes) {
  const buf = createPng(size, size, (x, y, w, h) => renderAppIcon(x, y, w, h, maskable));
  fs.writeFileSync(path.join(iconsDir, name), buf);
  console.log(`✓ Created ${name} (${size}x${size})`);
}

// Also create SVG version
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#brandGrad)" />
  <circle cx="399" cy="133" r="26" fill="#f59e0b" />
  <!-- Letter H -->
  <rect x="133" y="143" width="31" height="205" rx="10" fill="#ffffff" />
  <rect x="205" y="143" width="31" height="205" rx="10" fill="#ffffff" />
  <rect x="133" y="230" width="103" height="31" rx="8" fill="#ffffff" />
  <!-- Letter R -->
  <rect x="276" y="143" width="31" height="205" rx="10" fill="#ffffff" />
  <path d="M 276 143 L 348 143 C 374 143 379 169 379 194 C 379 220 374 246 348 246 L 276 246 Z" fill="none" stroke="#ffffff" stroke-width="31" stroke-linejoin="round" />
  <path d="M 317 236 L 379 348" stroke="#ffffff" stroke-width="31" stroke-linecap="round" />
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
console.log('✓ Created icon.svg');
