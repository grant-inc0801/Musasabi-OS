# ChatGPT Directive

## Directive ID
D-20260704-002

## Title
Adopt Tauri as the official Musasabi OS desktop shell

## Related Context
Claude Code asked whether to proceed with Electron or wait for GitHub-side confirmation. The product owner has confirmed that Musasabi OS should proceed with **Tauri**, not Electron.

## Decision
Use **Tauri + React + TypeScript** as the official Windows Desktop App foundation for Musasabi OS.

Electron is not the preferred production direction for Musasabi OS. Any existing Electron references should be treated as legacy wording unless they describe compatibility notes or migration history.

## Reason
Tauri is better aligned with Musasabi OS goals:

- Lightweight desktop runtime
- Lower memory usage than Electron
- Better fit for a resident desktop AI avatar
- Strong Windows desktop packaging path
- Rust backend extensibility
- Good long-term fit for local-first AI employee OS

## Implementation Instruction
Claude Code must proceed as follows:

1. Treat Tauri as the canonical desktop shell.
2. Update architecture docs to state Tauri is official:
   - `docs/architecture/ARCHITECTURE.md`
   - `docs/architecture/SYSTEM_OVERVIEW.md`
   - any desktop-related docs discovered during implementation
3. If any document says Electron is the main desktop shell, replace that with Tauri unless explicitly marked as legacy.
4. Continue Phase1 Windows Desktop App implementation using Tauri.
5. Do not wait on Issue #166 or older Electron wording before continuing.
6. Keep `docs/**/*.md` as formal design documents.
7. Continue the ChatGPT ↔ Claude Code GitHub handoff loop.
8. If new questions arise, write them to `docs/ai-handoff/CLAUDE_QUESTIONS.md` and create a `chatgpt-decision-needed` issue.

## Current Priority
Continue Epic β-001 in this order:

1. Windows Desktop App using Tauri
2. MUSA resident avatar
3. Sales Workspace beta polish
4. FileMaker sync
5. Zoom Phone sync
6. Voice Analysis
7. Voice Engine
8. 3D Avatar
9. Beta v0.9 installer

## Safety Rules
Claude Code must not:

- Force push.
- Expose secrets.
- Enable AutoCall execution.
- Delete major modules without directive.
- Close issues #88, #93, or #120 without explicit directive.
- Overwrite production FileMaker data.
- Reintroduce runaway issue-open workflow automation.

## PR and Issue Direction
- PR #168 may be merged because it disables the runaway issue-open workflow.
- Issue #167 should not become the next implementation priority. It may be closed as `not planned` or deferred because authentication is not part of the immediate Epic β-001 MVP path.

## Acceptance Criteria
This directive is complete when:

- Tauri is documented as the official desktop shell.
- Electron is removed from current architecture as the primary shell.
- Phase1 implementation continues on the Tauri path.
- Claude Code updates `CLAUDE_RESPONSE.md` with what changed.
- Claude Code continues toward Epic β-001.

## Next Action
Pull latest main, read this directive, update docs to confirm Tauri, then continue Phase1 Windows Desktop App implementation.
