# 技術指示書: S4-009 Development Conflict Resolver

## 目的
現在のAIパイプラインで発生するマージコンフリクトを解決するために、Development Conflict Resolverを実装します。これは、複数のAI生成の課題が同じファイル `spec.md` を変更することで発生するコンフリクトを解消することを目指しています。

## 問題点
- すべてのAI生成の実装が `spec.md` に書き込んでいます。
- 複数のブランチが `spec.md` を編集しています。
- GitHub がマージコンフリクトを発生させます。
- 人的リソースが手動で変更を選ぶ必要があります。

## 必要な変更
- 共通の `spec.md` の使用をやめ、課題ごとのスペックファイルに置き換えます。
- 課題ごとに以下の形式でファイルを作成します: `docs/specs/{issue_key}.md`

## 新しいスペックファイル構造
- `docs/specs/` ディレクトリを作成
- 各課題がそれぞれのファイルに書き込みます。

```
docs/specs/S4-001.md
docs/specs/S4-002.md
docs/specs/S4-003.md
docs/specs/S4-004.md
docs/specs/S4-009.md
```

## AI PM のルール
1. タイトルから課題キーを検出します。
2. その課題のスペックファイルのみを作成または更新します。
3. 他の課題のスペックファイルを上書きしません。
4. 共有 `spec.md` には書き込みません。
5. 既存の `spec.md` がある場合は非推奨とマークします。
6. `docs/specs/README.md` をインデックスとして維持します。

## 非推奨ファイル
- `spec.md` が存在する場合は削除せず、非推奨であることを示します。
- ヘッダーに "DEPRECATED" を追加し、代わりに `docs/specs/{issue_key}.md` を使用するよう記載します。

## スペック・インデックス
- `docs/specs/README.md` を作成し、以下をリストします。

```
| Issue | Title | Status | Spec |
|---|---|---|---|
| S4-009 | Development Conflict Resolver | active | docs/specs/S4-009.md |
```

## コンフリクト検出
- `scripts/github/check-spec-conflicts.js` を実装し、以下を検証します:
  - ワークフローが `spec.md` に書き込んでいないこと
  - 各課題がユニークなスペックファイルを持つこと
  - `docs/specs/README.md` が存在すること
  - 重複する課題のスペックファイルが作成されていないこと

## ワークフローの更新
- GitHub Actions / AI パイプラインを更新し、生成されたスペックが `docs/specs/{issue_key}.md` に書き込まれるようにします。

## 課題キー抽出
- 以下のような課題タイトル形式をサポートし、課題キーを抽出します。

```
S4-009 Development Conflict Resolver
[S4-009] Development Conflict Resolver
S4-009 — Development Conflict Resolver
S4-009: Development Conflict Resolver
```

- 抽出例: `S4-009`

## テスト
以下のテストを追加します:
- 課題キー抽出
- スペックファイルパス生成
- 非推奨 `spec.md` の検出
- `docs/specs/README.md` の生成
- `check-spec-conflicts` スクリプト
- ルート `spec.md` 書き込み禁止ルール

## ドキュメント
更新:
- `README.md`
- `CHANGELOG.md`
- `docs/SPRINT_SYSTEM.md`
- `docs/AI_PM.md`

## 受入基準
- `docs/specs` ディレクトリが存在すること
- `S4-009` スペックが `docs/specs/S4-009.md` に作成されていること
- 新しい課題に `spec.md` が使用されないこと
- 既存の `spec.md` が存在する場合、非推奨とマークされていること
- AI パイプラインが課題ごとのスペックファイルに書き込むこと
- `docs/specs/README.md` インデックスが存在すること
- コンフリクトチェッカーが存在すること
- テストが通過すること
- ドキュメントが更新されていること

## 制限事項
- 過去の `spec.md` は削除しないこと
- 関連のない課題のスペックを上書きしないこと
- 現在のプロダクトアーキテクチャを変更しないこと
- 関連のない営業機能を実装しないこと
- 自動でプッシュしないこと

## 納品物
報告:
- 変更されたファイル
- テスト結果
- 残るコンフリクトリスク
- 推奨されるコミットメッセージ

推奨コミット:

```
fix(github): use issue-specific specs to prevent AI merge conflicts
```