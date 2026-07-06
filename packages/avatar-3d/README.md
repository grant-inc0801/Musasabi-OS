# @musasabi/avatar-3d

MUSAアバターの正式基盤(three.js + `@pixiv/three-vrm`、VRoid Studio 製 VRM 対応)。
Phase β-002 優先順位②(docs/ARCHITECTURE.md 第4.4章)。

## 実装済み(②-1: レンダラー非依存ロジック層)

WebGL/three.js に依存しない、フレームワーク非依存のロジックのみを実装・ユニット
テスト済み。描画技術から切り離すことで、この開発環境(WebGL 実描画は不可)でも
検証できるようにしている。

- `types.ts` — `VrmExpressionPreset`(VRM 1.0 標準表情の感情サブセット)、
  `IdleMotionFrame`、`VrmRenderer` インターフェース(描画の抽象)
- `expressionMapping.ts` — `avatar-2d` の `AvatarState` → VRM 表情プリセットの
  決定論的マッピング(2D/3D アバターで同じ状態機械を共有)
- `idleMotion.ts` — 呼吸(sin波)・まばたきを時刻から決定論的に算出する待機モーション
- `AvatarManager.ts` — VRM ロード状態・感情表情・待機モーションを統合管理
  (`VrmRenderer` を注入。描画技術に非依存)

## 未実装(②-2: 実レンダラー、WebGL 依存で Pending)

- `three.js` + `@pixiv/three-vrm` による `VrmRenderer` 実装(VRM 描画・表情反映・
  ボーン制御)
- Tauri のアバターウィンドウ(`apps/sales-workspace/avatar.html`)を 2D 絵文字から
  VRM 表示へ置き換え
- 実 VRM ファイル(VRoid Studio 製)の読み込み・描画確認は Windows実機/ブラウザで検証

詳細は [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) 第4.4章を参照。
