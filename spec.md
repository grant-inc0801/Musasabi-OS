```markdown
# 技術指示書: AV-004 Musasabi Live2D Motion System

## 概要

Live2D Motion Systemの開発は、Musasabiアバターを静的な存在からユーザーのデスクトップ上で生きているような存在へと変換します。このシステムは滑らかな体の動き、目の追従、グライドアニメーション、表現力豊かなインタラクションを提供します。ユーザーが相互作用していない時でも、アバターが生き生きとしているように感じられることを目指します。

## ビジョン

1. Musasabi AI
2. Emotion Engine
3. Live2D Motion Engine
4. Desktop Avatar
5. Natural Presence

## 必要モジュール

```
apps/desktop/src/avatar/live2d/
  - Live2DController.ts
  - MotionController.ts
  - MotionScheduler.ts
  - EyeTracking.ts
  - HeadTracking.ts
  - TailPhysics.ts
  - WingController.ts
  - IdleMotion.ts
  - ClickReaction.ts
```

## モーション状態のサポート

- Idle
- Blink
- Breathing
- Ear Twitch
- Tail Swing
- Head Tilt
- Look Around
- Stretch
- Yawn
- Thinking
- Happy
- Working
- Learning
- Sleeping
- Celebrating
- Calling

## デスクトップ上の動作

無作為に以下を実行します:

- 別のコーナーにグライド
- タスクバーの端に止まる
- カーソルの方向を見る
- ユーザーに向かって手を振る
- 翼をストレッチ
- 頭をかく
- 通知バブルを検査

**ランダム間隔:** 15–90秒

## カーソルとのインタラクション

- マウス近接時:
  - 目でカーソルを追い、頭を傾ける
- マウスクリック時:
  - リアクションを取り、笑顔を見せ、手を振る
- ドラッグ時:
  - 翼を羽ばたたき、自然な体の物理を維持する

## 物理

軽量の手続き型物理を導入し、以下をサポートします:

- 尾の揺れ
- 翼の揺れ
- 耳の動き
- 体のバウンス

**注意:** 重い物理エンジンの使用は禁止します。

## モーションキュー

- キューされたモーションのサポート
- 割り込み可能なモーション
- 優先度付きモーション

優先度:
1. Emergency
2. Calling
3. Celebrating
4. Working
5. Learning
6. Idle

## パフォーマンス目標

- 60 FPS
- CPU < 3%
- メモリ < 150MB

## 設定

以下を許可します:

- アニメーション品質
- アイドル頻度
- カーソルトラッキング
- モーション速度
- 動きを軽減するモード

## 開発者モード

表示項目:

- 現在のモーション
- モーションキュー
- FPS
- 物理状態
- 感情
- Live2Dの状態

## テスト

以下を実装します:

- モーションキュー
- アイドルスケジューラ
- カーソルトラッキング
- クリックリアクション
- ドラッグインタラクション
- 物理の安定性
- 動き軽減モード

## ドキュメンテーション

ドキュメント作成:

- `docs/LIVE2D_AVATAR.md`

ドキュメント更新:

- `README`
- `CHANGELOG`
- `docs/AVATAR_ENGINE.md`

## 制限事項

以下の実装禁止:

- 音声
- リップシンク
- 3D
- VRM
- 音声認識
- AutoCall統合

これらは今後のスプリントで対応します。

## 受け入れ基準

- Live2D モーションシステムが正常に動作する
- カーソルトラッキングが動作する
- アイドルモーションが自然に再生される
- モーションキューが機能する
- 物理が安定している
- パフォーマンス目標を達成
- テストが合格
- ドキュメンテーションが更新されている

## 納品物

レポート:

- 変更されたファイル
- テスト結果
- モーションのスクリーンショット/GIF
- パフォーマンスメトリクス
- 推奨コミット

**推奨コミットメッセージ:**

```
feat(avatar): implement Live2D motion system
```
```
