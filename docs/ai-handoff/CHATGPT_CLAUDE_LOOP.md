# ChatGPT ↔ Claude Code Autonomous Handoff Loop

## Purpose
This document defines the official collaboration loop between ChatGPT and Claude Code for Musasabi OS.

The goal is to avoid manual copy/paste of every decision. Claude Code must publish questions, blockers, options, and implementation results to GitHub. ChatGPT reads those GitHub files or issues, creates a formal directive, and writes it back to GitHub. Claude Code then reads and executes the directive.

## Roles

### ChatGPT
Acts as Chief AI Architect and Product Manager.

Responsibilities:
- Product decisions
- Architecture decisions
- Priority decisions
- Review guidance
- Claude Code directives
- Roadmap control
- Safety rules
- Final design authority

### Claude Code
Acts as Lead Software Engineer.

Responsibilities:
- Implementation
- Refactoring
- Tests
- Commit
- Push
- PR creation
- Issue updates
- Reporting blockers
- Reading ChatGPT directives from GitHub

### GitHub
Acts as the shared operating system between ChatGPT and Claude Code.

Responsibilities:
- Source code
- Issues
- PRs
- Decision records
- Directives
- Progress logs

## Source of Truth
The following documents are authoritative:

1. docs/ai-governance/Development_Bible.md
2. docs/ai-governance/Company_Genome.md
3. docs/ai-governance/Organization_Bible.md
4. docs/architecture/ARCHITECTURE.md
5. docs/ai-handoff/CHATGPT_DIRECTIVE.md
6. docs/ai-handoff/NEXT_ACTION.md
7. docs/ai-handoff/CLAUDE_RESPONSE.md
8. docs/ai-handoff/DECISION_LOG.md

If documents conflict, priority order is:

```text
Company Genome
  ↓
Development Bible
  ↓
Organization Bible
  ↓
Architecture
  ↓
ChatGPT Directive
  ↓
Current GitHub Issue / PR
```

## Required Handoff Files
Claude Code must use these files:

```text
docs/ai-handoff/
├ CHATGPT_DIRECTIVE.md
├ CLAUDE_QUESTIONS.md
├ CLAUDE_RESPONSE.md
├ DECISION_LOG.md
├ NEXT_ACTION.md
└ STATUS.md
```

## Claude Code Question Protocol
When Claude Code has a question, blocker, or options, it must not wait only inside the Claude UI.

Claude Code must create or update:

```text
docs/ai-handoff/CLAUDE_QUESTIONS.md
```

Format:

```markdown
# Claude Questions

## Question ID
Q-YYYYMMDD-001

## Status
waiting_for_chatgpt

## Context
Explain the current implementation state.

## Decision Needed
Explain the exact decision needed.

## Options
1. Option A
2. Option B
3. Option C

## Claude Recommendation
State recommended option and reason.

## Impact
Files, modules, risks, and timeline impact.
```

Claude Code should also create a GitHub issue labeled:

- `chatgpt-decision-needed`
- `architecture`
- `blocked`

Issue title format:

```text
[Decision Needed] Short decision title
```

## ChatGPT Directive Protocol
When ChatGPT responds, the decision must be written to:

```text
docs/ai-handoff/CHATGPT_DIRECTIVE.md
```

Format:

```markdown
# ChatGPT Directive

## Directive ID
D-YYYYMMDD-001

## Related Question
Q-YYYYMMDD-001

## Decision
Chosen option and final decision.

## Reason
Why this decision was made.

## Implementation Instruction
Exact steps Claude Code must execute.

## Safety Rules
What Claude Code must not do.

## Acceptance Criteria
How completion is judged.

## Next Action
What Claude Code should do next.
```

ChatGPT must also update:

```text
docs/ai-handoff/NEXT_ACTION.md
docs/ai-handoff/DECISION_LOG.md
```

## Claude Code Execution Protocol
Before starting any work, Claude Code must:

1. Pull latest `main`.
2. Read `docs/ai-handoff/CHATGPT_DIRECTIVE.md`.
3. Read `docs/ai-handoff/NEXT_ACTION.md`.
4. Confirm no unresolved `CLAUDE_QUESTIONS.md` item has status `waiting_for_chatgpt`.
5. Execute the latest directive.
6. Update `docs/ai-handoff/CLAUDE_RESPONSE.md`.
7. Commit and push if tests pass.

## Claude Response Format
Claude Code must write results to:

```text
docs/ai-handoff/CLAUDE_RESPONSE.md
```

Format:

```markdown
# Claude Response

## Completed Directive
D-YYYYMMDD-001

## Summary
What was implemented.

## Changed Files
List files.

## Tests
Commands and results.

## Commit
Commit SHA.

## Push Result
Success/failure.

## Remaining Issues
Any blockers.

## Next Recommendation
What should happen next.
```

## Autonomy Rules
Claude Code may continue automatically when:

- The task is already defined in the directive.
- No architecture decision is needed.
- No destructive operation is required.
- Tests pass.
- No secrets are involved.

Claude Code must stop and ask through GitHub when:

- Architecture conflict exists.
- Bible conflicts with existing code.
- A risky external integration decision is needed.
- File deletion affects major modules.
- AutoCall execution is involved.
- Credentials, tokens, or customer data are involved.

## Prohibited Actions
Claude Code must not:

- Force push.
- Expose secrets.
- Enable AutoCall execution.
- Delete major modules without directive.
- Close important issues #88, #93, #120 without explicit directive.
- Overwrite FileMaker production data.
- Call customers automatically.

## Current Priority
Epic β-001 Sales Department Operational Release.

Priority order:

1. Windows Desktop App
2. MUSA resident avatar
3. Sales Workspace beta polish
4. FileMaker sync
5. Zoom Phone sync
6. Voice Analysis
7. Voice Engine
8. 3D Avatar
9. Beta v0.9 installer

## Loop Summary

```text
Claude Code detects question/blocker
  ↓
Claude writes CLAUDE_QUESTIONS.md and creates GitHub issue
  ↓
ChatGPT reads GitHub
  ↓
ChatGPT writes CHATGPT_DIRECTIVE.md / NEXT_ACTION.md / DECISION_LOG.md
  ↓
Claude Code pulls latest
  ↓
Claude Code executes directive
  ↓
Claude writes CLAUDE_RESPONSE.md
  ↓
ChatGPT reviews and writes next directive
```
