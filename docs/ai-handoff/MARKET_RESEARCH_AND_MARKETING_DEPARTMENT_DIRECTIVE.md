# Market Research and Marketing Department Directive

## Purpose
Add detailed responsibilities for the Market Research Department and Marketing Department in Musasabi OS.

## 1. Market Research Department

### Added Responsibility
When a new service proposal is raised by another department, the Market Research Department must create a standardized research report.

### Research Scope
For each new service proposal, research and report:
- Market size
- Market growth potential
- Target users
- Top 3 competitors
- Competitor comparison
- Differentiation points
- Competitor pricing models
- Suggested pricing direction
- Risks and barriers
- Recommended next action

### Standard Report Format
Use the same format for every report.

Required fields:
- Proposal Title
- Source Department
- Requesting AI Employee
- Research Status
- Market Size Summary
- Target Customer
- Top 3 Competitors
- Competitor Comparison Table
- Differentiation Points
- Pricing Comparison
- Opportunity Score
- Risk Level
- Recommended Strategy
- Next Action
- Approval Needed

### Output Rules
- Use mock research data first.
- Do not use paid data sources.
- Do not connect external APIs in mock phase.
- Store reports in Company Brain or Knowledge Vault mock area.
- Send summary to AI Secretary right detail panel.

## 2. Marketing Department

### Added Responsibility
The Marketing Department manages social media and content posting workflows.

### Posting Workflow
1. Create post draft.
2. Attach optional materials.
3. Analyze draft quality.
4. Submit for approval.
5. After approval, schedule or post in mock mode.

### Required UI Fields
- Post title
- Target channel
- Post body
- Attached materials
- Draft status
- Approval status
- Text lock checkbox
- Recurring post checkbox
- Posting frequency dropdown
- Next scheduled date
- Analysis notes
- Revision history

### Text Lock Behavior
- If Text Lock is checked, the post text is fixed.
- If Text Lock is not checked, the Marketing AI continues analysis and proposes revisions.
- Revisions should repeat until approved or locked.

### Recurring Post Behavior
- Recurring posting is enabled only when the recurring post checkbox is checked.
- Frequency dropdown becomes available only when recurring posting is checked.
- Frequency examples: every 1 day, every 3 days, every 7 days, every 14 days, every 30 days.
- In mock phase, generate scheduled post records only. Do not post externally.

### Attachment Behavior
- Attachments can be added to the mock post record.
- Attachments should be treated as references in mock mode.
- Do not upload to external SNS services in mock phase.

### Approval Rule
- External posting requires approval.
- Mock scheduling can be created without production connection.
- Actual SNS posting is disabled until Production Readiness.

### Standard Post Report Format
Required fields:
- Campaign Name
- Source Department
- Target Channel
- Draft Text
- Text Locked
- Recurring Enabled
- Frequency
- Attachment Summary
- Approval Status
- Analysis Summary
- Recommended Revision
- Next Action

## Integration
- AI Secretary panel should show marketing approvals and market research reports.
- AI CEO dashboard should show marketing schedule and research requests.
- Company Brain should store approved post templates and research report templates.
- AI Audit should monitor approval status and posting policy compliance.

## Implementation Rules
- Use mock data first.
- Do not connect real SNS accounts.
- Do not require secrets.
- Do not perform real external posting.
- Update tests, README and CLAUDE_RESPONSE.md in Japanese.

## Completion Criteria
- Market Research Department can display standardized service research reports.
- Marketing Department can create mock SNS post drafts.
- Text lock checkbox behavior is represented.
- Recurring post checkbox and frequency dropdown are represented.
- Attachments are represented in mock mode.
- Approval workflow is represented.
- AI Secretary panel can summarize approvals, reports and marketing actions.
