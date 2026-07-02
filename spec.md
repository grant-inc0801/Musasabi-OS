以下に、指定されたタスク「S5-010 Fix Auto Commit Push Rejection」のための技術指示書をMarkdown形式で作成しました。

```markdown
# 技術指示書: S5-010 Fix Auto Commit Push Rejection

## 概要

GitHub Actionsによる自動コミットのプッシュが、リモートのmainブランチに新しいコミットがある場合に拒否される問題を修正します。

## 問題の詳細

現在のAIパイプラインはコミットには成功しますが、次のエラーによりプッシュに失敗します。

```
remote contains work that you do not have locally
```

このエラーは、リモートブランチに存在する新しいコミットをローカルに取得していないことが原因です。

## 必須修正

プッシュを実行する前に、ワークフローはリモートの最新のmainブランチをフェッチしてリベースする必要があります。

## 技術的詳細

### ワークフローの更新

GitHub Actionsの自動コミットステップを以下のフローに基づいて更新します。

#### 推奨フロー

```bash
git fetch origin main
git rebase origin/main
git push origin main
```

### 手順

1. **Git Fetch**: リモートの最新のmainブランチをフェッチします。
   ```bash
   git fetch origin main
   ```
   
2. **Git Rebase**: リモートのmainブランチに基づいてリベースを実施します。
   ```bash
   git rebase origin/main
   ```

3. **Git Push**: 自動コミットをプッシュします。
   ```bash
   git push origin main
   ```

### 更新対象ファイル

- `.github/workflows/your-github-actions-file.yml` (適切なGitHub Actionsワークフローファイルを指定してください)

### 変更に伴う検証

修正後、以下の観点で動作検証を行います。

- リモートブランチに新しいコミットがあった場合でも、自動コミットが問題なくプッシュされること。
- 全体のワークフローが予期せぬエラーなく完了すること。

## 終了条件

- 問題の再発が防止され、GitHub Actions内で自動コミットのプッシュが正常に行われることが確認できた状態。

---

この技術指示書に基づき、問題の修正とワークフローの更新を実施してください。質問や不明点がありましたら、プロジェクト管理者までお問い合わせください。
```

この指示書は、問題の詳細、修正のための具体的な手順、および確認すべき点を含む包括的な資料として設計されています。この文書を元に実装を進めてください。