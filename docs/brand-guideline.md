# Musasabi ブランドガイドライン(アプリアイコン)

対応 Issue: **AV-ICON-001**(Musasabi AI アプリアイコン最終デザイン反映)

## 正式アイコン

**黒背景 × 白塗りムササビ・シルエット**を Musasabi AI / Musasabi OS の正式アプリ
アイコンとする。

- 背景: 黒(角丸スクエア)
- モチーフ: 右上方向へ滑空するムササビ(白塗りシルエット)
- テキスト: なし(`AI`・日本語ロゴ・英字いずれも入れない)
- スタイル: ミニマル・モノクロ・フラット・先進感
- 顔パーツ: 目のみ最小限

## アセット一覧(`assets/brand/`)

| ファイル | 用途 |
| --- | --- |
| `app-icon-source.png` | 元画像(1254×1254・生成元マスター) |
| `musasabi-icon-master.png` | 透過処理済みマスター(1024×1024) |
| `musasabi-icon-1024.png` 〜 `-32.png` | 各サイズ書き出し(1024/512/256/128/64/32) |
| `musasabi-icon.ico` | Windows用(16〜256pxを内包) |
| `musasabi-icon.svg` | 配布用ラッパ(512pxラスタをdata URIで埋め込み) |

いずれも角丸の外側は透過(白背景・影は含まない)。再生成は
`python3 scripts/generate-brand-assets.py`(依存: Pillow)。

## 使用箇所

- デスクトップアプリ(Tauri): `apps/desktop/src-tauri/icons/`(同一デザインの
  32/128/256/512px PNG + `icon.ico`)。参照は `tauri.conf.json` の `bundle.icon`
- 管理画面(サイドバー/コマンドセンターのロゴ): `apps/sales-workspace/src/assets/brand-icon.png`

## 運用ルール

- 黒背景・白塗り版を**正式版**とする(白背景版は補助用途のみ)
- アイコン内に文字・`AI` 表記を入れない
- シルエットはアイコン端に接触させず、余白(セーフエリア)を確保する
- 小サイズ(32/64px)でも識別できることを維持する
