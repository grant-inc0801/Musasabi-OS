```markdown
# 技術指示書: Musasabi AI Project Manager Foundation

## 概要

**タスク ID**: S3-001  
**プロジェクト名**: Musasabi AI Project Manager Foundation  
**目的**: Musasabi AI Project Manager（AI PM）の構築。AI PMは、ソフトウェア開発全体のオーケストレーションエンジンとなります。

---

## ビジョン

```
CEO
↓
Musasabi AI PM
↓
GitHub
↓
Codex
↓
Tests
↓
Review
↓
Merge
↓
Next Issue
```

---

## 責務

AI PMは以下を実施する必要があります:

1. ロードマップの読み取り
2. 次の実行可能なタスクの決定
3. 依存関係の確認
4. GitHub Issueの作成
5. 実装ステータスの監視
6. テスト結果の確認
7. 次のタスクの決定
8. 開発履歴の維持

**制約**: AI PMはロードマップを新たに作成することはありません。ロードマップは唯一の信頼できる情報のソースです。

---

## 必要モジュール

以下のモジュールを`packages/ai-pm/src/`に作成:

- `roadmapManager.js`
- `dependencyResolver.js`
- `issueGenerator.js`
- `issueTracker.js`
- `reviewManager.js`
- `workflowManager.js`
- `projectState.js`
- `index.js`

---

## データベース

SQLiteテーブルを作成:

### project_tasks

- id
- roadmap_key
- title
- status
- dependency_key
- github_issue_number
- commit_hash
- created_at
- updated_at

### project_events

- id
- event_type
- task_key
- payload_json
- created_at

### project_reviews

- id
- task_key
- reviewer
- result
- comments
- created_at

---

## ワークフロー

```
Roadmap
↓
Dependency Resolver
↓
Issue Generator
↓
GitHub Issue
↓
Codex
↓
Implementation
↓
Tests
↓
Review
↓
Close Issue
↓
Generate Next Issue
```

---

## ルール

次の条件が満たされたときにのみ次のIssueを作成:

- 現在のIssueが完了している
- テストが成功している
- 必要な依存関係が完了している
- レビューが承認されている

---

## 依存関係の解決

サポート内容:

- 連続実行
- ブロックされたタスク
- 任意のタスク
- 並列タスク（将来対応）

---

## GitHub 統合

以下を実装:

- `createIssue()`
- `updateIssue()`
- `closeIssue()`
- `commentIssue()`

**注意**: GitHub REST APIを使用してください。トークンは公開しないこと。

---

## ロードマップ

サポート内容:

- `roadmap.json`

各項目には以下が含まれる:

- key
- title
- description
- labels
- milestone
- dependencies
- acceptance

---

## ダッシュボード

AI PM ダッシュボードを作成し、以下を表示:

- 現在のスプリント
- 現在のタスク
- 完了したタスク
- ブロックされたタスク
- 次のタスク
- オープンなIssues
- レビューキュー
- パイプラインステータス

---

## 将来対応

後に以下をサポートできるようにAI PMを設計:

- Claude
- Codex
- OpenAI
- 複数のリポジトリ
- 複数のプロジェクト
- 複数のAI従業員

---

## テスト

以下を実装:

- ロードマップの解析
- 依存関係の解決
- Issueの生成
- 重複の防止
- レビューステート管理
- プロジェクトステートの永続化

---

## ドキュメント

更新:

- `README.md`
- `CHANGELOG.md`

新規作成:

- `docs/AI_PM.md`

---

## 制約事項

以下は実施しない:

- 自律的なコーディング
- 自律的なマージ
- 自律的なデプロイ
- ロードマップの生成

**注記**: AI PMは開発をオーケストレートするのみです。

---

## 受け入れ基準

- AI PM パッケージが存在する
- ロードマップの解析が動作する
- 依存関係の解決が動作する
- GitHub Issueの生成が可能
- ダッシュボードがプロジェクトの状態を表示する
- テストが通過する
- ドキュメンテーションが完了する

---

## デリバラブル

報告:

- 変更されたファイル
- テスト結果
- 推奨されるコミットメッセージ

自動でプッシュしないこと。

**推奨コミットメッセージ**:
```
feat(ai-pm): implement Musasabi AI Project Manager foundation
```

---