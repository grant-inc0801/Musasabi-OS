```markdown
# 技術指示書: S4-012 Sales Import Preview & Duplicate Review

## 目的

FileMakerのリードをMusasabiのsales_leadsにインポートする前に、ユーザーがマッピングされたレコードのプレビュー、重複検出、警告のレビュー、インポートの承認を行えるようにします。これにより、悪いデータが営業ワークスペースに入るのを防ぎます。

## ビジョン

1. FileMaker Records
2. Field Mapping
3. Import Preview
4. Duplicate Review
5. User Approval
6. sales_leads

## 必須モジュール

次のパスでモジュールを更新または作成すること:

`packages/integrations/src/filemaker/`
- fileMakerImportPreviewService.js
- duplicateLeadDetector.js
- importApprovalService.js

## SQLite テーブル

### テーブル: filemaker_import_batches

- カラム：
  - id
  - status
  - source
  - total_records
  - valid_records
  - duplicate_records
  - warning_records
  - error_records
  - created_at
  - updated_at
  
- ステータス:
  - preview
  - approved
  - imported
  - cancelled

### テーブル: filemaker_import_preview_records

- カラム：
  - id
  - batch_id
  - raw_record_json
  - mapped_record_json
  - status
  - warning_json
  - duplicate_lead_id
  - created_at
  
- ステータス:
  - valid
  - duplicate
  - warning
  - error
  - skipped

## プレビュー機能のルール

インポート前に以下を行うこと:
- フィールドマッピングを適用
- 電話番号を正規化
- 重複を検出
- 必須フィールドを検証
- レコードを分類

## 重複検出

- 主な基準: phone_number
- フォールバック基準: company_name + address

重複が見つかった場合:
- プレビューのレコードを重複としてマーク
- 自動でインポートしない
- 既存のリードにリンクする

## ユーザーインターフェース (UI)

インポートプレビュー画面を作成。以下を表示すること:

- バッチサマリー
- 総レコード数
- 有効レコード数
- 重複レコード数
- 警告レコード数
- エラーレコード数

レコードテーブルを表示:

- 会社/店舗
- 電話番号
- 住所
- ステータス
- 警告
- 重複ターゲット

実行可能なアクション:

- 有効レコードの承認
- 重複のスキップ
- バッチのキャンセル
- 承認されたレコードのインポート

## ユーザー承認

- インポートはユーザーの承認が得られるまではsales_leadsに書き込まれない
- ボタン追加:「インポートを承認」

## テスト

以下のテストを実装:

- インポートプレビューバッチの作成
- フィールドマッピングが適用されていること
- 電話による重複の検出
- 会社名と住所からの重複検出
- 電話がない場合のエラーになること
- 承認後に有効なレコードがインポートされること
- 重複はデフォルトでスキップされること
- キャンセルされたバッチがインポートされないこと

## ドキュメンテーション

次を更新および追加:

- README.md
- CHANGELOG.md
- docs/FILEMAKER_SYNC.md

追加:
- インポートプレビューワークフロー
- 重複レビューのワークフロー
- インポート前の承認

## 制限事項

以下は実装しない:
- 破壊的な上書き
- FileMakerへの書き戻し
- 自動スケジュールインポート
- クラウド同期
- AutoCall

## 受け入れ基準

- インポートプレビューバッチが作成されること
- レコードが適切に分類されること
- 重複が検出されること
- ユーザーがインポートを承認できること
- 有効なレコードのみ、承認後にインポートされること
- デフォルトで重複がスキップされること
- テストが通ること
- ドキュメントが更新されること

## デリバラブル

レポート:
- 変更されたファイル
- テスト結果
- 推奨コミットメッセージ

自動でプッシュしないこと。

推奨コミットメッセージ:
`feat(filemaker): add import preview and duplicate review`
```