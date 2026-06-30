# 技術指示書: S4-013 Sprint Manager UI

## 概要

本ドキュメントは、Musasabi OS内で開発スプリントを開始および監視できるようにするためのSprint Manager UIの実装に関する技術指示書です。このUIによって、CEOは手動操作をせずにスプリントドリブンなワークフローを管理できるようになります。

## ビジョン

- ユーザ: CEO
- 流れ: CEO → Sprint Manager UI → AI PM → Sprint.yaml → GitHub Issue Generation → Codex → Review → 次の課題

## 要件

### 必須UI

Sprint Manager画面を作成します。ナビゲーション項目は以下のいずれかとします。

- Development
- AI PM

### 画面セクション

#### 1. アクティブスプリント

表示内容:
- スプリントキー
- スプリントタイトル
- スプリントステータス
- 進捗率
- 現在のタスク
- 次のタスク
- ブロックされているタスク

#### 2. スプリントコントロール

ボタン:
- スプリント開始
- スプリント一時停止
- スプリント再開
- スプリント停止
- 次の課題生成
- ステータス更新

#### 3. タスクリスト

表示内容:
- タスクキー
- タイトル
- ステータス
- 依存関係
- GitHub イシュー番号
- 担当者
- 更新日時

ステータスは以下から選択:
- pending
- ready
- in_progress
- review
- completed
- blocked

#### 4. レビュキュー

表示内容:
- レビュー待ちのタスク
- テスト結果
- 変更ファイル数
- 推奨コミット
- 承認状況

#### 5. スプリントログ

表示内容:
- sprint.started
- issue.created
- issue.completed
- review.requested
- review.approved
- sprint.completed

## バックエンド

既存のAI PMモジュールを利用可能であれば使用します。以下のファイルを作成または更新します。

- `packages/ai-pm/src/sprint/sprintManager.js`
- `packages/ai-pm/src/sprint/sprintRepository.js`
- `packages/ai-pm/src/sprint/sprintDashboardService.js`
- `packages/ai-pm/src/sprint/sprintControlService.js`

## SQLite

以下のテーブルを作成または更新します。

### sprintsテーブル

- id
- sprint_key
- title
- description
- status
- progress
- started_at
- completed_at
- created_at
- updated_at

### sprint_tasksテーブル

- id
- sprint_id
- task_key
- title
- status
- dependency_key
- github_issue_number
- assignee
- created_at
- updated_at

### sprint_eventsテーブル

- id
- sprint_id
- event_type
- detail_json
- created_at

## スプリント定義

定義は`docs/sprints/`から読み込みます。例として`docs/sprints/Sprint-005.yaml`を使用します。

## 初期スプリント

`docs/sprints/Sprint-005.yaml`ファイルを作成します。

### タイトル

Sales Department Operational MVP

### タスク

- S5-001 Zoom Phone Real-Time Sync
- S5-002 FileMaker Two-Way Sync
- S5-003 Voice Analysis Engine
- S5-004 Real-Time Sales Coach Upgrade
- S5-005 AI Sales Manager Dashboard
- S5-006 Sales KPI Forecast

## コントロールの挙動

### スプリント開始

- スプリントyamlを読み込む
- スプリントレコードを生成
- タスクレコードを生成
- 初めのタスクをreadyに設定

### 次の課題生成

- 初めのreadyタスクを探す
- GitHubイシューを生成
- タスクステータスをin_progressに設定
- GitHubイシュー番号を保存

### スプリント一時停止

- スプリントステータスをpausedに設定

### スプリント再開

- スプリントステータスをactiveに設定

### スプリント停止

- スプリントステータスをstoppedに設定

## GitHub統合

スプリントタスクからIssueを生成します。Issueタイトルフォーマットは以下としてください。

- 例: S5-001 Zoom Phone Real-Time Sync

ラベル:

- codex-ready
- sprint-5
- high-priority

AIによるIssueタイトルの生成は許可しません。

## テスト

以下のテストを実装します。

- スプリントyamlパース
- スプリント開始
- タスクレコード生成
- 進捗率計算
- 次のreadyタスク検出
- イシュージェネレーション
- スプリント一時停止/再開/停止
- スプリントイベントログ

## ドキュメント

以下を更新します。

- README.md
- CHANGELOG.md
- docs/SPRINT_SYSTEM.md
- docs/AI_PM.md

## 制約事項

- 関連のないセールス機能は実装しません。
- AutoCall機能は実装しません。
- Sprintタスクの作成をOpenAIに委ねません。
- 自動マージを許可しません。
- 自動デプロイを許可しません。
- GitHubトークンを公開しません。

## 受け入れ基準

- Sprint Manager画面が存在する
- アクティブスプリントが表示される
- スプリントの進捗が表示される
- タスクリストが表示される
- スプリント開始が機能する
- 次の課題生成が機能する
- 一時停止/再開/停止が機能する
- スプリントログが保存される
- Sprint-005.yamlが存在する
- テストが合格する
- ドキュメントが更新されている

## 納品物

変更されたファイル、テスト結果、推奨コミットを報告してください。自動でプッシュはしないでください。

### 推奨コミット

```git
feat(ai-pm): add Sprint Manager UI
```

以上が、Sprint Manager UIの実装に関する詳細な技術指示書です。