/* Intrinsic size of a raster in public/, read at build time so <img> can carry
   width/height and reserve its box before it loads (no layout shift). Supports
   WebP (VP8, VP8L, VP8X) and PNG; anything else returns undefined. */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const PUBLIC = path.resolve(process.cwd(), 'public');
const cache = new Map<string, { width: number; height: number } | undefined>();

export function imageSize(rel: string): { width: number; height: number } | undefined {
  if (cache.has(rel)) return cache.get(rel);
  let out: { width: number; height: number } | undefined;
  try {
    const b = readFileSync(path.join(PUBLIC, rel.replace(/^\/+/, '')));
    if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = b.toString('ascii', 12, 16);
      if (chunk === 'VP8 ') out = { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
      else if (chunk === 'VP8L') { const bits = b.readUInt32LE(21); out = { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }; }
      else if (chunk === 'VP8X') out = { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    } else if (b.readUInt32BE(0) === 0x89504e47) {
      out = { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    }
  } catch { out = undefined; }
  cache.set(rel, out);
  return out;
}
