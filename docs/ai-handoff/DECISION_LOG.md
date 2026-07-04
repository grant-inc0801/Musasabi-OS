# Decision Log

Chronological record of directives and their outcomes. Newest entries at the top.

## 2026-07-04 — D-20260704-003: Musasabi OS の標準言語は日本語

人間プロダクトオーナーの指示(2026-07-04)により、**Musasabi OS の標準言語を
日本語とする**。以降のすべての報告・質問・コミュニケーション、および以下の
ドキュメント・成果物は日本語で記述する。

**日本語で記述するもの:**
- チャットでの回答すべて
- GitHub Issue、Pull Request(タイトル・本文)、Commit 以外の説明
- `docs/ai-handoff/CLAUDE_RESPONSE.md`
- `docs/ai-handoff/CLAUDE_QUESTIONS.md`
- `docs/ai-handoff/NEXT_ACTION.md`
- ChatGPT への質問、実装完了報告、エラー報告、テスト結果、進捗報告

**英語のままで構わないもの:**
- ライブラリ名・API名・クラス名・関数名・ディレクトリ名・ファイル名・Git コマンド

**報告フォーマット**(該当項目のみ記載):
`## 実装内容` / `## 修正内容` / `## テスト結果` / `## 発見した問題` /
`## 今後の課題` / `## 次に実施する内容` / `## ChatGPTへの確認事項(ある場合のみ)`

**自動実行ルール:** ChatGPT への設計判断が不要な場合は自動で次のタスクへ進む。
設計判断・セキュリティ・認証・アーキテクチャ変更が必要な場合のみ停止し、
GitHub Issue(ラベル `chatgpt-decision-needed`)および
`docs/ai-handoff/CLAUDE_QUESTIONS.md` に日本語で内容を記載する。

## 2026-07-04 — D-20260704-002 supersedes the earlier Electron resolution: Tauri is now official

`docs/ai-handoff/CHATGPT_DIRECTIVE.md` (Directive ID D-20260704-002, "Adopt
Tauri as the official Musasabi OS desktop shell", pushed to `main` in commit
`16478c7`) and the human product owner (directly in this chat) both confirm:
**Tauri + React + TypeScript is the official Windows Desktop App foundation
for Musasabi OS going forward.** This **supersedes** the Q-20260704-001
resolution below, which chose Electron.

Epic β-001 Phases 1, 2, and 8 (`apps/desktop`) were implemented and merged to
`main` on **Electron** before this reversal. That implementation is retained
as-is for the beta merge (see `docs/ARCHITECTURE.md` "デスクトップシェル方針"
section) and is now labeled **legacy/interim**, not the target architecture.
Migrating `apps/desktop` to Tauri is the top priority of the next phase.

Rationale given in the directive: lighter runtime, lower memory use, better
fit for a resident desktop AI avatar, stronger Windows packaging path, Rust
backend extensibility, better long-term fit for a local-first AI employee OS.

## 2026-07-04 — Q-20260704-001 / Q-20260704-002 (decided directly by human product owner, in-session; #1 later superseded above)

**Q-20260704-001 (Electron vs Tauri):** ~~Resolved as **Electron**~~ —
**superseded 2026-07-04, see entry above. Tauri is now official.**

**Q-20260704-002 (canonical design docs):** Resolved as **`docs/*.md`**
(Company Genome, Development Bible, Organization Bible, AI Employee Bible,
Department Playbooks, Security Bible, Plugin SDK Bible, ARCHITECTURE.md on
the epic branch) is canonical. `docs/ai-governance/*.md` and
`docs/architecture/*.md` are superseded. Useful ideas from the superseded set
(the more granular `sales`/`sales-brain`/`sales-coach`/`ai-sales-manager`
package split) may be folded into `docs/*.md` later as a refinement, not a
wholesale replacement. This resolution stands unchanged.

Both decisions were given directly in chat by the human product owner rather
than via a `CHATGPT_DIRECTIVE.md` update, since the two are the same
authority in this project at present.

## 2026-07-04 — Safety fix

Merged PR #168: disabled `main`'s `ai-pipeline.yml` runaway auto-loop
(trigger changed to `workflow_dispatch`). Closed dummy issue #167
(`not_planned`) spawned by that loop before the fix landed.

## Resolved
- ~~Q-20260704-002~~ — see above (canonical docs, unchanged).

## Superseded
- ~~Q-20260704-001 (Electron)~~ — see D-20260704-002 above (Tauri is now official).
