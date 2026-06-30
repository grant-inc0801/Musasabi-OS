```markdown
# 技術指示書: S5-002 FileMaker Two-Way Sync

## 概要

本指示書は、Musasabi AIのセールスリードデータをFileMakerの顧客管理システムと同期するための基盤を実装するためのものです。安全性を考慮した制御された双方向同期を実現し、データの消去や破壊的な書き換えを防ぎながら、承認されない一括更新を行わないようにします。

---

## 現在の環境

- **CRM**: FileMaker
- **電話システム**: Zoom Phone

---

## 必要モジュール

`packages/integrations/src/filemaker/` 配下に以下のモジュールを実装します。

- `fileMakerTwoWaySyncService.js`
- `fileMakerWriteBackService.js`
- `fileMakerConflictResolver.js`
- `fileMakerSyncPreviewService.js`
- `fileMakerSyncAuditService.js`

---

## 同期の方向

1. **FileMaker → Musasabi**: ローカルのセールスリードのインポートまたは更新
2. **Musasabi → FileMaker**: 選択された安全なフィールドのみの書き戻し

---

## 許可された書き戻しフィールド

以下のフィールドにのみ書き戻しを許可します。

- status
- priority
- assigned_to
- last_call_result
- next_action
- next_call_date
- memo

以下のフィールドには書き戻しを行いません（将来的に明示的に許可された場合を除く）。

- company_name
- store_name
- phone_number
- address
- industry fields
- original FileMaker IDs

---

## SQLite テーブル構造

### `filemaker_writeback_queue`

- `id`
- `sales_lead_id`
- `filemaker_record_id`
- `field_name`
- `old_value`
- `new_value`
- `status` （pending, approved, synced, failed, cancelled）
- `created_at`
- `updated_at`

### `filemaker_sync_conflicts`

- `id`
- `sales_lead_id`
- `filemaker_record_id`
- `field_name`
- `local_value`
- `remote_value`
- `resolution` （use_local, use_remote, manual_review, unresolved）
- `created_at`
- `updated_at`

### `filemaker_sync_audit_logs`

- `id`
- `sync_direction`
- `action`
- `sales_lead_id`
- `filemaker_record_id`
- `detail_json`
- `created_at`

---

## コンフリクトルール

ローカルとFileMakerの両方のレコードが変更された場合：

- 自動上書きを行わない
- コンフリクトレコードを作成する
- 手動でのレビューを要求する

---

## プレビューの必要性

FileMakerへの書き戻し前に以下を実行します：

- プレビューの表示
- 変更されたフィールドの表示
- 承認の要求
- 承認済みのキュー項目のみを書き込む

---

## UI要件

FileMaker同期画面を作成し、以下を表示します：

- Integration Status
- Last Import
- Last Write-Back
- Pending Write-Back Queue
- Conflicts
- Sync Audit Logs

アクション項目：

- Preview Import
- Import Approved Records
- Preview Write-Back
- Approve Write-Back
- Cancel Write-Back
- Resolve Conflict

---

## セキュリティ

以下は決してログに記録しません：

- FileMakerのパスワード
- セッショントークン
- 認証情報

顧客データを破壊的に書き換えないようにし、すべての書き戻しアクションは監査可能にします。

---

## テスト

以下のテストを実施します：

- インポート更新検出
- 書き戻しキュー作成
- 許可フィールドの検証
- 禁止フィールドの拒否
- コンフリクト検出
- 手動コンフリクト解決
- 監査ログ作成
- 認証情報が欠如した際の安全起動

---

## ドキュメント更新

以下を更新します：

- `README.md`
- `CHANGELOG.md`
- `docs/FILEMAKER_SYNC.md`

以下を追加します：

- Two-way sync setup
- Allowed write-back fields
- Conflict handling
- Approval workflow
- Safety rules

---

## 禁止事項

以下を実装しません：

- 破壊的上書き
- 削除同期
- 自動フィールドスキーマ変更
- 承認なしの自動一括書き戻し
- クラウド同期
- AutoCall

---

## 受け入れ基準

- 双方向同期の基盤が存在する
- FileMakerのインポートが引き続き機能する
- 書き戻しキューが機能する
- 許可されたフィールドのみがキューに追加される
- 禁止フィールドが拒否される
- コンフリクトが検出される
- 手動コンフリクト解決が存在する
- 監査ログが作成される
- テストが通過する
- ドキュメントが更新される

---

## 成果物

以下を報告します：

- 変更されたファイル
- テスト結果
- 推奨コミットメッセージ

自動的にプッシュしないこと。

### 推奨コミットメッセージ

```
feat(filemaker): implement safe two-way sync foundation
```
```