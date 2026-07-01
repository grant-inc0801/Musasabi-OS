```markdown
# 技術指示書: S5-006 AI Pipeline Issue Title Standardization

## 目的

AIが生成するGitHub Issueのタイトルを標準化することで、現在のパイプラインでのタイトルの不整合を解消し、Sprintの追跡を容易にします。

## 必要な動作

全てのAIが生成する開発課題はSprintキー形式を用いる必要があります。

形式: `S{number}-{task_number} Title`

### 例:
- S5-001 Zoom Phone Real-Time Sync
- S5-002 FileMaker Two-Way Sync
- S5-003 Voice Analysis Engine

## 遵守すべきルール

### タイトルの開始禁止文字列:
- `[NEXT]`
- `【次へ】`
- `次へ`
- `Next`

### ルール:
- AIにIssueキーを新たに作成させてはいけません。
- Issueキーは以下の場所から取得する必要があります:
  - `docs/sprints/*.yaml`
  - `docs/codex/roadmap/*.json`

## 必要なファイルの作成または更新

- `scripts/github/issue-title-normalizer.js`
- `scripts/github/validate-issue-title.js`
- `scripts/github/create-next-issue-from-sprint.js`
- `docs/AI_PIPELINE.md`

## バリデーション

新規にIssueを作成する前に:
1. Sprint定義からタスクキーを抽出
2. タスクキーとタスクタイトルを利用してタイトルを生成
3. タイトル形式を検証
4. 無効な生成タイトルを拒否
5. バリデーション結果をログに記録

## 既存のオープンなIssueのクリーンアップ

### スクリプト作成:
- `scripts/github/cleanup-invalid-ai-issue-titles.js`

このスクリプトは無効なタイトル接頭辞を持つオープンなAI生成課題を特定し、以下のいずれかを行います:
- ラベル追加: `invalid-ai-title`
- タイトルが無効であることをコメント
- 完了していない限り自動でクローズしない

## テスト

以下のテストを追加:
- 有効なSprintタイトル
- 無効な`[NEXT]`タイトル
- 無効な`【次へ】`タイトル
- Sprintタスクから生成されたタイトル
- Sprintキー不足による拒否
- 無効なタイトルの検出とクリーンアップ

## ドキュメンテーションの更新

- `README.md`
- `CHANGELOG.md`
- `docs/AI_PIPELINE.md`
- `docs/SPRINT_SYSTEM.md`

## 受け入れ基準

- 新規IssueはSprintキー形式のみを使用
- `[NEXT]`タイトルは拒否
- `【次へ】`タイトルは拒否
- IssueタイトルはSprintファイルから生成
- 無効な既存のAI Issueにはラベルが付く
- テストは全て合格
- ドキュメントは更新済み

## 推奨コミットメッセージ

```
fix(github): standardize AI-generated issue titles
```
```