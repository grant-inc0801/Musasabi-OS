# 技術指示書: S5-001 Zoom Phone Real-Time Sync

## 概要

Musasabi AI向けにZoom Phoneのリアルタイム同期を実装します。この統合は、会社の実際の電話システムでの初の本番環境導入です。Musasabi AIは、自動的に通話イベントを受信し、通話履歴を同期し、Sales Workspaceを更新し、Sales Brainに情報を提供する必要があります。本タスクでは、同期の実装のみを行います。

## 現環境

- **テレフォニーシステム**: Zoom Phone
- **CRMシステム**: FileMaker

## 必要モジュール

ファイル構造:
```
packages/integrations/src/zoom-phone/
- zoomWebhookService.js
- zoomEventRouter.js
- zoomCallSyncService.js
- zoomPresenceService.js
- zoomRealtimeClient.js
```

## 対応イベント

同期対象:
- call.started
- call.connected
- call.ended
- missed.call
- voicemail.created

イベントはローカルに保存します。

## データベース構造 (SQLite)

### テーブル: zoom_call_events

- id
- zoom_call_id
- event_type
- event_time
- payload_json
- processed
- created_at

### テーブル: call_sync_status

- id
- zoom_call_id
- sync_status
- last_synced_at
- error_message

## Sales Workspaceの更新

以下のイベント発生時に自動更新:
- 通話開始
- 通話接続
- 通話終了

表示項目:
- 現在の通話ステータス
- 現在の通話継続時間
- 現在のリード
- 最終同期

## リードマッチング

優先順位:
- プライマリ: 電話番号
- フォールバック: 会社名

リードが見つからない場合は一時的な未マッチ通話レコードを作成。

## ダッシュボード

表示内容:
- 今日の通話
- 現在のアクティブ通話
- 不在着信
- 平均通話時間
- 同期ステータス

## リトライ機能

失敗した同期を自動リトライします。最大3回まで試行し、毎回の試行をログファイルに記録します。

## セキュリティ

以下の情報を絶対に公開しない:
- Zoomの認証情報
- アクセストークン
- Webhookシークレット

イベントを処理する前にWebhookの署名を検証します。

## テスト

以下のテストを実装:
- Webhook検証
- イベントパース
- リードマッチング
- 同期リトライ
- ダッシュボード更新
- 未マッチ通話作成

## ドキュメント

以下を更新:
- README.md
- CHANGELOG.md
- docs/ZOOM_PHONE_SYNC.md

## 制約

実装しない機能:
- 録音ダウンロード
- 音声認識
- 音声分析
- 自動通話
- 外部AIサービス

## 受け入れ基準

- Zoom Phoneイベントが自動同期されること
- アクティブな通話がSales Workspaceに表示されること
- 通話が既存のリードとマッチすること
- 未マッチの通話が安定して保存されること
- ダッシュボードがリアルタイムで更新されること
- リトライ機能が正常に動作すること
- テストが全て合格すること
- ドキュメントが更新されていること

## 納品物

以下の報告を含む:
- 変更されたファイル
- テスト結果
- 推奨コミット

自動的にプッシュしないようにします。

推奨コミットメッセージ:
```
feat(integration): implement Zoom Phone real-time synchronization
```