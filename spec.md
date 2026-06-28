# 技術指示書: Workflow Foundation Implementation

## 概要

本書は、Musasabi AI の最小限の Workflow Foundation を実装するための技術指示書です。この実装は、ワークフローデータモデル、リポジトリ、サービス、シードワークフロー、デスクトップステータス表示の構築を目的とし、ワークフローの実行は含みません。

---

## 対象範囲

以下のコンポーネントを実装します:

- ワークフローリポジトリ
- ワークフローサービス
- SQLite マイグレーション
- ワークフローモデル
- ワークフロータスクモデル
- シードワークフロー
- デスクトップUIのステータス表示
- 単体テスト

---

## 必要なファイル

以下のファイルを作成してください:

```
packages/workflow/src/
  - workflowRepository.js
  - workflowService.js
  - index.js
```

---

## SQLite マイグレーション

### テーブル: `workflows`

- カラム:
  - id
  - title
  - description
  - status
  - created_by
  - created_at
  - updated_at

### テーブル: `workflow_tasks`

- カラム:
  - id
  - workflow_id
  - title
  - task_type
  - status
  - order_index
  - created_at
  - updated_at

---

## シードワークフロー

### 初期ワークフロー

- タイトル: MUSA Full Auto Approval Workflow
- 説明: Workflow for requesting approval before switching MUSA-001 to full auto mode.
- 状態: ready

#### タスク:
1. 承認リクエストを作成
   - task_type: approval
   - status: ready
   - order_index: 1

2. CEOの承認を待つ
   - task_type: human_review
   - status: waiting
   - order_index: 2

---

## サービスメソッド

- `createWorkflow()`
- `getWorkflow()`
- `listWorkflows()`
- `addTask()`
- `listTasks()`

---

## リポジトリメソッド

- `createWorkflow()`
- `findWorkflowById()`
- `listWorkflows()`
- `createTask()`
- `listTasksByWorkflowId()`

---

## UI

表示内容:

- Workflow Engine: Ready
- ワークフロー: MUSA Full Auto Approval Workflow
- ワークフローステータス: ready
- タスク: 2

---

## テスト

以下のテストを実装してください:

- `workflows` テーブルが存在する
- `workflow_tasks` テーブルが存在する
- ワークフローの作成
- ワークフローの一覧表示
- タスクの作成
- タスクの一覧表示
- シードワークフローが存在する
- デスクトップブートストラップが Musasabi OS と MUSA-001 を表示する

---

## ドキュメント更新

以下を更新してください:

- `README.md`
- `CHANGELOG.md`

---

## 制約

以下の実装は行わないでください:

- ワークフローの実行
- リトライ
- ロールバック
- プラグイン統合
- スケジューラ統合
- 外部API

---

## 受け入れ基準

- WorkflowRepository が実装されている
- WorkflowService が実装されている
- `workflows` テーブルが存在する
- `workflow_tasks` テーブルが存在する
- シードワークフローが存在する
- デスクトップUIが Workflow Engine Ready を表示すること
- テストが通過する
- README が更新されている
- CHANGELOG が更新されている

---

## 納品物

レポート内容:

- 変更されたファイル
- テスト結果
- 提案されるコミットメッセージ

GitHub へのプッシュは不要です。

提案されるコミット:  
`feat(workflow): implement workflow foundation`

---