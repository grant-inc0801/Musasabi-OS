# 技術指示書

## S2-002 Zoom Phone Call Log Import

### 目的

Musasabi AI のための Zoom Phone 通話履歴インポート機能の基盤を実装します。この機能により、テレマーケティング営業チームは Zoom Phone の通話履歴をローカルの SQLite データベースにインポートし、後で分析、コーチング、学習ができるようになります。ただし、この課題ではトランスクリプション、録音ダウンロード、自律的な発信は実装しません。

---

### 範囲

以下を実装します。

- Zoom Phone との統合モジュール
- Zoom Phone 通話履歴のタイプ正規化
- インポートされた通話ログのローカル SQLite ストレージ
- 開発用の手動/モックインポートサポート
- セールスインテリジェンス UI ディスプレイ基盤
- テスト
- README 更新

---

### 必要モジュール

以下のファイルを作成します。

`packages/integrations/src/zoom-phone/`

- `zoomPhoneTypes.js`
- `zoomPhoneClient.js`
- `zoomPhoneService.js`
- `index.js`

---

### SQLite テーブル

テーブルを作成します。

テーブル名: `zoom_phone_call_logs`

カラム:

- `id`
- `zoom_call_id`
- `direction`
- `caller_number`
- `callee_number`
- `start_time`
- `end_time`
- `duration_seconds`
- `result`
- `recording_available`
- `raw_json`
- `created_at`
- `updated_at`

---

### 環境変数

以下の環境変数をサポートします。

- `ZOOM_ACCOUNT_ID`
- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`

ルール:

- 資格情報をハードコードしない
- 資格情報をログに記録しない
- アプリ起動時に資格情報を必須にしない
- 資格情報が不足している場合、統合ステータスを未構成として表示

---

### 開発モード

Zoom の資格情報がない場合は、ローカルのサンプルデータからモックインポートを許可します。

サンプルデータ作成:

`data/seeds/zoom-phone-sample-call-logs.json`

サンプル通話履歴を3件含める。

---

### サービスメソッド

以下のメソッドを実装します。

- `normalizeCallLog(raw)`
- `importCallLogs(rawLogs)`
- `listCallLogs()`
- `getCallLog(id)`
- `getIntegrationStatus()`

---

### UI 要件

セールスインテリジェンス画面を追加または更新します。

表示内容:

- Zoom Phone 統合: 構成済み/未構成
- インポートされた通話: {件数}
- 最新の通話
- 方向
- 電話番号
- 持続時間
- 結果
- 録音の有無

---

### テスト

以下のテストを追加します。

- Zoom 通話履歴の正規化
- サンプル通話ログのインポート
- `listCallLogs()`
- `getCallLog()`
- 資格情報が不足していてもアプリがクラッシュしない
- 資格情報がログに出力されない
- デスクトップブートストラップが通過する

---

### ドキュメント

以下を更新します。

- `README.md`
- `CHANGELOG.md`

`README` には次を含めます。

- Zoom Phone セットアップ
- 必須環境変数
- モックインポート開発モード
- セキュリティノート

---

### 制限事項

以下を実装しないでください。

- 録音のダウンロード
- トランスクリプション
- AI 分析
- 自動通話
- 緊急呼び出しの実行
- 外部ウェブフック
- クラウド同期

---

### 受け入れ基準

- Zoom Phone モジュールが存在する
- SQLite テーブルが存在する
- サンプル通話ログをインポートできる
- インポートされた通話ログをリストできる
- 統合ステータスが表示される
- 資格情報が不足していてもスタートアップに影響を与えない
- 秘密はログに出力されない
- `npm test` が通過する
- README が更新されている
- CHANGELOG が更新されている

---

### 提出物

報告:

- 変更されたファイル
- テスト結果
- エラー
- 推奨コミットメッセージ

GitHub にはプッシュしないでください。

推奨コミットメッセージ:

`feat(sales): add zoom phone call log import foundation`