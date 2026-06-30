```markdown
# 技術指示書: S4-006 Sales Script Optimization Engine

## 目次

1. [概要](#概要)
2. [ビジョン](#ビジョン)
3. [必要モジュール](#必要モジュール)
4. [データベース (SQLite)](#データベース-sqlite)
5. [スクリプトカテゴリ](#スクリプトカテゴリ)
6. [最適化ロジック](#最適化ロジック)
7. [UI 要件](#ui-要件)
8. [MUSA 推奨機能](#musa-推奨機能)
9. [自動学習](#自動学習)
10. [テスト](#テスト)
11. [ドキュメント](#ドキュメント)
12. [制約事項](#制約事項)
13. [受け入れ基準](#受け入れ基準)
14. [納品物](#納品物)

## 概要

### タスク

S4-006 Sales Script Optimization Engine の実装。  
MUSA は実際の通話結果、トランスクリプトの学習、異議、反論、およびアポイントメントの結果に基づいて、テレマーケティングスクリプトを継続的に改善します。  
どのオープニング、質問、反論、クロージングが最も効果的であるかを自動的に特定することが目標です。

## ビジョン

通話史跡  
↓  
セールスブレイン  
↓  
異議/反論の学習  
↓  
アポイント結果  
↓  
スクリプトの最適化  
↓  
より良いセールススクリプト  
↓  
高いアポイント率  

## 必要モジュール

構造は以下のようになります。

```
packages/sales-script/

src/

- scriptRepository.js
- scriptService.js
- scriptOptimizer.js
- scriptVariantGenerator.js
- scriptPerformanceAnalyzer.js
- scriptRecommendationService.js
- index.js
```

## データベース (SQLite)

以下のテーブルを作成します。

### sales_scripts

- id
- title
- category
- content
- status
- created_at
- updated_at

### sales_script_variants

- id
- script_id
- variant_name
- content
- usage_count
- appointment_count
- success_rate
- confidence
- created_at
- updated_at

### sales_script_usage_logs

- id
- script_id
- variant_id
- lead_id
- transcript_id
- call_result
- appointment_created
- created_at

## スクリプトカテゴリ

- opening
- discovery_question
- value_proposition
- objection_rebuttal
- closing
- callback_followup

## 最適化ロジック

### 分析

以下の要素を分析します。

- 使用回数
- アポイントメント数
- 成功率
- 異議一致
- 業界一致
- トランスクリプトの品質
- コール結果

### スクリプトバリアントのランキング

以下に基づいてランク付けを行います。

- 成功率
- 信頼度
- 最近のパフォーマンス
- 使用量

## UI 要件

### Sales Script 画面を作成し、以下を表示します。

- スクリプトリスト
- カテゴリ
- バリアント
- 成功率
- 使用回数
- アポイントメント数
- 推奨スクリプト
- 成績不良スクリプト

## MUSA 推奨機能

Lead Detail と Sales Coach Panel に以下を表示します。

- 推奨オープニング
- 推奨発見質問
- 推奨反論
- 推奨クロージング
- 理由
- 信頼度

## 自動学習

通話履歴またはトランスクリプトが保存されたときに、可能であれば以下を行います。

- どのスクリプト/バリアントが使用されたかを検出
- 使用ログを作成
- 成功率を更新
- 推奨スクリプトのランキングを更新

## テスト

以下のテストを実装します。

- スクリプト作成
- バリアント作成
- 使用ログ記録
- 成功率計算
- 推奨ランキング
- 成績不良スクリプトの検出

## ドキュメント

以下を更新します。

- README.md
- CHANGELOG.md
- docs/SALES_SCRIPT_OPTIMIZATION.md

## 制約事項

以下の機能を実装してはいけません。

- LLMスクリプト生成
- 自動通話
- 音声AI
- 外部API
- 自動顧客呼び出し

決定論的なローカルロジックのみを使用します。

## 受け入れ基準

- セールススクリプトを作成できる
- スクリプトバリアントを作成できる
- 使用記録を記録できる
- 成功率を計算できる
- 最適なスクリプトを推奨できる
- 成績不良のスクリプトを検出できる
- MUSA がスクリプト推奨を表示する
- テストが合格する
- ドキュメントが更新される

## 納品物

以下をレポートします。

- 変更されたファイル
- テスト結果
- 推奨コミットメッセージ

自動プッシュしないでください。

### 推奨コミットメッセージ

```
feat(sales): implement sales script optimization engine
```
```

この技術指示書に基づいて、実装プロセスを進めてください。必要に応じて、各セクションを詳細に計画し、実装およびテストフレームワークに反映させます。