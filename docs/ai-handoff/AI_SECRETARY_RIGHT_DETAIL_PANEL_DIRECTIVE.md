# AI Secretary Right Detail Panel Directive

## Purpose
Integrate the AI Executive Secretary and Chief of Staff roles into the management screen assistant area.

When no department detail is selected, the right-side detail panel should become the AI Secretary workspace.

## Right Panel Behavior

### Default State
If no department cylinder panel is selected, show AI Secretary mode.

### Department Detail State
If a department is selected, show that department's detail and AI employee interaction screen.

### Return Behavior
When the selected department is closed or cleared, return to AI Secretary mode.

## AI Secretary Responsibilities
The AI Secretary panel should organize and summarize:
- departments requesting approval,
- proposal source department,
- proposal type,
- proposal summary,
- recommended decision,
- automation candidates,
- new AI combination ideas,
- urgent risks,
- pending reviews,
- next recommended actions.

## Unified Card Format
Use a consistent card format for all secretary items.

Required fields:
- Category
- Source Department
- Related AI Employee
- Status
- Priority
- Summary
- Reason
- Recommended Action
- Approval Needed
- Expected Impact
- Risk Level
- Suggested Next Step

## Card Categories
- Approval Request
- Department Proposal
- Automation Candidate
- AI Combination Idea
- Risk Alert
- KPI Warning
- Workflow Improvement
- New Business Idea
- Follow-up Reminder

## Approval Request Example
Category: Approval Request
Source Department: Development Department
Related AI Employee: AI PM
Status: Waiting for Approval
Priority: High
Summary: Request to create the next implementation Issue.
Reason: Current sprint item is complete and next task can begin.
Recommended Action: Approve Issue creation mock.
Approval Needed: Yes
Expected Impact: Faster development loop.
Risk Level: Low
Suggested Next Step: Approve or request revision.

## Automation Candidate Example
Category: Automation Candidate
Source Department: Sales Department
Related AI Employee: Sales Coach AI
Status: Proposed
Priority: Medium
Summary: Automate daily call result summary.
Reason: Repeated manual reporting can be converted into a template workflow.
Recommended Action: Create workflow mock.
Approval Needed: No for mock, Yes for production connection.
Expected Impact: Reduce reporting time.
Risk Level: Low
Suggested Next Step: Add to workflow backlog.

## AI Combination Idea Example
Category: AI Combination Idea
Source Department: Publishing Department
Related AI Employee: Chief Editor AI and Sales Coach AI
Status: Proposed
Priority: Medium
Summary: Combine editing knowledge with sales copy generation.
Reason: Manuscript positioning can be reused for sales copy and note product pages.
Recommended Action: Create a shared prompt template mock.
Approval Needed: No for mock.
Expected Impact: Stronger publishing sales materials.
Risk Level: Low
Suggested Next Step: Add to Company Brain.

## UI Requirements
- Right detail panel header: AI Secretary / Chief of Staff
- Show brief daily briefing at top.
- Show grouped cards below.
- Provide filters for category, priority and department.
- Provide mock action buttons: Approve, Reject, Defer, Create Issue Mock, Add to Backlog, Send to Department.
- Use Japanese labels in the UI.
- Keep the format consistent across all cards.

## Data Model Suggestions
- SecretaryBriefing
- SecretaryItem
- ApprovalSummary
- DepartmentProposal
- AutomationCandidate
- AICombinationIdea
- SecretaryAction

## Implementation Rules
- Use mock data first.
- Do not connect to real external services.
- Do not require secrets.
- Do not perform production actions.
- Integrate with the two-layer CEO dashboard UI.
- Integrate with AI Audit and executive governance documents.
- Update tests, README and CLAUDE_RESPONSE.md in Japanese.

## Completion Criteria
- Right panel shows AI Secretary mode when no department is selected.
- Department detail replaces AI Secretary mode when a department is selected.
- Approval requests, proposals, automation candidates and AI combination ideas are shown in unified format.
- Mock actions are visible.
- Avatar can summarize AI Secretary alerts.
- Tests and documentation are updated.
