# 技術指示書: Company Brain Core 実装

## 概要

この技術指示書は、Musasabi OS の中心的な知能層である Company Brain Core の実装に関するものです。Company Brain は、各AI従業員が参照する会社の知識、ポリシー、ワークフロー、標準、および目標を管理します。これにより、組織のデジタルオペレーティングマニュアルとして機能します。

## ビジョン

次のフローに基づいて、Company Brain が最終的なAI知能を提供します:

1. Memory Engine
2. Knowledge Graph
3. Learning Engine
4. Decision Engine
5. Company Brain
6. AI Employees
7. Musasabi Avatar

## 必要なモジュール

`packages/brain/src/company/` ディレクトリ以下に、以下のモジュールを実装します:
- `CompanyBrain.ts`
- `CompanyRepository.ts`
- `CompanyPolicyService.ts`
- `WorkflowRepository.ts`
- `KnowledgeSynchronizer.ts`
- `CompanyContext.ts`
- `BrainSearch.ts`
- `CompanyRuleEngine.ts`

## データベース

SQLite を用いて以下のテーブルを作成します。

### company_policies

| Field      | Type |
|------------|------|
| id         | INTEGER PRIMARY KEY AUTOINCREMENT |
| title      | TEXT |
| category   | TEXT |
| content    | TEXT |
| version    | TEXT |
| status     | TEXT |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME DEFAULT CURRENT_TIMESTAMP |

### company_workflows

| Field          | Type |
|----------------|------|
| id             | INTEGER PRIMARY KEY AUTOINCREMENT |
| workflow_name  | TEXT |
| department     | TEXT |
| workflow_json  | TEXT |
| version        | TEXT |
| created_at     | DATETIME DEFAULT CURRENT_TIMESTAMP |
| updated_at     | DATETIME DEFAULT CURRENT_TIMESTAMP |

### company_decision_rules

| Field      | Type |
|------------|------|
| id         | INTEGER PRIMARY KEY AUTOINCREMENT |
| rule_name  | TEXT |
| condition  | TEXT |
| action     | TEXT |
| priority   | INTEGER |
| enabled    | BOOLEAN |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP |

### company_objectives

| Field      | Type |
|------------|------|
| id         | INTEGER PRIMARY KEY AUTOINCREMENT |
| objective  | TEXT |
| department | TEXT |
| priority   | INTEGER |
| status     | TEXT |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME DEFAULT CURRENT_TIMESTAMP |

## 会社知識

以下の要素をサポートします:
- ミッション
- ビジョン
- バリュー
- 組織
- 部門
- 製品
- サービス
- SOPs (標準作業手順書)
- セールスマニュアル
- 開発標準
- 会計ルール
- 人事ポリシー
- 内部文書

## AI クエリアPI

以下のAPIを提供します:
- `searchKnowledge()`
- `searchPolicy()`
- `searchWorkflow()`
- `searchObjective()`
- `searchRule()`
- `searchDepartment()`

各AI従業員はこれらのAPIを使用します。

## ワークフロー統合

以下のワークフロー統合を提供します:

- セールス
  - セールス SOP
- 開発
  - 開発 SOP
- 会計
  - 会計 SOP
- サポート
  - サポート SOP
- 管理
  - 管理 SOP

## バージョン管理

すべての会社文書は以下のステータスをサポートします:
- 草案
- 現行
- アーカイブ

完全なバージョン履歴を保持します。

## ダッシュボード

### Company Brain Explorer
以下を表示します:
- ポリシー
- ワークフロー
- 目標
- ルール
- 最近の更新
- バージョン履歴
- 検索

## AI 統合

各AI従業員はそれぞれの専門分野に従い以下を参照します:
- セールスAI: セールスマニュアル
- 開発AI: コーディングスタンダード
- 会計AI: 会計ポリシー
- 管理AI: 会社のKPI
- アバター: 現在の会社のステータス

## テスト

以下のテストを実装します:
- 知識ストレージ
- ワークフロー取得
- ポリシー検索
- バージョン履歴
- ルール検索
- ダッシュボードレンダリング

## ドキュメント

以下のドキュメントを作成/更新します:
- `docs/COMPANY_BRAIN.md` 作成
- `README.md` 更新
- `CHANGELOG.md` 更新
- `docs/BRAIN_MEMORY_ENGINE.md` 更新
- `docs/COMPANY_KNOWLEDGE_GRAPH.md` 更新

## 制限事項

以下を実装しない:
- クラウド同期
- 外部ERP
- 外部ドキュメントストレージ
- 自動ポリシー修正
- LLM自動ポリシー作成

## 受入条件

- Company Brain の存在
- ポリシー、ワークフローの格納
- ルールの検索
- バージョン履歴の動作
- ダッシュボードの動作
- AI従業員による Company Brain のクエリ
- テストの合格
- ドキュメントの更新

## デリバラブル

### レポート

以下を含む:
- 変更されたファイル
- テスト結果
- Company Brain ダッシュボードのスクリーンショット
- 推奨コミット

### 推奨コミット

`feat(brain): implement Company Brain Core`