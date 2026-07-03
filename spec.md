```markdown
# 技術指示書: S5-012 AI Pipeline Review Gate 実装

## 目的

Musasabi AIの完成タスクが次のタスクに移る前に、必ずレビューゲートを通過する仕組みを導入する。

## 問題点

現行のパイプラインは、コミット/プッシュ後にレビュー未完了でも継続可能。これにより、品質に問題のある変更が自動化ループを続けるリスクがある。

## レビューゲート要件

次のタスクを開始する前に確認すべき項目:

1. テストがパスしていること
2. マージコンフリクトマーカーがないこと
3. 秘密情報が公開されていないこと
4. README / CHANGELOG が更新されていること
5. タスク受入れ基準がチェックされていること
6. 変更されたファイルが報告されていること
7. 提案されたコミットが存在すること

## レビューステータスのラベル

- review-pending
- review-approved
- review-rejected
- needs-review

## 必須の挙動

### プッシュが成功した場合:
- 問題にレビューサマリーをコメントする
- review-pending ラベルを追加する
- 問題をまだ閉じない
- 次の問題は作成しない

### review-approved ラベルが追加された場合:
- 現在の問題を閉じる
- Sprint.yamlから次の問題を作成する
- review-pending を削除する

### review-rejected ラベルが追加された場合:
- 問題は開いたままにする
- needs-review を追加する
- 次の問題は作成しない

## ワークフロートリガー

GitHub Actionsの更新:
```yaml
on:
  issues:
    types:
      - labeled
```

### review-approved ラベル時:
- 問題を閉じる
- 次の問題を作成する

### review-rejected ラベル時:
- 問題は開いたまま
- needs-review を追加

## スクリプト

作成: `scripts/github/review-gate.js`

サポートする機能:
- summarize
- approve
- reject
- validate

## バリデーションチェック

以下を実装:
- コンフリクトマーカーチェック
- 秘密情報パターンチェック
- ドキュメント更新チェック
- テスト結果チェック
- 受入れ基準チェック

### 秘密情報パターンチェック

検出する可能性のある秘密情報:
- OPENAI_API_KEY
- ANTHROPIC_API_KEY
- ZOOM_CLIENT_SECRET
- FILEMAKER_PASSWORD
- sk-
- ghp_
- github_pat_

秘密情報の値は出力しない。

## ドキュメントの更新

更新:
- README.md
- CHANGELOG.md
- docs/AI_PIPELINE.md
- docs/SPRINT_SYSTEM.md

## テスト

以下のテストを追加:
- レビューサマリー生成
- review-pending ラベル
- review-approved フロー
- review-rejected フロー
- コンフリクトマーカー検出
- 秘密情報パターン検出
- 承認後にのみ次の問題

## 受入基準

- パイプラインは review-pending で停止する
- review-approved になるまで問題はクローズしない
- review-approved になるまで次の問題は作成しない
- review-rejected は問題を開いたままにする
- needs-review は拒否時に追加される
- 秘密情報チェックが存在する
- コンフリクトチェックが存在する
- テストに成功する
- ドキュメントが更新されている

## 提案されたコミット

```
feat(github): add AI pipeline review gate
```
```