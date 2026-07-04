```markdown
# 技術指示書: 案件 [Decision Needed] Desktop shell (Electron vs Tauri) and canonical design docs

## 概要
本指示書は、デスクトップシェルの選択と、公式デザインドキュメントの統合に関する技術的指針を示します。現状の作業経過とClaudeの推奨を基に、具体的な選択と手順を定義します。

## 目次
1. タスク概要
2. デスクトップシェルの選択
    - 現状
    - Claudeの推奨
    - 実装手順
3. 公式デザインドキュメントの統合
    - 現状
    - Claudeの推奨
    - 実装手順
4. 開発パイプラインの修正

---

## 1. タスク概要
- **タスク名:** デスクトップシェルの選定とデザインドキュメントの統合
- **関連ドキュメント:** `docs/ai-handoff/CLAUDE_QUESTIONS.md`, PR #165
- **質問ID:** Q-20260704-001, Q-20260704-002

## 2. デスクトップシェルの選択

### 現状
- 現在、`claude/musasabi-epic-beta-001-c6svi5` ブランチにてElectronを用いた `apps/desktop` が実装され、`tsc` にて検証済み。
- `docs/architecture/ARCHITECTURE.md` にはTauriの使用が記載されており、コンフリクトが発生している。

### Claudeの推奨
- **推奨:** Electronを継続使用。すでに実装されており、動作が保証されているため。

### 実装手順
1. `docs/architecture/ARCHITECTURE.md` を更新し、Electronを使用する旨を明文化する。
2. Electronベースの `apps/desktop` 実装を `main` ブランチにマージする。
3. 必要に応じて、Tauriを検討した背景やその代替理由をドキュメントに追記する。

## 3. 公式デザインドキュメントの統合

### 現状
- 2つの独立したドキュメントセットが存在。
  - `docs/*.md` 一式
  - `docs/ai-governance/Development_Bible.md` ほか

### Claudeの推奨
- **推奨:** `docs/*.md` をベースとして採用し、もう一方のセットのより詳細なセールスタクソノミーを統合する。

### 実装手順
1. `docs/*.md` セットをベースに新たなドキュメントストラクチャーを設計。
2. `sales`/`sales-brain`/`sales-coach`/`ai-sales-manager` のパッケージ分割を `docs/*.md` に統合。
3. 統合後のドキュメントを `main` ブランチにマージ。

## 4. 開発パイプラインの修正

### 現状
- `main` の `.github/workflows/ai-pipeline.yml` で、予期しない自動ループが発生するワークフローあり。

### 修正手順
1. `claude/musasabi-epic-beta-001-c6svi5` ブランチに存在する修正を `main` ブランチにマージ。
2. ワークフローを手動で確認し、動作を抑制する設定を行う。
3. プロジェクト内の利害関係者への周知とドキュメント化を行う。

---

この指示書に従い、円滑な開発作業が進むよう手配してください。
```