#!/usr/bin/env python3
# 公式ブランド画像(assets/brand/app-icon-source.png)からアプリアイコンを生成する。
# - 角丸バッジの外側(白背景・影)を解析的に透過化(角丸マスクは4xスーパーサンプリング)
# - LANCZOS で各サイズへ縮小(画質を落とさないダウンスケール)
# 依存: Pillow(pip install pillow)。生成物はコミットするためCIでは実行不要。
# 使い方: python3 scripts/generate-icon-from-source.py

from PIL import Image, ImageDraw
import os

SRC = os.path.join(os.path.dirname(__file__), "..", "assets", "brand", "app-icon-source.png")
OUT = os.path.join(os.path.dirname(__file__), "..", "apps", "desktop", "src-tauri", "icons")

img = Image.open(SRC).convert("RGBA")
w, h = img.size
px = img.load()

# 1) 黒バッジの外接矩形を検出(輝度が暗いピクセル)
def is_dark(p):
    r, g, b, a = p
    return a > 128 and (r + g + b) / 3 < 80

xs, ys = [], []
step = 2  # 高速化のため2px刻み
for y in range(0, h, step):
    for x in range(0, w, step):
        if is_dark(px[x, y]):
            xs.append(x)
            ys.append(y)
left, right, top, bottom = min(xs), max(xs), min(ys), max(ys)

# 2) 角丸半径を推定: バッジ上端から、左端まで黒が届く最初の行までの距離
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

# 3) バッジ部分を正方形で切り出し
size = max(right - left, bottom - top) + 1
crop = img.crop((left, top, left + size, top + size))

# 4) 角丸マスク(4xスーパーサンプリングでアンチエイリアス)
ss = 4
mask = Image.new("L", (size * ss, size * ss), 0)
d = ImageDraw.Draw(mask)
d.rounded_rectangle([0, 0, size * ss - 1, size * ss - 1], radius=radius * ss, fill=255)
mask = mask.resize((size, size), Image.LANCZOS)
crop.putalpha(mask)

# 5) 各サイズへ LANCZOS 縮小して出力
targets = [("32x32.png", 32), ("128x128.png", 128), ("128x128@2x.png", 256), ("icon.png", 512)]
for name, target in targets:
    crop.resize((target, target), Image.LANCZOS).save(os.path.join(OUT, name))
    print("wrote", name)

# 6) ICO(複数サイズ埋め込み)
crop.resize((256, 256), Image.LANCZOS).save(
    os.path.join(OUT, "icon.ico"), sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)]
)
print("wrote icon.ico / badge bbox:", (left, top, right, bottom), "radius:", radius)
