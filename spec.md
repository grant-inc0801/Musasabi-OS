# 技術指示書: S1A-002 Workflow Foundation

## 概要

この技術指示書は、Musasabi AIの最小限のワークフロー基盤を実装するためのガイドラインです。ワークフロードメインモデル、リポジトリ、サービス、シードワークフロー、デスクトップのステータス表示を含みます。ワークフローの実行はこのフェーズには含まれません。

## スコープ

以下の機能を実装します:

- ワークフローリポジトリ
- ワークフローサービス
- SQLiteマイグレーション
- ワークフローモデル
- ワークフロータスクモデル
- シードワークフロー
- デスクトップUIステータス
- ユニットテスト

## 必須ファイル

以下のファイルを作成します:

```
packages/workflow/src/
- workflowRepository.js
- workflowService.js
- index.js
```

## SQLite

### テーブル作成

**workflows**

| カラム名     | タイプ   |
| ------------ | -------- |
| id           | INTEGER  |
| title        | TEXT     |
| description  | TEXT     |
| status       | TEXT     |
| created_by   | TEXT     |
| created_at   | DATETIME |
| updated_at   | DATETIME |

**workflow_tasks**

| カラム名     | タイプ   |
| ------------ | -------- |
| id           | INTEGER  |
| workflow_id  | INTEGER  |
| title        | TEXT     |
| task_type    | TEXT     |
| status       | TEXT     |
| order_index  | INTEGER  |
| created_at   | DATETIME |
| updated_at   | DATETIME |

## シードワークフロー

### 初期ワークフロー作成

- **タイトル:** MUSA Full Auto Approval Workflow
- **説明:** Workflow for requesting approval before switching MUSA-001 to full auto mode.
- **ステータス:** ready

### タスク

1. 承認リクエストの作成
   - **task_type:** approval
   - **status:** ready
   - **order_index:** 1

2. CEOの承認を待つ
   - **task_type:** human_review
   - **status:** waiting
   - **order_index:** 2

## サービスメソッド

- `createWorkflow()`
- `getWorkflow()`
- `listWorkflows()`
- `addTask()`
- `listTasks()`

## リポジトリメソッド

- `createWorkflow()`
- `findWorkflowById()`
- `listWorkflows()`
- `createTask()`
- `listTasksByWorkflowId()`

## UI

### 表示項目

- Workflow Engine: Ready
- Workflow: MUSA Full Auto Approval Workflow
- Workflow Status: ready
- Tasks: 2

## テスト

以下のテストを実装します:

- `workflows`テーブルが存在する
- `workflow_tasks`テーブルが存在する
- ワークフローの作成
- ワークフローのリスト表示
- タスクの作成
- タスクのリスト表示
- シードワークフローが存在するか確認
- デスクトップブートストラップがMusasabi OSとMUSA-001を引き続き表示するか

## ドキュメント

以下を更新します:

- `README.md`
- `CHANGELOG.md`

## 制約

以下は実装しないでください:

- ワークフローの実行
- リトライ
- ロールバック
- プラグイン統合
- スケジューラー統合
- 外部API

## 受け入れ基準

- WorkflowRepositoryが実装されている
- WorkflowServiceが実装されている
- `workflows`テーブルが存在する
- `workflow_tasks`テーブルが存在する
- シードワークフローが存在する
- デスクトップUIが「Workflow Engine Ready」を表示する
- テストが合格する
- READMEが更新される
- CHANGELOGが更新される

## 成果物

### レポート

- 変更されたファイル
- テスト結果
- 提案されるコミットメッセージ

GitHubへのプッシュは行わないでください。

### 提案されるコミットメッセージ

```
feat(workflow): implement workflow foundation
```