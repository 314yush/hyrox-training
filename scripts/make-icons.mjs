import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function crc32(buf) {
  let c;
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function makeSquarePng(size, [r, g, b]) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihd = Buffer.alloc(13);
  ihd.writeUInt32BE(size, 0);
  ihd.writeUInt32BE(size, 4);
  ihd[8] = 8;
  ihd[9] = 2;
  ihd[10] = 0;
  ihd[11] = 0;
  ihd[12] = 0;
  const ihdr = chunk('IHDR', ihd);

  const row = Buffer.alloc(1 + size * 3);
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) row.copy(raw, y * row.length);
  const idat = chunk('IDAT', deflateSync(raw));

  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

mkdirSync('public', { recursive: true });
const accent = [220, 38, 38];
writeFileSync('public/icon-192.png', makeSquarePng(192, accent));
writeFileSync('public/icon-512.png', makeSquarePng(512, accent));
writeFileSync('public/apple-touch-icon.png', makeSquarePng(180, accent));
console.log('Icons written.');
