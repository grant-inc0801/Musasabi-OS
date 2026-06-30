```markdown
# 技術指示書: S4-011 FileMaker Field Mapping Manager

## 目標

FileMaker Field Mapping Managerを実装し、Musasabiの内部sales_leadsスキーマと異なるフィールド名でも実際のFileMakerスキーマを使用してリードのインポートを可能にする。

## 問題点

FileMakerデータベースはしばしばカスタムフィールド名を使用します。Musasabiの内部sales_leadsでは次のフィールド名が期待されます：

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

しかし、FileMakerでは異なる名前が使われることがあります。

例:

- 顧客名
- 店舗名
- 電話番号
- 郵便番号
- 住所
- 大分類
- 小分類

## 必要な機能

FileMakerフィールドとMusasabiフィールドの間にマッピングレイヤーを作成する。

## 必須モジュール

以下を更新または作成する:

- `packages/integrations/src/filemaker/fileMakerFieldMappingService.js`
- `packages/integrations/src/filemaker/fileMakerFieldMappingRepository.js`
- `packages/integrations/src/filemaker/fileMakerSchemaDetector.js`

## SQLite

テーブル: `filemaker_field_mappings`

カラム:

- id
- filemaker_field_name
- musasabi_field_name
- data_type
- required
- enabled
- created_at
- updated_at

## マッピングUI

FileMaker Mapping画面を作成する。

表示:

- FileMaker フィールド名
- Musasabi フィールド名
- データ型
- 必須
- 有効

アクション:

- マッピング追加
- マッピング編集
- マッピング無効化
- サンプルデータによるマッピングテスト

## デフォルトマッピング

日本語のデフォルトマッピングをシードする:

| FileMaker Field | Musasabi Field |
|---|---|
| 顧客名 | company_name |
| 会社名 | company_name |
| 店舗名 | store_name |
| 電話番号 | phone_number |
| TEL | phone_number |
| 郵便番号 | postal_code |
| 住所 | address |
| 業種大分類 | industry_major |
| 業種小分類 | industry_minor |
| ステータス | status |
| 優先度 | priority |
| 担当者 | assigned_to |

## インポート統合

FileMakerインポートはマッピングを使用する必要があります。

必須フィールドが欠けている場合:

- クラッシュしない
- 警告をログに記録
- phone_number が欠けている場合はレコードをスキップ
- 非必須フィールドが欠けている場合は部分的にレコードをインポート

## バリデーション

以下を検証する:

- 電話番号が存在
- 会社名または店舗名が存在
- 重複する電話番号の処理
- 空のフィールド
- 不明なフィールド

## テスト

以下のテストを実装する:

- デフォルトのマッピングがシードされる
- カスタムマッピングが作成できる
- サンプルレコードがマッピングできる
- 欠落した電話番号はスキップされる
- 部分的なレコードのインポートが機能する
- 重複する電話番号が処理される

## ドキュメント

更新:

- `README.md`
- `CHANGELOG.md`
- `docs/FILEMAKER_SYNC.md`

追加:

- フィールドマッピングの設定方法
- デフォルトの日本語マッピング
- 欠落フィールドのトラブルシューティング

## 制約条件

以下は実装しない:

- 破壊的なFileMaker書き戻し
- 自動スキーマ変更
- クラウド同期
- 外部AI
- AutoCall

## 受領基準

- フィールドマッピングテーブルが存在
- デフォルトの日本語マッピングが存在
- マッピングサービスが機能
- FileMakerインポートがマッピングを使用
- マッピングUIが存在
- テスト合格
- ドキュメントが更新

## デリバラブル

報告:

- 変更されたファイル
- テスト結果
- 推奨コミットメッセージ

自動でプッシュしない。

### 推奨コミットメッセージ

```
feat(filemaker): add field mapping manager
```
```