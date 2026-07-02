```markdown
# 技術指示書: AV-005 Musasabi 3D Avatar Foundation (VRM)

## 目的

VRM標準を使用してMusasabiアバターの3D基盤を実装します。このスプリントでは、既存のアバターエンジン、感情エンジン、Live2Dモーションシステムとの互換性を維持しつつ、完全にインタラクティブな3Dアバターを初めて導入します。このアバターはMusasabi OSの恒久的な顔となります。

## ビジョン

- Musasabi AI
- Avatar Engine
- Emotion Engine
- VRM Runtime
- 3D Musasabi
- Desktop Overlay

## 技術スタック

### Desktop

- Tauri
- React
- TypeScript

### 3D

- Three.js
- @pixiv/three-vrm

## 必須モジュール

`apps/desktop/src/avatar/vrm/` 以下のモジュールを実装します。

- `VRMAvatar.ts`
- `VRMLoader.ts`
- `VRMAnimationController.ts`
- `VRMEmotionController.ts`
- `VRMCameraController.ts`
- `VRMPhysicsController.ts`
- `VRMStateMachine.ts`
- `index.ts`

## アセット構造

アセットは以下のディレクトリに配置されます。

`apps/desktop/assets/avatar/musasabi/`

- `vrm/`
  - `musasabi.vrm`
- `motions/`
  - `idle.fbx`
  - `happy.fbx`
  - `thinking.fbx`
  - `learning.fbx`
  - `working.fbx`
  - `sleeping.fbx`
  - `celebrating.fbx`
  - `calling.fbx`
- `textures/`
- `icons/`

## 初期アバターの外観

- 飛び鼠（ムササビ）
- 3頭身のかわいい比率
- 大きく表現力豊かな目
- 柔らかく丸い体
- 大きなグライディング用膜
- ふわふわの尾
- 中庸なビジネススタイルの外観
- タヌキのアセットは使用しない

## モーションコントローラー

以下のモーションをサポート:

- Idle
- Walk
- Glide
- Wave
- Thinking
- Typing
- Reading
- Sleeping
- Celebrating
- Calling
- Stretch

## カメラ

以下のカメラ機能をサポート:

- Front
- 45°
- Side
- Zoom
- Auto Focus

## 感情統合

Emotion Engineからのイベントを受け取り、以下の感情をサポート:

- Idle
- Happy
- Thinking
- Learning
- Working
- Calling
- Sleeping
- Celebrating
- Warning
- Error

## アニメーションブレンディング

以下をサポート：

- クロスフェード
- レイヤー化されたアニメーション
- 中断可能なアニメーション
- 優先アニメーション

## パフォーマンス目標

- ターゲット: 60 FPS
- CPU使用率: <5%
- メモリ使用量: <250MB

## 設定

以下の設定項目を許可:

- アバタースケール
- アニメーション速度
- シャドウ
- アウトライン
- 品質
- モーションの有効化
- 物理演算の有効化

## 開発者モード

以下を表示:

- 現在のアニメーション
- 現在の感情
- FPS
- トライアングル数
- ドローコール数
- メモリ使用量

## テスト

以下のテストを実施:

- VRMのロード
- アニメーションの再生
- アニメーションブレンディング
- 感情の同期
- カメラコントロール
- 物理演算の有効化/無効化
- パフォーマンスベンチマーク

## ドキュメント

以下を作成・更新:

- `docs/VRM_AVATAR.md`
- `README`
- `CHANGELOG`
- `docs/AVATAR_ENGINE.md`

## 制約

以下の機能は実装しない:

- 音声認識
- 音声合成
- リップシンク
- AI対話
- デスクトップ自動化

## 受け入れ基準

- VRMアバターが正常にロードされる
- アバターが正しくレンダリングされる
- アニメーションがスムーズに再生される
- 感情エンジンがアバターを更新する
- カメラコントロールが機能する
- パフォーマンス目標を達成する
- テストが通過する
- ドキュメントが更新される

## 納品物

- 変更されたファイルのリスト
- テスト結果
- パフォーマンスベンチマーク
- スクリーンショット / GIF
- 推奨コミットメッセージ

推奨コミットメッセージ:

```
feat(avatar): implement VRM-based 3D Musasabi avatar foundation
```
```
