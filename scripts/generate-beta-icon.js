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

// ---- 白黒ムササビの図形定義(正規化座標 0..1、ブランド画像準拠) ----
// 黒の角丸四角の上に、右上へ滑空する白いムササビのシルエット
// (頭+耳+前脚、飛膜の翼、稲妻形の尻尾)を描く。

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

// 滑空ムササビのシルエット(時計回りの制御点)。右上へ滑空:
// 鼻先→耳→背中→飛膜(翼)→稲妻形の尻尾→腹→胸→前脚→顎→鼻先。
const SQUIRREL = [
  [0.82, 0.20], // 0 鼻先
  [0.76, 0.175], // 1 額
  [0.71, 0.115], // 2 耳先
  [0.665, 0.19], // 3 耳の付け根(くぼみ)
  [0.58, 0.245], // 4 首の背
  [0.42, 0.315], // 5 背中〜飛膜上縁
  [0.20, 0.355], // 6 翼端(左)
  [0.315, 0.43], // 7 飛膜の谷
  [0.405, 0.475], // 8 後脚の膨らみ
  [0.345, 0.56], // 9 稲妻の入り
  [0.165, 0.60], // 10 稲妻スパイク(左)
  [0.30, 0.645], // 11 稲妻の谷
  [0.115, 0.775], // 12 尻尾の先(左下)
  [0.37, 0.625], // 13 尻尾下縁
  [0.50, 0.52], // 14 腹
  [0.635, 0.415], // 15 胸
  [0.755, 0.375], // 16 前脚(上腕)
  [0.875, 0.335], // 17 前脚の先
  [0.76, 0.30], // 18 顎下(前脚との谷)
  [0.795, 0.245], // 19 口元
];

// 角として残す制御点(鼻先・耳先・翼端・稲妻のスパイク・前脚の先など)。
// それ以外の点は Catmull-Rom スプラインで滑らかに補間する(精度改善FB対応)。
const SHARP = new Set([0, 2, 3, 6, 10, 11, 12, 17, 18]);

/**
 * 閉じた制御点列を Catmull-Rom で細分化した滑らかな多角形にする。
 * SHARP に含まれる点は接線をクランプして角を保つ。
 */
function smoothClosedPolygon(points, subdivisions) {
  const n = points.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    // 角の点では接線を区間内へクランプして尖りを保持する
    const p0 = SHARP.has(i) ? p1 : points[(i - 1 + n) % n];
    const p3 = SHARP.has((i + 1) % n) ? p2 : points[(i + 2) % n];
    for (let s = 0; s < subdivisions; s++) {
      const t = s / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([
        0.5 *
          (2 * p1[0] +
            (-p0[0] + p2[0]) * t +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 *
          (2 * p1[1] +
            (-p0[1] + p2[1]) * t +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  return out;
}

const SQUIRREL_SMOOTH = smoothClosedPolygon(SQUIRREL, 16);

function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * 1点をサンプルして [r,g,b,a] を返す。
 * 黒の角丸四角バッジの上に白いムササビ、目は黒で抜く。
 */
function samplePoint(x, y) {
  if (!inRoundRect(x, y, 0.5, 0.5, 0.47, 0.47, 0.13)) {
    return [0, 0, 0, 0]; // バッジ外は透明
  }
  let white = pointInPolygon(x, y, SQUIRREL_SMOOTH);
  if (white && inCircle(x, y, 0.735, 0.215, 0.022)) {
    white = false; // 目
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
