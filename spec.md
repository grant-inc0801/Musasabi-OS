# 技術指示書: AI PM Autonomous Sprint Executor

この技術指示書は、AIプロジェクトマネージャー (AI PM) による完全自動化されたスプリント実行システムを実装するための詳細なガイドを提供します。

## 目次

1. [プロジェクトの目的](#プロジェクトの目的)
2. [システムビジョン](#システムビジョン)
3. [AI PMの責務](#AI-PMの責務)
4. [スプリントの状態遷移](#スプリントの状態遷移)
5. [必要なモジュール](#必要なモジュール)
6. [SQLiteデータベースのスキーマ](#SQLiteデータベースのスキーマ)
7. [リカバリー機能](#リカバリー機能)
8. [ダッシュボード要件](#ダッシュボード要件)
9. [通知要件](#通知要件)
10. [テスト要件](#テスト要件)
11. [ドキュメント更新](#ドキュメント更新)
12. [制約事項](#制約事項)
13. [受け入れ基準](#受け入れ基準)
14. [デリバラブル](#デリバラブル)

---

## プロジェクトの目的

AIプロジェクトマネージャー（AI PM）がスプリント全体を自律的に実行するシステムを実装する。このシステムでは、CEOがスプリントを開始すると、AI PMがスプリント完了まで全てのワークフローを管理します。

---

## システムビジョン

```
CEO 
  ↓ 
Start Sprint 
  ↓ 
AI PM 
  ↓ 
Generate Issue 
  ↓ 
Codex 
  ↓ 
Implementation 
  ↓ 
Tests 
  ↓ 
Review Gate 
  ↓ 
Safe Push 
  ↓ 
Close Issue 
  ↓ 
Next Sprint Task 
  ↓ 
Sprint Complete
```

---

## AI PMの責務

AI PMは以下の責務を負います:

- スプリントの定義を読み込む
- アクティブなタスクを検出
- GitHub Issueを生成
- ワークフローを監視
- レビューゲートの承認を待機
- 完了したIssueをクローズ
- 次のタスクを選択
- スプリントが完了するまでこれを繰り返す

---

## スプリントの状態遷移

### 状態一覧

- planned
- active
- waiting_for_codex
- implementation
- testing
- review_pending
- review_approved
- completed
- failed

遷移は決定論的である必要があります。

---

## 必要なモジュール

以下のモジュールを `packages/ai-pm/src/executor/` に実装します。

- `sprintExecutor.js`
- `issueDispatcher.js`
- `workflowMonitor.js`
- `reviewMonitor.js`
- `completionDetector.js`
- `recoveryManager.js`

---

## SQLiteデータベースのスキーマ

### sprint_execution_history

- id
- sprint_key
- task_key
- state
- issue_number
- started_at
- completed_at
- duration_ms
- result

### pipeline_events

- id
- event_type
- task_key
- issue_number
- detail_json
- created_at

---

## リカバリー機能

GitHub Actionsが失敗した場合:

- 最後のチェックポイントから再試行する
- 完了した作業を再生成しない
- 失敗したステージからのみ継続する

---

## ダッシュボード要件

スプリントマネージャーのUIを更新して、以下を表示:

- 現在のスプリント
- 現在のタスク
- 現在のワークフローステージ
- アクティブなGitHub Issue
- Codexのステータス
- レビューステータス
- 完了予定
- 残りのタスク

---

## 通知要件

以下のイベント発生時に通知を行う：

- スプリント開始
- Issueの作成
- テストの失敗
- レビュー待ち
- スプリント完了

---

## テスト要件

以下のシナリオをテストする：

- スプリント実行フロー
- 状態遷移
- Issueのディスパッチ
- ワークフローの監視
- プッシュ失敗時のリカバリー
- 完了検出
- ダッシュボードの更新

---

## ドキュメント更新

以下のドキュメントを更新する：

- `README.md`
- `CHANGELOG.md`
- `docs/SPRINT_SYSTEM.md`
- `docs/AI_PM.md`

---

## 制約事項

以下の機能は実装しない：

- AutoCall
- デプロイ自動化
- 強制プッシュ
- 自動マージコンフリクト解決

---

## 受け入れ基準

- AI PMがスプリントを自律的に実行する
- スプリントの状態遷移が正常に機能する
- 次のIssueが自動生成される
- リカバリー機能が動作する
- ダッシュボードが実行状態を反映する
- テストがすべて合格する
- ドキュメントが更新される

---

## デリバラブル

レポートには以下を含める：

- 変更されたファイル
- テスト結果
- スプリント実行サマリー
- 推奨コミットメッセージ

自動プッシュは行わないことを厳守。

### 推奨コミットメッセージ

`feat(ai-pm): implement autonomous sprint executor`