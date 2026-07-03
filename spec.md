```markdown
# 技術指示書: S5-010 AI Pipeline Automatic Pull Request Review

## はじめに

本指示書は、AI開発パイプラインにおける自動Pull Request（PR）レビューシステムの実装に関するガイドラインを提供します。本システムはCodexが実装を完了しPRをオープンした際、AI PMが自動的にそのPRをレビューすることで、必要な場合にのみ人間による承認が行われる完全な自動開発ワークフローを実現します。

---

## ビジョン

- *Sprint.yaml* から始まり、以下の順で進むワークフローを構築します。

    ```
    Sprint.yaml
    ↓
    AI PM
    ↓
    GitHub Issue
    ↓
    Codex
    ↓
    Implementation
    ↓
    Automatic Pull Request
    ↓
    AI PM Review
    ↓
    Tests
    ↓
    Quality Score
    ↓
    Merge Ready
    ```

---

## レビューパイプライン

各Pull Requestは自動的に以下を実行する必要があります:

1. Build
2. Unit Tests
3. Integration Tests
4. Lint
5. Type Check
6. Architecture Validation
7. Sprint Validation
8. Security Scan
9. Documentation Check

---

## 必要なモジュール

### 新規作成

- `scripts/github/`
  - `review-pr.js`
  - `quality-score.js`
  - `architecture-validator.js`
  - `sprint-validator.js`
  - `documentation-validator.js`

### 更新

- `.github/workflows/`
  - `ai_pipeline.yml`
  - `pr_review.yml`

---

## AIレビュー

以下を自動でレビューします:

- コード品質
- 重複コード
- 命名の一貫性
- プロジェクト構造
- スプリント準拠
- アーキテクチャ準拠
- ドキュメント
- テストカバレッジ

---

## クオリティスコア

スコアの範囲は0〜100。以下のカテゴリで評価します:

- アーキテクチャ
- コード品質
- パフォーマンス
- メンテナンス性
- ドキュメント
- テスト
- セキュリティ
- 全体スコア

---

## PRコメント

自動コメント例:

```
## AI Review

Architecture: ✅

Tests: ✅

Documentation: ✅

Security: ✅

Performance: 93/100

Overall Score: 96/100

Recommendation:

Merge Ready
```

---

## ラベル

以下のラベルを自動で適用します:

- review-passed
- review-failed
- needs-review
- quality-high
- quality-medium
- quality-low

---

## マージ条件

次の条件を満たす場合のみマージを許可します:

- クオリティスコアが90以上
- テストがパス
- アーキテクチャ検証がパス
- スプリント検証がパス
- ドキュメントが更新済み

---

## フェイルハンドリング

レビューが失敗した場合:

- マージしない
- 理由をコメント
- `needs-review`ラベルを適用
- PRをオープンしたままにする

---

## ダッシュボード

AI PMダッシュボードを更新し、以下を表示:

- オープンPR
- レビューキュー
- 平均クオリティスコア
- レビュー所要時間
- 保留中のレビュー

---

## テスト

以下を実装:

- クオリティスコアリング
- アーキテクチャ検証
- スプリント検証
- ドキュメント検証
- ラベル適用
- マージ条件検証

---

## ドキュメント

以下を更新:

- README.md
- CHANGELOG.md
- docs/AI_PIPELINE.md
- docs/AI_REVIEW.md

---

## 受入基準

- PRが自動でレビューされる
- クオリティスコアが生成される
- ラベルが正しく適用される
- レビューコメントが生成される
- マージ条件が強制される
- ダッシュボードが更新される
- テストが合格する
- ドキュメントが更新される

---

## 制限事項

- 自動マージは行わない
- 失敗したテストを無視しない
- スプリント検証を無視しない
- 人間の承認が可能であること

---

## 納品物

報告書:

- 変更されたファイル
- テスト結果
- クオリティスコアの例
- レビューコメントの例
- 推奨コミット

推奨コミット:

```
feat(ai-pm): implement automatic pull request review pipeline
```

```

この指示書に沿って、PRレビューシステムを実装してください。
```