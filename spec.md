# 技術指示書: S5-004 Real-Time Sales Coach Upgrade

## 概要

本書は、「S5-004 Real-Time Sales Coach Upgrade」タスクの実装に必要な技術的指示を提供します。本タスクの目的は、営業担当者が通話中にMUSA（アップグレードされたリアルタイム売上コーチングシステム）を使用し、リードデータ、通話履歴、アポイントメント予測、Sales Brain、スクリプトパフォーマンス、音声分析を基にコーチングを受けられるようにすることです。実装は決定論的コーチングロジックに焦点を当てます。

## ビジョン

```
Lead
↓
Call History
↓
Sales Brain
↓
Script Optimization
↓
Appointment Forecast
↓
Voice Analysis
↓
MUSA Real-Time Coach
↓
Sales Representative
```

## 必要モジュール

以下のパッケージを更新または作成してください:

`packages/sales-coach/src/`

- `realtimeCoachService.js`
- `coachingContextBuilder.js`
- `coachingSignalDetector.js`
- `coachingRecommendationEngine.js`
- `nextBestLineGenerator.js`
- `coachingSessionRepository.js`
- `index.js`

## データベース (SQLite)

### テーブル: `realtime_coaching_sessions`

- `id`
- `lead_id`
- `call_log_id`
- `transcript_id`
- `status`
- `started_at`
- `ended_at`
- `created_at`
- `updated_at`

### テーブル: `realtime_coaching_recommendations`

- `id`
- `session_id`
- `recommendation_type`
- `recommendation`
- `reason`
- `confidence`
- `priority`
- `created_at`

## コーチングコンテキスト

以下の要素からコンテキストを構築:

- リードプロファイル
- 通話履歴
- トランスクリプト
- 聴取ノーツ
- アポイントメント予測
- リード優先度
- Sales Brain
- スクリプト推薦
- 音声分析

## 推薦タイプ

サポート:

- 開始
- 質問
- 反論
- クローズ
- 次のアクション
- 警告
- コーチングティップ

## コーチングルール

- リードが新しい場合: 開始スクリプトを推奨
- アポイント確率が高い場合: ダイレクトクローズを推奨
- 想定される異議が存在する場合: 反論を推奨
- 顧客の反応が弱い場合: 質問を推奨
- 音声分析でオペレーターの話す割合が高い場合: 質問を増やすことを推奨
- 前回のコールバックが存在する場合: 前回の会話を参照することを推奨

## ユーザーインターフェース (UI)

Sales Workspaceの右パネルを更新。

表示:

- MUSA Real-Time Coach

セクション:

- 推奨される次の行
- 想定される異議
- 推奨される反論
- クローズの提案
- 警告
- 信頼性
- 理由

アクション:

- 有用をマーク
- 無用をマーク
- スクリプトをコピー
- ベストトークとして保存

## 学習

ユーザーが推奨を有用または無用とマークしたとき:

- フィードバックを保存
- 推奨の信頼性を更新
- Sales Brainの学習履歴を更新

## テスト

以下の内容でテストを実施:

- コーチングコンテキストの構築
- 推薦の生成
- 想定異議の処理
- 次の行の生成
- 音声分析信号の処理
- フィードバックの保存
- 信頼性の更新

## ドキュメンテーション

以下を更新:

- `README.md`
- `CHANGELOG.md`
- `docs/REALTIME_SALES_COACH.md`

## 制限

以下の実装は行わないこと:

- リアルタイムトランスクリプション
- 音声生成
- AutoCall
- 外部コールの実行
- 外部AI API
- 自律的顧客会話

## 受け入れ基準

- リアルタイムコーチがリードコンテキストを使用する
- 推薦がSales Workspaceに表示される
- 次の行の推薦が機能する
- 異議/反論の推薦が機能する
- クローズの提案が機能する
- ユーザーのフィードバックが保存可能
- Sales Brainがフィードバックから学習する
- テストがすべてパスする
- ドキュメントが更新される

## デリバラブル

提供するもの:

- 変更されたファイル
- テスト結果
- 提案されたコミット

自動プッシュは行わないこと。

提案されたコミット:

```
feat(sales): upgrade real-time sales coach
```