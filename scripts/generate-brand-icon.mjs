import { writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'brand');
const outPath = resolve(outDir, 'icon.png');

const size = 128;
const pixels = Buffer.alloc(size * size * 4);

for (let y = 0; y < size; y += 1) {
  for (let x = 0; x < size; x += 1) {
    const idx = (y * size + x) * 4;
    const cx = x - size / 2;
    const cy = y - size / 2;
    const radius = size * 0.42;
    const inCircle = cx * cx + cy * cy <= radius * radius;
    const trackLeft = -size * 0.22;
    const trackRight = size * 0.22;
    const trackTop = size * 0.08;
    const trackBottom = -size * 0.08;
    const inTrack =
      cx >= trackLeft &&
      cx <= trackRight &&
      cy <= trackTop &&
      cy >= trackBottom &&
      Math.abs(cy) <= size * 0.08;

    const knobX = size * 0.12;
    const knobRadius = size * 0.11;
    const inKnob = (cx - knobX) * (cx - knobX) + cy * cy <= knobRadius * knobRadius;

    if (inCircle) {
      pixels[idx] = 3;
      pixels[idx + 1] = 169;
      pixels[idx + 2] = 244;
      pixels[idx + 3] = inTrack || inKnob ? 255 : 32;
    }

    if (inTrack) {
      pixels[idx] = 255;
      pixels[idx + 1] = 255;
      pixels[idx + 2] = 255;
      pixels[idx + 3] = 220;
    }

    if (inKnob) {
      pixels[idx] = 255;
      pixels[idx + 1] = 255;
      pixels[idx + 2] = 255;
      pixels[idx + 3] = 255;
    }
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(size, 0);
ihdr.writeUInt32BE(size, 4);
ihdr[8] = 8;
ihdr[9] = 6;
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const rowData = Buffer.alloc((size * 4 + 1) * size);
for (let y = 0; y < size; y += 1) {
  const rowStart = y * (size * 4 + 1);
  rowData[rowStart] = 0;
  pixels.copy(rowData, rowStart + 1, y * size * 4, (y + 1) * size * 4);
}

const idat = deflateSync(rowData);
const png = Buffer.concat([
  signature,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, png);
console.info(`Wrote ${outPath} (${png.length} bytes, sha256=${createHash('sha256').update(png).digest('hex').slice(0, 12)}…)`);
