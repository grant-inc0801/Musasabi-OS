#!/usr/bin/env python3
# 公式ブランド画像(assets/brand/app-icon-source.png)から、AV-ICON-001 の
# 正式ブランドアセット一式を assets/brand/ へ書き出す。
# - 黒角丸バッジ×白ムササビ・シルエット(文字なし・AI表記なし)を正式版とする
# - 角丸の外側(白背景・影)を解析的に透過化(4xスーパーサンプリング)
# - LANCZOS で各サイズへ縮小し、SVG(PNG埋め込み)/ ICO も出力
# 依存: Pillow。生成物はコミットするためCIでは実行不要。
# 使い方: python3 scripts/generate-brand-assets.py

import base64
import os

from PIL import Image, ImageDraw

HERE = os.path.dirname(__file__)
SRC = os.path.join(HERE, "..", "assets", "brand", "app-icon-source.png")
OUT = os.path.join(HERE, "..", "assets", "brand")

img = Image.open(SRC).convert("RGBA")
w, h = img.size
px = img.load()


def is_dark(p):
    r, g, b, a = p
    return a > 128 and (r + g + b) / 3 < 80


# 1) 黒バッジの外接矩形を検出
xs, ys = [], []
step = 2
for y in range(0, h, step):
    for x in range(0, w, step):
        if is_dark(px[x, y]):
            xs.append(x)
            ys.append(y)
left, right, top, bottom = min(xs), max(xs), min(ys), max(ys)

# 2) 角丸半径を推定
radius = 0
for y in range(top, top + (bottom - top) // 2):
    row_left = None
    for x in range(left, right):
        if is_dark(px[x, y]):
            row_left = x
            break
    if row_left is not None and row_left <= left + 3:
        radius = y - top
        break

# 3) バッジ部分を正方形で切り出し、角丸透過マスクを適用
size = max(right - left, bottom - top) + 1
crop = img.crop((left, top, left + size, top + size))
ss = 4
mask = Image.new("L", (size * ss, size * ss), 0)
ImageDraw.Draw(mask).rounded_rectangle(
    [0, 0, size * ss - 1, size * ss - 1], radius=radius * ss, fill=255
)
crop.putalpha(mask.resize((size, size), Image.LANCZOS))

# 4) 各サイズPNGを書き出し(1024/512/256/128/64/32)
sizes = [1024, 512, 256, 128, 64, 32]
for target in sizes:
    out = crop.resize((target, target), Image.LANCZOS)
    out.save(os.path.join(OUT, f"musasabi-icon-{target}.png"))
    print("wrote", f"musasabi-icon-{target}.png")

# マスター(1024)
crop.resize((1024, 1024), Image.LANCZOS).save(os.path.join(OUT, "musasabi-icon-master.png"))

# 5) ICO(複数サイズ埋め込み)
crop.resize((256, 256), Image.LANCZOS).save(
    os.path.join(OUT, "musasabi-icon.ico"),
    sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)],
)
print("wrote musasabi-icon.ico")

# 6) SVG(512pxラスタをdata URIで埋め込んだ配布用ラッパ。任意ツールで表示可能)
png512 = os.path.join(OUT, "musasabi-icon-512.png")
with open(png512, "rb") as f:
    b64 = base64.b64encode(f.read()).decode("ascii")
svg = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" '
    'viewBox="0 0 512 512" role="img" aria-label="Musasabi icon">\n'
    f'  <image width="512" height="512" href="data:image/png;base64,{b64}"/>\n'
    "</svg>\n"
)
with open(os.path.join(OUT, "musasabi-icon.svg"), "w", encoding="utf-8") as f:
    f.write(svg)
print("wrote musasabi-icon.svg / badge bbox:", (left, top, right, bottom), "radius:", radius)
