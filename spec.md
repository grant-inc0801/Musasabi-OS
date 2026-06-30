# 技術指示書: S3-003 スプリント管理システム

## 目的

現在のIssue駆動のワークフローをスプリント駆動のワークフローに置き換える。AIプロジェクトマネージャー（AI PM）がスプリントの実行を管理し、スプリント定義からIssuesを生成し、進捗を追跡し、スプリントの完了を判断する。スプリント定義は開発の単一の信頼できる情報源となる。

## スプリントライフサイクル

1. スプリント作成
2. AI PMによるスプリントの検証
3. 依存関係の解決
4. 初めての実行可能なIssue生成
5. Codex実装
6. テスト
7. レビュー
8. Issue完了
9. 次の実行可能なIssue生成
10. スプリント完了まで繰り返す
11. スプリントレビュー
12. 次のスプリント生成

## 必要なモジュール

作成するパッケージ: `packages/ai-pm/src/sprint/`

- `sprintManager.js`
- `sprintRepository.js`
- `sprintPlanner.js`
- `sprintExecutor.js`
- `sprintReview.js`
- `sprintGenerator.js`
- `sprintDashboard.js`

## SQLiteテーブル

### sprints

- `id`
- `sprint_key`
- `title`
- `description`
- `status` (planned, active, review, completed)
- `priority`
- `created_at`
- `updated_at`
- `started_at`
- `completed_at`

### sprint_tasks

- `id`
- `sprint_id`
- `task_key`
- `title`
- `status` (pending, ready, in_progress, review, completed, blocked)
- `github_issue_number`
- `dependency_key`
- `assignee`
- `created_at`
- `updated_at`

## スプリント定義

サポート: `docs/sprints/`
例: `Sprint-003.yaml`
内容:
- スプリントメタデータ
- 目標
- タスクリスト
- 依存関係
- 受け入れ基準

AI PMは、自身のロードマップを生成するのではなく、スプリント定義を読む必要がある。

## GitHub統合

AI PMの役割:
- スプリント定義からのみIssuesを生成
- ラベルの適用
- マイルストーンの適用
- Issue完了の追跡
- スプリント進捗の更新
- スプリント完了レポートの生成

## ダッシュボード

スプリントダッシュボードを作成し、以下を表示すること:

- アクティブなスプリント
- スプリントの進捗状況
- 残存タスク
- 完了タスク
- ブロックされたタスク
- 現在のIssue
- 次のIssue
- レビューキュー

## ルール

- AI PMはスプリントで定義されていないIssueを決して作成しない。
- AI PMはタスクの依存関係を決してスキップしない。
- AI PMは必要なすべてのタスクが完了するまでスプリントを閉じてはならない。

## テスト

実装すべき項目:
- スプリント解析
- タスク依存関係の解決
- スプリント進捗の計算
- スプリント完了の検出
- ダッシュボードのレンダリング

## ドキュメント

更新する項目:
- `README.md`
- `CHANGELOG.md`

作成する項目:
- `docs/SPRINT_SYSTEM.md`

## 受け入れ基準

- スプリント定義がサポートされている
- AI PMがスプリントからのみIssuesを生成する
- スプリントダッシュボードが機能する
- 進捗追跡が動作する
- スプリント完了が機能する
- テストがすべて合格する
- ドキュメンテーションが更新されている

## 納品物

報告する内容:
- 変更されたファイル
- テスト結果
- 提案するコミット

自動でプッシュしないこと。

提案するコミット:
```
feat(ai-pm): implement sprint management system
```
