```markdown
# 技術指示書: S5-011 AI Pipeline Checkpoint Recovery

## 目的

AI Pipeline Checkpoint Recoveryを実装する。

現在のAIパイプラインは、後続のステップ（例：push）が失敗した場合、ジョブ全体が失敗として扱われている。これにより、不要な手戻りや混乱が生じている。

## 問題点

### 例

- S5-009では実装とコミットが正常に完了した。
- コミット: 62dca61
- しかし、リモートのmainに新しいコミットがあったためpushが失敗した。
- この時、pushのみが失敗した場合は実装を最初からやり直すべきではない。

## 必要な動作

AIパイプラインにチェックポイント機能を追加する。

### パイプラインステージ

1. issue_started
2. implementation_completed
3. tests_passed
4. commit_created
5. push_completed
6. issue_closed
7. next_issue_created

各チェックポイントは記録すること。

## 状態保存（SQLite / ファイル）

- プロジェクトに既にSQLiteパイプライン状態がある場合、それを使用。
- それ以外の場合は、ローカルファイルで状態を保存する:
  - `.github/ai-pipeline-state/`

### ファイル

- current-task.json
- checkpoints.json

## チェックポイントデータ

以下を保存する:

- issue_number
- issue_title
- task_key
- checkpoint
- status
- commit_hash
- timestamp
- error_message

## リカバリルール

- パイプラインが再実行された場合:
  - implementation_completedがあればコードを再生成しない（強制されない限り）
  - tests_passedがあれば実装を再実行しない
  - commit_createdがあれば重複するコミットを作成しない
  - pushが失敗した場合は安全なpushのみ再試行
  - issue_closedが失敗した場合はクローズのみ再試行
  - next_issue_createdが失敗した場合は次のissue作成のみ再試行

## 安全なPushの依存関係

- この問題はS5-010 Fix Auto Commit Push Rejectionに依存
- 安全なpushスクリプトが存在する場合、それを使用

## ワークフロー更新

- 更新対象: `.github/workflows/ai_pipeline.yml`
- 主要なステップ終了後にチェックポイントを書き込む処理を追加

## スクリプト

### 作成

- ファイル: `scripts/github/pipeline-checkpoint.js`

### サポートコマンド

- write
- read
- exists
- clear
- summary

#### 例

```
node scripts/github/pipeline-checkpoint.js write commit_created --commit 62dca61
```

## 失敗時の処理

- ステップが失敗した場合:
  - 失敗したチェックポイントを記録
  - issueにコメントを追加
  - ラベル`needs-review`を追加
  - issueをクローズしない
  - 次のissueを作成しない

## テスト

以下に対するテストを追加:

- チェックポイントの書き込み
- チェックポイントの読み取り
- チェックポイントの存在
- push失敗からのリカバリ
- 重複コミットの回避
- 重複するissue作成の回避
- 失敗チェックポイントの記録

## ドキュメント

以下を更新する:

- README.md
- CHANGELOG.md
- docs/AI_PIPELINE.md

## 受け入れ基準

- パイプラインがチェックポイントを記録する
- 再実行で失敗したpushから再開できる
- 重複コミットを回避
- 重複する次のissueを回避
- 失敗したステップがissueにラベル`needs-review`を付加
- ドキュメントが更新される
- テストが通過する

## 推奨コミットメッセージ

```
feat(github): add AI pipeline checkpoint recovery
```
```

この技術指示書は、AI Pipelineのチェックポイント機能を実装するための概要と詳細を提供します。これにより、特定のステップでの失敗から効率的に回復し、全体の再実行を防止することで生産性を向上させることができます。