# Status

## Branch Map
- `main` — has `docs/ai-governance/`, `docs/architecture/`, `docs/ai-handoff/`
  (ChatGPT-authored governance/architecture docs and this handoff protocol).
  Does **not** yet have the Epic β-001 monorepo implementation.
- `claude/musasabi-epic-beta-001-c6svi5` (Claude Code's designated branch for
  this session) — has the full Epic β-001 work: disabled the runaway
  `ai-pipeline.yml` auto-loop, monorepo scaffold, `docs/*.md` design
  documents (Company Genome, Development Bible, Organization Bible, AI
  Employee Bible, Department Playbooks, Security Bible, Plugin SDK Bible,
  ARCHITECTURE.md), Phase 1 (Electron desktop shell), and Phase 2 (MUSA
  avatar state machine + overlay).
- `ai-handoff/claude-questions-20260704` (this branch, based on `main`) —
  adds the `docs/ai-handoff/` coordination files this document lives in.

## Important Safety Note
`main`'s `.github/workflows/ai-pipeline.yml` is still the **original,
unmodified runaway auto-loop** (triggers on every `issues: opened`, has GPT-4o
overwrite `main_app.py`/`spec.md` and auto-open a new issue every time). The
fix for this (changing the trigger to `workflow_dispatch` only) exists on
`claude/musasabi-epic-beta-001-c6svi5` but has not been merged to `main`. If
new issues are opened against `main`'s current state, the old runaway loop
could fire again.

## Current Blockers
Two decisions are logged in `CLAUDE_QUESTIONS.md` (Q-20260704-001, Q-20260704-002)
and tracked in a GitHub issue labeled `chatgpt-decision-needed`:

1. Desktop shell: Electron (implemented) vs Tauri (specified in
   `docs/architecture/ARCHITECTURE.md`)
2. Canonical design doc set: `docs/*.md` vs `docs/ai-governance/`+`docs/architecture/`

## Epic β-001 Progress (on claude/musasabi-epic-beta-001-c6svi5)
- Phase 1 — Windows Desktop App: implemented (Electron), `tsc` clean,
  runtime/installer unverified (this container cannot download the Electron
  binary — egress policy)
- Phase 2 — MUSA resident avatar: implemented (state machine + overlay
  window), 5/5 unit tests passing
- Phase 3-7 (Sales Workspace, FileMaker, Zoom Phone, Voice Analysis, Voice
  Engine): not started, blocked on the decisions above (package taxonomy and
  shell choice affect how these are structured)
