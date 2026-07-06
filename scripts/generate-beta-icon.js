// β版仮アプリアイコン(白黒ムササビ)生成スクリプト(D-20260706-003 実装指示9)。
// 依存パッケージなし(node:zlib のみ)で PNG / ICO を生成し、
// apps/desktop/src-tauri/icons/ へ書き出す。正式アイコンは後続フェーズで差し替える。
//
// 使い方: node scripts/generate-beta-icon.js

"use strict";

const zlib = require("node:zlib");
const fs = require("node:fs");
const path = require("node:path");

// ---- PNG エンコーダ(最小実装) ----

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** RGBA ピクセルバッファ(size*size*4)を PNG バイト列にする。 */
function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // 10..12: compression/filter/interlace = 0
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** PNG 1枚を埋め込んだ ICO(Vista+ 形式)を作る。 */
function encodeIco(pngBuf, size) {
  const header = Buffer.alloc(6 + 16);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // count
  header[6] = size >= 256 ? 0 : size; // width (0 = 256)
  header[7] = size >= 256 ? 0 : size; // height
  header[8] = 0; // palette
  header[9] = 0; // reserved
  header.writeUInt16LE(1, 10); // planes
  header.writeUInt16LE(32, 12); // bpp
  header.writeUInt32LE(pngBuf.length, 14);
  header.writeUInt32LE(22, 18); // offset
  return Buffer.concat([header, pngBuf]);
}

// ---- 白黒ムササビの図形定義(正規化座標 0..1) ----

function inCircle(x, y, cx, cy, r) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function inRoundRect(x, y, cx, cy, hw, hh, cr) {
  const dx = Math.max(Math.abs(x - cx) - (hw - cr), 0);
  const dy = Math.max(Math.abs(y - cy) - (hh - cr), 0);
  return dx * dx + dy * dy <= cr * cr && Math.abs(x - cx) <= hw && Math.abs(y - cy) <= hh;
}

/**
 * 1点をサンプルして [r,g,b,a] を返す。
 * 黒い円形バッジの上に、白い滑空ムササビ(飛膜=角丸四角、頭、耳、尻尾)を描く。
 */
function samplePoint(x, y) {
  if (!inCircle(x, y, 0.5, 0.5, 0.48)) {
    return [0, 0, 0, 0]; // バッジ外は透明
  }
  // 白パーツ: 飛膜(角丸四角)/頭/耳/尻尾
  const membrane = inRoundRect(x, y, 0.5, 0.55, 0.31, 0.19, 0.12);
  const head = inCircle(x, y, 0.5, 0.3, 0.13);
  const earL = inCircle(x, y, 0.415, 0.195, 0.05);
  const earR = inCircle(x, y, 0.585, 0.195, 0.05);
  const tail = inRoundRect(x, y, 0.5, 0.85, 0.045, 0.08, 0.045);
  let white = membrane || head || earL || earR || tail;
  if (white) {
    // 黒パーツ(白の上に重ねる): 目・鼻
    const eyeL = inCircle(x, y, 0.452, 0.29, 0.028);
    const eyeR = inCircle(x, y, 0.548, 0.29, 0.028);
    const nose = inCircle(x, y, 0.5, 0.345, 0.02);
    if (eyeL || eyeR || nose) {
      white = false;
    }
  }
  return white ? [255, 255, 255, 255] : [0, 0, 0, 255];
}

/** 4x4 スーパーサンプリングでアンチエイリアスしつつ描画する。 */
function render(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const ss = 4;
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const [cr, cg, cb, ca] = samplePoint(
            (px + (sx + 0.5) / ss) / size,
            (py + (sy + 0.5) / ss) / size,
          );
          r += cr * ca;
          g += cg * ca;
          b += cb * ca;
          a += ca;
        }
      }
      const n = ss * ss;
      const i = (py * size + px) * 4;
      rgba[i] = a > 0 ? Math.round(r / a) : 0;
      rgba[i + 1] = a > 0 ? Math.round(g / a) : 0;
      rgba[i + 2] = a > 0 ? Math.round(b / a) : 0;
      rgba[i + 3] = Math.round(a / n);
    }
  }
  return rgba;
}

// ---- 出力 ----

const outDir = path.join(__dirname, "..", "apps", "desktop", "src-tauri", "icons");
const targets = [
  { file: "32x32.png", size: 32 },
  { file: "128x128.png", size: 128 },
  { file: "128x128@2x.png", size: 256 },
  { file: "icon.png", size: 512 },
];
for (const t of targets) {
  const png = encodePng(t.size, render(t.size));
  fs.writeFileSync(path.join(outDir, t.file), png);
  console.log(`wrote ${t.file} (${png.length} bytes)`);
}
const png256 = encodePng(256, render(256));
fs.writeFileSync(path.join(outDir, "icon.ico"), encodeIco(png256, 256));
console.log("wrote icon.ico");
