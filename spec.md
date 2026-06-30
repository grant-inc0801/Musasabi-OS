# 技術指示書: S2-003 GitHub Issue Auto Generator

## 目的

GitHub Issueの自動作成を実装します。  
現在のフローでは次の仕様を生成しますが、GitHub Issueを作成していません。このループを完全に自動化します。

## 現行フロー

- Issue
- Codex
- Commit
- 次のタスクを生成
- Issueを閉じる

(ここで停止)

## 必要なフロー

- Issue
- Codex
- Commit
- 次のタスクを生成
- 次のGitHub Issueを作成
- ラベルを付与
- マイルストーンを設定
- 現行Issueにコメント
- 現行Issueを閉じる
- 待機

## 実装内容

ChatGPTが次のタスクを生成した後に、自動的に以下のコマンドを実行します。

```bash
gh issue create
```

これには`GITHUB_TOKEN`を使用します。

## 要件

### スクリプト作成

作成する再利用可能なスクリプト: `scripts/github/create-next-issue.js`  
スクリプトの機能:

1. **ロードマップデータの読み込み**: `docs/codex/roadmap/sprint-roadmap.json` から読み込み。
2. **現行Issueの特定**: 現行のIssueを識別。
3. **次のIssueの特定**: 次に作成すべきIssueを識別。
4. **GitHub Issueの生成**: 次のIssueを作成。
5. **ラベルの付与**: Issueにラベルを追加。
6. **マイルストーンの設定**: Issueにマイルストーンを設定。
7. **現在のIssueにコメント**: 作成されたIssueのURLをコメントとして追加。
8. **終了**: スクリプトの実行を完了。

### 重複防止

新たなIssueを作成する前に、次の操作を実行します。

- **検索**: 現在開いているIssuesを検索。
- **スキップ**: 既に存在するタイトルの場合、作成をスキップ。

### ロギング

以下の情報を出力します。

- 現在のIssue
- 次のIssue
- Issue番号
- Issue URL

## 受け入れ条件

- あるIssueを閉じることで、自動的に次のIssueが作成されること。
- 手動でのGitHub操作を必要としないこと。

## 提案されるコミットメッセージ

```
feat(github): automate next issue creation
```