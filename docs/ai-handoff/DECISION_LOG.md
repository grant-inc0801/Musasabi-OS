# Decision Log

Chronological record of directives and their outcomes. Newest entries at the top.

## 2026-07-04 — D-20260704-002 (decided directly by human product owner, in-session)

**Q-20260704-001 (Electron vs Tauri):** Resolved as **Electron**. `apps/desktop`
continues on the existing, already-verified Electron implementation
(Phase 1 + Phase 2 on `claude/musasabi-epic-beta-001-c6svi5`). No Tauri
rewrite. `docs/architecture/ARCHITECTURE.md` on `main` should be updated to
reflect Electron instead of Tauri as a follow-up.

**Q-20260704-002 (canonical design docs):** Resolved as **`docs/*.md`**
(Company Genome, Development Bible, Organization Bible, AI Employee Bible,
Department Playbooks, Security Bible, Plugin SDK Bible, ARCHITECTURE.md on
the epic branch) is canonical. `docs/ai-governance/*.md` and
`docs/architecture/*.md` are superseded. Useful ideas from the superseded set
(the more granular `sales`/`sales-brain`/`sales-coach`/`ai-sales-manager`
package split) may be folded into `docs/*.md` later as a refinement, not a
wholesale replacement.

Both decisions were given directly in chat by the human product owner rather
than via a `CHATGPT_DIRECTIVE.md` update, since the two are the same
authority in this project at present.

## 2026-07-04 — Safety fix

Merged PR #168: disabled `main`'s `ai-pipeline.yml` runaway auto-loop
(trigger changed to `workflow_dispatch`). Closed dummy issue #167
(`not_planned`) spawned by that loop before the fix landed.

## Resolved
- ~~Q-20260704-001 / Q-20260704-002~~ — see above.
