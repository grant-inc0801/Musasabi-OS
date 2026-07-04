# ChatGPT Directive

## Directive ID
D-20260704-001

## Title
Establish GitHub-based ChatGPT ↔ Claude Code execution loop

## Decision
Claude Code must no longer rely only on in-session questions for architecture decisions. All questions, blockers, options, execution results, and next actions must be reflected through GitHub handoff files.

## Reason
Musasabi OS is now a multi-agent development project. GitHub must act as the shared source of truth between ChatGPT, Claude Code, Codex, and the human product owner.

## Implementation Instruction
Claude Code must implement this operating loop immediately:

1. Read `docs/ai-handoff/CHATGPT_CLAUDE_LOOP.md`.
2. Create or update the missing handoff files:
   - `docs/ai-handoff/CLAUDE_QUESTIONS.md`
   - `docs/ai-handoff/CLAUDE_RESPONSE.md`
   - `docs/ai-handoff/DECISION_LOG.md`
   - `docs/ai-handoff/NEXT_ACTION.md`
   - `docs/ai-handoff/STATUS.md`
3. Whenever a question appears in Claude Code, write it to `CLAUDE_QUESTIONS.md` and create a GitHub issue labeled `chatgpt-decision-needed`.
4. Wait for ChatGPT to update `CHATGPT_DIRECTIVE.md` when the decision is required.
5. After every implementation step, write the result to `CLAUDE_RESPONSE.md`.
6. Continue implementation automatically when no decision is needed.

## Current Priority
Continue Epic β-001 in this order:

1. Windows Desktop App
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

## Acceptance Criteria
This directive is complete when:

- All handoff files exist.
- Claude Code reads `CHATGPT_DIRECTIVE.md` before implementation.
- Claude Code writes questions to `CLAUDE_QUESTIONS.md`.
- Claude Code writes results to `CLAUDE_RESPONSE.md`.
- GitHub issues are used for decision-needed items.
- Epic β-001 implementation continues after the handoff loop is established.

## Next Action
Claude Code should pull latest main, read this directive, create missing handoff files, then continue Phase1 Windows Desktop App implementation.
