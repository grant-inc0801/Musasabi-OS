```markdown
# 技術指示書: S5-008 MUSA Desktop Avatar MVP

## 概要
このドキュメントは、Musasabi AIのデスクトップアバターを実装するための詳細な技術指示書です。アバターはMusasabi OSの顔となり、ユーザーのデスクトップに常に表示されます。本プロジェクトはMVP（Minimum Viable Product）バージョンの開発を目的としています。

## ビジョン
1. デスクトップ
2. MUSAアバター
3. Sales Workspace
4. AI PM
5. Sales Brain
6. 学習モード

## 必要なモジュール
プロジェクトのソースコードは以下のディレクトリに配置されます:
- `apps/desktop/src/avatar/`

### モジュールファイル
- `AvatarManager.ts`
- `AvatarState.ts`
- `AvatarAnimation.ts`
- `AvatarController.ts`
- `AvatarSpeechBubble.ts`
- `AvatarNotification.ts`
- `AvatarSettings.ts`

## デスクトップ動作

### 位置
- デフォルト: 右下隅
- 常にトップ表示
- ドラッグ可能
- 再起動後に位置を記憶

## アバターステート
サポートされるステート:
- Idle
- Thinking
- Learning
- Working
- Happy
- Warning
- Sleeping

各ステートに専用のアニメーションが必要です。

## 表情
サポートされる表情:
- Neutral
- Smile
- Happy
- Thinking
- Confused
- Surprised
- Sad
- Excited

## モーション
実装するモーション:
- blink
- breathing
- idle sway
- small bounce
- wave
- point
- celebrate

アニメーションは自然にループする必要があります。

## スピーチバブル
表示内容:
- コーチングメッセージ
- スプリント通知
- 学習完了
- タスク完了
- 約束取得
- 警告メッセージ

バブルは自動で隠れます。

## 通知
アバターの反応トリガー:
- スプリント開始
- スプリント完了
- コール開始
- コール終了
- 新しいコーチング情報
- 学習完了
- GitHub issue完了

## モード
表示されるモード:
- Learning Mode
- Support Mode
- AutoCall Mode (Disabled)
- Analysis Mode

モードごとに色コードを設定します。

## 設定
サポートする設定:
- アバターサイズ
- 透明度
- アニメーション速度
- スピーチバブルのオン/オフ
- 常にトップ表示
- クリックスルーモード

設定はローカルに永続保存されます。

## パフォーマンス
ターゲット:
- 待機時CPU使用率: <2%
- RAM使用量: <100MB
- アニメーション: 60 FPS

## UI
右クリックメニュー:
- ダッシュボードを開く
- セールスワークスペースを開く
- モード切替
- 設定
- アバターを隠す
- 終了

ダブルクリック:
- Musasabiダッシュボードを開く

## 将来の互換性
以下の技術用のフックを予約します（未実装）:
- Live2D
- Three.js
- Unity
- VRM
- 音声
- 感情エンジン

## テスト
実装されるテスト:
- アバターステートの切り替え
- アニメーションループ
- ドラッグ＆ドロップ
- 位置の永続性
- 通知表示
- 設定の永続性
- モード切替

## ドキュメンテーション
更新するドキュメント:
- `README.md`
- `CHANGELOG.md`
- `docs/AVATAR.md`

## 制限事項
次の機能は実装しないでください:
- 音声合成
- 音声認識
- Live2D
- 3Dレンダリング
- AutoCall
- 外部AI API

必要に応じてプレースホルダーアセットを使用してください。

## 受け入れ基準
- アバターがデスクトップに表示される
- アバターはドラッグ可能
- アバターは位置を記憶
- アバターが状態変化を表示
- スピーチバブルが機能
- 通知が機能
- 設定が永続化される
- テストが通過
- ドキュメントが更新される

## 納品物
報告内容:
- 変更されたファイル
- テスト結果
- 推奨コミットメッセージ

自動的にプッシュしないでください。

### 推奨コミットメッセージ
`feat(avatar): implement MUSA desktop avatar MVP`
```