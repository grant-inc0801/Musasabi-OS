# Musasabi OS Development Bible v1.0

## 1. Purpose
Musasabi OS is a Windows-first AI employee operating system. It is not a simple chat application. It is a desktop AI platform that helps human workers learn, decide, execute, report, and improve business work safely.

The current product priority is **Epic β-001: Sales Department Operational Release**.

## 2. Development Mission
Build Musasabi OS so GRANT's sales department can use it every day.

The beta must support:

- Windows desktop app launch
- MUSA resident avatar
- Sales Workspace
- Learning Mode
- Sales Brain
- FileMaker integration
- Zoom Phone integration
- Voice Analysis
- Voice Engine
- Beta installer

## 3. Role of Claude Code
Claude Code acts as Lead Software Engineer and Senior Product Engineer.

Claude Code must:

1. Read this Bible before implementation.
2. Respect Company Genome and Organization Bible.
3. Analyze current code before editing.
4. Propose a plan before major changes.
5. Implement in small, safe commits.
6. Run tests before commit.
7. Never force push.
8. Never expose secrets.
9. Never enable AutoCall execution without explicit safety approval.

## 4. Priority Order
The implementation priority is:

1. Windows Desktop App
2. MUSA resident avatar
3. Sales Workspace beta polish
4. FileMaker sync
5. Zoom Phone sync
6. Voice Analysis
7. Voice Engine
8. 3D Avatar
9. Beta v0.9 installer

## 5. Engineering Principles
All code must favor:

- Local-first operation
- Safety over speed
- Deterministic behavior before LLM behavior
- Clear logs
- Testability
- Modular architecture
- Backward compatibility
- No secret leakage
- No destructive sync by default

## 6. Architecture Principles
Musasabi OS is organized as:

```text
apps/
  desktop/
packages/
  core/
  brain/
  memory/
  ai-engine/
  sales/
  sales-brain/
  sales-coach/
  integrations/
  avatar/
  voice-analysis/
  voice/
  ai-pm/
docs/
scripts/
tests/
```

## 7. Feature Development Rule
Every feature must include:

- Implementation code
- Test coverage where practical
- README or docs update
- CHANGELOG update
- Safe fallback if external credentials are missing

## 8. Sales Department Rule
The sales team must be able to work without technical setup.

Beta must prioritize:

- Easy startup
- Visible MUSA avatar
- Simple lead workflow
- Fast call note entry
- Learning from daily calls
- Clear FileMaker and Zoom status
- Coaching that is easy to understand

## 9. AI Safety Rule
AutoCall execution is disabled until all of the following exist:

- Admin approval
- Campaign configuration
- Appointment limit
- Working hours
- Emergency stop
- Audit logs
- Human handoff
- Compliance review

## 10. Git Rule
Claude Code may commit and push only after:

- Reviewing changed files
- Running available tests
- Confirming no secrets are present
- Avoiding force push

Recommended commit style:

```text
feat(scope): message
fix(scope): message
docs(scope): message
chore(scope): message
release(beta): message
```

## 11. Review Rule
Before closing tasks, confirm:

- Acceptance criteria met
- Tests pass or skipped with reason
- No conflict markers
- No secret patterns
- No unrelated large deletions

## 12. Current North Star
Musasabi OS Beta v0.9 is successful when a sales representative can:

1. Open Musasabi OS from Windows.
2. See MUSA avatar.
3. Open Sales Workspace.
4. Import or add leads.
5. Record call history and transcript.
6. Receive MUSA coaching.
7. Accumulate sales learning.
8. Sync with FileMaker and Zoom Phone safely.
