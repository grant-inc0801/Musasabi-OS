# 挿絵 生成AI用プロンプト集

> 本ファイルは、各挿絵を **画像生成AI（NijiJourney / DALL·E / Stable Diffusion 等）** で
> 作るための、そのまま貼って使えるプロンプト集です。ライトノベルの口絵/挿絵を想定。
> 収録中の `*.svg` は「構図の下絵・仮絵」で、これを AI 生成イラストに差し替える運用を想定しています。
>
> **キャラの見た目を巻全体で統一するコツ**：同じ「キャラクター設定ブロック」を毎回貼る／
> 同一 seed を使う／NijiJourney や SD なら過去の生成画像を `--cref`・reference image として渡す。

---

## 共通スタイル（毎回、各プロンプトの先頭に付ける）

```
Japanese light novel illustration, anime style, clean lineart, soft cel shading,
cinematic lighting, detailed background, high quality, official ranobe key visual,
emotional atmosphere. Theme motif: "ash and stars" (灰と星).
```

**ネガティブ（SD系）**:
```
lowres, bad anatomy, extra fingers, deformed hands, text artifacts, watermark,
signature, jpeg artifacts, blurry, oversaturated, 3d render, photorealistic
```

**推奨アスペクト比**: 口絵は 3:2 または 16:9（`--ar 3:2`）。表紙は 2:3 縦。

---

## キャラクター設定ブロック（該当キャラを登場させる時に貼る）

- **灰谷 湊（主人公）**: `16yo boy, messy dark hair, sharp tired eyes, plain worn school uniform (poor student), determined expression, ash-grey color accent`
- **白鷺 令子（ヒロイン）**: `16yo girl, long silver-white hair, cold beautiful face, blue eyes, immaculate uniform with a small gold badge, elegant posture`
- **番場 剛**: `tall broad-shouldered boy ~190cm, short cropped hair, friendly dog-like face, tanned, gentle giant`
- **桃園 ひな**: `petite energetic girl, short bob or twin-tails, always holding a worn laptop, snack in hand, mischievous cat-like eyes`
- **財前 康介**: `handsome tidy boy, charming smile with a hidden edge, neat uniform, faintly untrustworthy vibe`
- **柏木先生**: `sleepy-eyed man in his 30s, loosened necktie, lazy but sharp expression`
- **舞台**: `elite business academy on a hill, white marble buildings, glass "management practice" tower`

---

## 第1巻の挿絵

### 00_序章「シャッターの下りた街」
```
[共通スタイル] A lone teenage boy (see 灰谷湊) seen from behind, standing before a
closed rusty shop shutter in a deserted old shopping street at dusk. Faded signboard
reading a small dry-goods store. Warm red sunset light catches the grey shutter.
Melancholy, nostalgic, quiet. Wide shot. --ar 3:2
```

### 01_第一章「丘の上の星霜経営学園」
```
[共通スタイル] Low-angle view up a hill in April, an avenue of full-bloom cherry
blossoms leading to a grand white academy (see 舞台). A lone poor student (see 灰谷湊)
with a worn boston bag at the bottom of the slope, looking up. Petals in the wind.
Bright, hopeful yet daunting. --ar 3:2
```

### 02_第二章「資本効率一位（2,400%）の歓喜」
```
[共通スタイル] Interior of a grand school auditorium. A huge glowing results board
displays "ROI ランキング 第1位 / 2,400%". Three students cheering in front of it:
a tall broad boy (see 番場剛) with arms up, the protagonist (see 灰谷湊) with a fist
raised, a petite girl (see 桃園ひな) hugging a laptop. Blue screen glow, triumphant.
--ar 3:2
```

### 02b_幕間「夏の商店街 ―令子との買い物勝負―」
```
[共通スタイル] Summer dusk in an old covered shopping arcade (shotengai), cicada
season, warm lantern light. A disguised elegant girl (see 白鷺令子) in casual dress
+ wide-brim hat, holding a tapioca drink, walking beside the protagonist (see 灰谷湊)
who carries a paper grocery bag with vegetables. A closed shutter shop in the
background (subtle foreshadowing). Warm, gently romantic, slice-of-life. --ar 3:2
```

### 03_終章「夏の終わりに ―忍び寄る影―」
```
[共通スタイル] Rooftop at the end of summer, early evening, first stars appearing,
distant town lights below the hill. The protagonist (see 灰谷湊) leans on the railing
looking at the town, back to us. Behind him, in a lit stairwell doorway, a handsome
boy (see 財前康介) stands with one hand extended (offering an alliance), a long shadow
stretching across the rooftop. Ominous but wistful. --ar 3:2
```

---

## 第2巻（`vol2/`）の挿絵

### 04「崩れる資産と裏切りの値札」
```
[共通スタイル] Dark red-toned scene. A crashing asset graph line breaking downward,
a swinging price tag reading "売却済 ×3.0", and a boy (see 財前康介) walking away into
darkness, back turned, long shadow. Betrayal, cold, despair. --ar 3:2
```

### 05「灰の中の火種」
```
[共通スタイル] Close-up of two cupped hands in darkness, ash flecks drifting, holding
a single glowing ember, sparks rising. Symbol of hope from rock bottom. Warm ember
glow against black. --ar 3:2
```

### 05b_幕間「硝子の檻 ―白鷺令子―」
```
[共通スタイル] Split emotional composition. Left: warm memory of a tiny western
confectionery ("スミレ"), a happy little girl silhouette reaching for a glowing
madeleine, aroma sparkles. Right: present-day girl (see 白鷺令子) standing behind a
pane of glass inside a birdcage motif, cold blue light, cradling one small warm light.
Loneliness, longing. --ar 3:2
```

### 06「マルシェの下、令子との和解の握手」
```
[共通スタイル] Warm sunlit outdoor market ("星霜マルシェ") with bunting and a banner.
The protagonist (see 灰谷湊) and the heroine (see 白鷺令子) shaking hands, backlit,
a small sparkle at their clasped hands. Rivals reconciling. Hopeful, warm. --ar 3:2
```

### 07_終章「灰よ、星を掴め」
```
[共通スタイル] Starry night on a hill, a bright star and crescent moon. Three student
silhouettes on the hilltop looking up; the center one (see 灰谷湊) reaches a hand toward
the star. Uplifting, cathartic finale. --ar 3:2
```

---

*生成後は各章 Markdown の画像パス（例 `illustrations/02_roi.svg`）を、生成した画像ファイル
（例 `illustrations/02_roi.png`）に差し替えてください。*
