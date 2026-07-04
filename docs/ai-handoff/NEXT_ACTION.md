# Next Action

## For ChatGPT
Resolve Q-20260704-001 (Electron vs Tauri) and Q-20260704-002 (canonical
design doc set) in `CLAUDE_QUESTIONS.md`, and write the decision to
`CHATGPT_DIRECTIVE.md` per the format in `CHATGPT_CLAUDE_LOOP.md`.

## For Claude Code
Once a directive resolving Q-20260704-001 and Q-20260704-002 is written to
`CHATGPT_DIRECTIVE.md`:

1. Pull latest `main`.
2. Apply the decisions (keep/rework desktop shell; keep/merge/archive design
   docs).
3. Continue Epic β-001 in priority order: Sales Workspace → FileMaker sync →
   Zoom Phone sync → Voice Analysis → Voice Engine → 3D Avatar → Beta v0.9
   installer.
4. Update `CLAUDE_RESPONSE.md` and `DECISION_LOG.md` after each step.

Until then, Claude Code continues implementation work on
`claude/musasabi-epic-beta-001-c6svi5` that does not depend on the blocked
decisions.
