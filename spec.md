```markdown
# 技術指示書: S5-009 AI Pipeline Branch Isolation

## 概要

AI開発パイプラインを改善するため、直接のmainへのコミットから、タスク専用のブランチに移行します。これにより、AI生成タスクの相互ブロックを防止し、プッシュやリベースの競合を減少させます。

## 問題点

現在のAIパイプラインでは、mainへの直接コミットが行われています。複数のAIタスクが近接して実行されると、以下のようなプッシュ失敗が発生します。

- リモートにローカルが持っていない作業が含まれている
- 最初にフェッチが必要
- 非高速フォワード更新が拒否される

安全なリベースを用いても、並行ワークフローが衝突する可能性があります。

## 必要な変更点

各AIタスクは専用のブランチを作成する必要があります。

ブランチ形式:

```
ai/{issue-key}-{slug}
```

例:

- ai/AV-007-desktop-assistant-behavior
- ai/S5-008-git-auto-sync-before-push
- ai/S5-009-branch-isolation

## 必要なフロー

1. イシュータイトルからイシューキーを抽出
2. 最新のmainからブランチを作成
3. タスクを実装
4. 変更点をコミット
5. ブランチをプッシュ
6. プルリクエストを作成
7. mainへ直接プッシュしない

## Gitフロー

```bash
git fetch origin main

git checkout -B ai/{issue-key}-{slug} origin/main

# 変更を実装

git add .

git commit -m "..."

git push -u origin ai/{issue-key}-{slug}
```

## プルリクエスト

プルリクエストを自動で作成します。

- PRタイトル: `{issue-key} {issue-title}`
- PR本文には以下を含む:
  - リンクされたイシュー
  - 変更されたファイルの概要
  - テスト結果
  - 推奨レビュワー
  - リスク

## 現在のイシュー管理

ブランチをプッシュしただけでイシューを閉じないでください。

- イシューにPR URLをコメント
- ラベルを 'review' に設定
- PRがマージされるまでイシューを開いたままにする

## マージルール

自動マージしないでください。マージ前に人またはAIのPMレビューが必要です。

## 必須ファイルの更新

更新が必要なファイル:

- `.github/workflows/ai_pipeline.yml`
- `scripts/github/extract-issue-key.js`
- `scripts/github/create-task-branch.sh`
- `scripts/github/create-pr.js`
- `docs/AI_PIPELINE.md`

## 安全ルール

- mainに強制プッシュしない
- mainに直接コミットしない
- PRが存在する前にイシューを閉じない
- 現在のPRがマージまたは承認される前に次のイシューを作成しない
- PR作成に失敗した場合、イシューにラベル "needs-review" を追加する

## テスト

以下のテストを追加:

- イシューキー抽出
- ブランチ名生成
- ブランチスラッグのサニタイズ
- ワークフローがmainにプッシュしないこと
- PR本文生成
- イシューコメント生成

## ドキュメント更新

以下を更新:

- `README.md`
- `CHANGELOG.md`
- `docs/AI_PIPELINE.md`
- `docs/SPRINT_SYSTEM.md`

## 受け入れ基準

- AIタスクブランチが作成される
- AIパイプラインがmainに直接プッシュしなくなる
- PRが自動で作成される
- イシューにPRリンクコメントが付く
- PRがマージされるまでイシューがオープンのままになる
- 直接mainプッシュが無効化される
- テストが合格する
- ドキュメントが更新される

## 提案コミットメッセージ

```
chore(github): isolate AI pipeline work in task branches
```
```