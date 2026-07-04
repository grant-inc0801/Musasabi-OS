# Claude Questions

## Question ID
Q-20260704-001

## Status
resolved (2026-07-04, decided directly by the human product owner in-session — option 1, keep Electron)

## Context
Working on branch `claude/musasabi-epic-beta-001-c6svi5` (the branch this Claude
Code session is scoped to), Phase 1 (Windows desktop shell) and Phase 2 (MUSA
resident avatar state machine + overlay) of Epic β-001 were implemented using
**Electron** (`apps/desktop`): main process, tray, login auto-launch,
`electron-builder` NSIS config, and an avatar overlay `BrowserWindow` wired to
`packages/avatar-2d`'s state machine via IPC. `tsc` builds cleanly and
`packages/avatar-2d` has 5 passing unit tests (`node --test`).

Independently, `docs/architecture/ARCHITECTURE.md` (pushed directly to `main`
in commit 9886c40, "docs: add Musasabi OS architecture overview") specifies
**Tauri** as the desktop shell:

```
Windows Desktop
  ↓
Tauri / Desktop Shell
  ↓
React UI
  ...
```

## Decision Needed
Should `apps/desktop` be built on Electron (already implemented and verified
in this session) or rebuilt on Tauri (as specified in
`docs/architecture/ARCHITECTURE.md`)?

## Options
1. Keep Electron. Update `docs/architecture/ARCHITECTURE.md` (and
   `docs/ARCHITECTURE.md` on the epic branch) to reflect Electron as the
   chosen shell. No rework needed; Phase 1/2 continue as-is.
2. Switch to Tauri. Discard the existing Electron `apps/desktop`
   implementation (main.ts, preload.ts, electron-builder config, avatar
   overlay window) and reimplement the desktop shell in Rust + Tauri +
   React, keeping `packages/avatar-2d`'s state machine (framework-agnostic
   TypeScript, portable to either shell).

## Claude Recommendation
Option 1 (keep Electron). Rationale: Phase 1 and Phase 2 are already
implemented and verified (`tsc` clean, avatar-2d tests passing) on the
`claude/musasabi-epic-beta-001-c6svi5` branch; switching to Tauri discards
working, tested code and adds a Rust toolchain dependency with no stated
reason for the change in the architecture doc. If there is a specific reason
Tauri is preferred (packaging size, memory footprint, security model), please
state it in the directive so it can be weighed against the rework cost.

## Impact
- Files: `apps/desktop/**` (entire app), `docs/architecture/ARCHITECTURE.md`,
  `docs/ARCHITECTURE.md`
- Risk: Rebuilding on Tauri delays Phase 1 completion and blocks Phase 3+
  (Sales Workspace, FileMaker/Zoom Phone sync, Voice) until the shell is
  re-established
- Timeline: Electron path is ready now; Tauri path requires new setup from
  zero

---

## Question ID
Q-20260704-002

## Status
resolved (2026-07-04, decided directly by the human product owner in-session — option 1, docs/*.md canonical, folding in useful ideas from the other set later)

## Context
Two independent sets of foundational design documents currently exist:

- `docs/COMPANY_GENOME.md`, `docs/DEVELOPMENT_BIBLE.md`,
  `docs/ORGANIZATION_BIBLE.md`, `docs/AI_EMPLOYEE_BIBLE.md`,
  `docs/department-playbooks/`, `docs/SECURITY_BIBLE.md`,
  `docs/PLUGIN_SDK_BIBLE.md`, `docs/ARCHITECTURE.md` — authored on
  `claude/musasabi-epic-beta-001-c6svi5` at the explicit, detailed direction
  of the human product owner in this session (including a specific
  8-headquarters org chart, department playbooks, security rules, etc.)
- `docs/ai-governance/Development_Bible.md`, `docs/architecture/ARCHITECTURE.md`,
  `docs/architecture/SYSTEM_OVERVIEW.md` — pushed directly to `main` by an
  external process identifying itself as ChatGPT acting as "Chief AI
  Architect / final design authority"

These differ in package taxonomy (`ai-core`/`ai-company`/`avatar-2d`/
`avatar-3d`/`voice-engine` vs. `core`/`brain`/`ai-engine`/`sales`/
`sales-brain`/`sales-coach`/`ai-pm`/`integrations`/`avatar`/`voice`), in
detail level (the `docs/*.md` set includes a full org chart, department
playbooks, and security/plugin bibles; the `ai-governance`/`architecture` set
is shorter and does not yet have Company Genome or Organization Bible files
despite `CHATGPT_CLAUDE_LOOP.md` listing them as source of truth), and in
some product framing details.

## Decision Needed
Which document set is canonical going forward, or should they be merged into
one?

## Options
1. `docs/*.md` (this session's output) is canonical. Treat
   `docs/ai-governance/*.md` and `docs/architecture/*.md` as superseded;
   remove or archive them once this is confirmed.
2. `docs/ai-governance/*.md` + `docs/architecture/*.md` is canonical. Treat
   this session's `docs/*.md` set as superseded; remove or archive it.
3. Merge both into a single canonical set (would need a follow-up pass to
   reconcile package names, org chart details, and priority ordering).

## Claude Recommendation
Option 1, with willingness to fold in genuinely new content from the other
set (e.g., the `packages/sales-brain`, `packages/sales-coach`,
`packages/ai-sales-manager` domain breakdown is more granular than this
session's single `ai-core` package and may be worth adopting). Rationale:
`docs/*.md` was built chapter-by-chapter at the explicit, itemized direction
of the human product owner this session (Company Genome content, the
8-headquarters org chart, department playbooks) and is significantly more
complete (Organization Bible, AI Employee Bible, Department Playbooks,
Security Bible, and Plugin SDK Bible have no equivalent yet in
`ai-governance`/`architecture`).

## Impact
- Files: `docs/*.md` vs `docs/ai-governance/*.md` + `docs/architecture/*.md`
- Risk: Two "sources of truth" left unresolved will cause future
  implementation to silently diverge depending on which doc an agent reads
  first
- This also determines which package names (`ai-core` vs `sales`/
  `sales-brain`/`sales-coach`, `voice-engine` vs `voice`, `avatar-2d`/
  `avatar-3d` vs `avatar`) later phases (Sales Workspace, FileMaker/Zoom
  Phone sync, Voice Analysis, Voice Engine) should use
