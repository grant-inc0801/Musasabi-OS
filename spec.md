# 技術指示書: S4-008 FileMaker Lead Sync Foundation

## 目的
Musasabi AIがFileMakerからリード/顧客データをインポートおよび正規化できるようにし、テレマーケティングチームが実際の顧客記録を使用してSales Workspace、Lead Priority、Sales Brain、およびAI Sales Managerを利用できるようにします。本タスクでは基礎となる部分の実装のみ行います。

## 現行システム
- 顧客管理システム: FileMaker

## 必要なモジュール
ディレクトリ: `packages/integrations/src/filemaker/`

- `fileMakerTypes.js`
- `fileMakerClient.js`
- `fileMakerService.js`
- `fileMakerNormalizer.js`
- `index.js`

## SQLite テーブル
新規に以下のテーブルを作成します。

### 1. filemaker_sync_logs

| カラム名         | 型       |
|----------------|---------|
| id             | INTEGER |
| sync_type      | TEXT    |
| status         | TEXT    |
| imported_count | INTEGER |
| skipped_count  | INTEGER |
| error_count    | INTEGER |
| started_at     | DATETIME|
| completed_at   | DATETIME|
| detail_json    | TEXT    |

### 2. filemaker_lead_mappings

| カラム名          | 型       |
|-----------------|---------|
| id              | INTEGER |
| filemaker_record_id | INTEGER |
| sales_lead_id   | INTEGER |
| match_key       | TEXT    |
| created_at      | DATETIME|
| updated_at      | DATETIME|

## 既存のテーブル
既存の `sales_leads` テーブルを使用または拡張します。

正規化された必要なフィールド:
- company_name
- store_name
- phone_number
- postal_code
- address
- industry_major
- industry_minor
- status
- priority
- assigned_to

## 環境変数
サポート:
- `FILEMAKER_BASE_URL`
- `FILEMAKER_DATABASE`
- `FILEMAKER_USERNAME`
- `FILEMAKER_PASSWORD`
- `FILEMAKER_LAYOUT`

ルール:
- 認証情報はハードコードしない
- 認証情報をログに記録しない
- アプリ起動時に認証情報を必要としない
- 認証情報が不足している場合、FileMaker Integrationを未設定として表示

## 開発モード
FileMakerの認証情報が不足している場合、ローカルのサンプルデータから模擬的にインポート可能。

作成先:
- `data/seeds/filemaker-sample-leads.json`

サンプルリードを最低5件含むこと。

## サービスメソッド
以下のサービスメソッドを実装します。

- `getIntegrationStatus()`
- `normalizeLead(rawRecord)`
- `importLeads(rawRecords)`
- `listImportedLeads()`
- `getSyncHistory()`
- `matchLeadByPhoneNumber(phoneNumber)`

## マッチングルール
プライマリマッチ:
- `phone_number`

フォールバックマッチ:
- `company_name + address`

既存リードフィールドを自動的に上書きしない。

重複が見つかった場合:
- マッピングを作成
- 破壊的な更新をスキップ
- `skipped_count` をログに記録

## ユーザーインターフェース (UI)
Sales Workspace / Settingsを更新し、以下を表示：

- FileMaker Integration: 設定済み / 未設定
- インポートされたリード: {count}
- 最後の同期ステータス
- 最後の同期インポート数
- 最後の同期エラー数

追加ボタン:
- サンプルFileMakerリードをインポート

認証情報が設定されている場合、ボタンの準備:
- FileMakerからインポート

## テスト
以下のテストを実装します。

- FileMaker統合ステータス
- サンプルリードインポート
- リード正規化
- 電話番号マッチング
- 重複防止
- 同期ログ作成
- 認証情報が不足していてもアプリがクラッシュしない
- 認証情報がログに記録されない

## ドキュメント
以下を更新します。

- `README.md`
- `CHANGELOG.md`
- `docs/FILEMAKER_SYNC.md`

`README.md` には以下を含めること：

- FileMakerセットアップ
- 必要な環境変数
- モックインポートの開発モード
- セキュリティノート
- 重複処理ルール

## 制限事項
以下を実装しないこと。

- FileMakerへの書き戻し
- 破壊的上書き
- 自動スケジュール同期
- クラウド同期
- 外部AI分析
- AutoCall
- FileMakerスキーママイグレーション

## 受け入れ基準
- FileMakerモジュールが存在する
- サンプルFileMakerリードをインポート可能
- リードが `sales_leads` に正規化される
- 重複防止が機能する
- 同期ログが作成される
- 統合ステータスが表示される
- 認証情報が不足しても起動に影響しない
- 認証情報がログに記録されない
- テストが通過する
- ドキュメントが更新されている

## 納品物
以下を報告してください。

- 変更されたファイル
- テスト結果
- 推奨コミットメッセージ

自動的にプッシュしないでください。

### 推奨コミットメッセージ
```
feat(integration): add FileMaker lead sync foundation
```