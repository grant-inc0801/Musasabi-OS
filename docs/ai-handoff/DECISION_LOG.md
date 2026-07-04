# Decision Log

Chronological record of directives and their outcomes. Newest entries at the top.

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
