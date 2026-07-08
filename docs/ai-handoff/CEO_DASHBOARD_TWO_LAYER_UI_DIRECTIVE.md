# CEO Dashboard Two-Layer UI Directive

Directive ID: D-20260709-003

## Purpose
Redesign Musasabi OS into a two-layer operating experience.

Layer A is the AI CEO executive dashboard.
Layer B is the department AI employee interaction screen.

## Layer A: AI CEO Executive Dashboard
This is the main screen.

Required elements:
- Metallic cylindrical department progress meters.
- Company-wide executive meter.
- Alert priority display.
- Real-time timeline.
- AI CEO proposal box.
- AI employee ranking.
- Pending approvals summary.
- Avatar summary.

## Department Meter UI
Each department panel must be a short metallic cylinder meter.

Layout:
- Top: department icon.
- Below icon: department name.
- Below name: status label.
- Meter body: progress rises from bottom to top.
- Bottom: progress percent.

Status colors:
- Complete: green.
- Working: yellow.
- Waiting for approval: purple.
- Error: red.

Behavior:
- Working meter slowly rises.
- Complete meter is full and green.
- Error meter stops and turns red.
- Approval waiting meter pauses and turns purple.

Layout rules:
- Support two rows when department count increases.
- Do not show row number text.
- Do not show department count text.
- Use responsive grid.
- Keep vertical height compact.

## Layer B: Department Interaction Screen
Open this screen when a department meter is clicked.

Required elements:
- Department summary.
- Assigned AI employees.
- Chat with department AI employee.
- Today's tasks.
- KPI progress.
- Blocked items.
- Waiting approvals.
- Audit notes.
- Proposal to Issue action.

## Additional Modules
Implement these in Layer A:

1. Real-time Timeline
- Shows recent system events.
- Includes department, time and event summary.

2. AI CEO Proposal Box
- AI employees can submit proposals.
- Human can approve proposal mock.
- Approved proposal can create Issue mock.

3. Alert Priority
- Critical, High, Medium and Low.
- Use clear labels and colors.

4. Executive Company Meter
- Shows whole company progress.
- Can summarize monthly KPI, productivity or operating health.

5. AI Employee Ranking
- Rank by contribution, speed, quality, proposal count and operating rate.

## Implementation Rules
- Use mock data first.
- Do not connect to real external services.
- Do not require secrets.
- Keep existing desktop app stable.
- Extend current dashboard architecture.
- Update tests, README and CLAUDE_RESPONSE.md in Japanese.

## Completion Criteria
- Main screen shows Layer A.
- Department click opens Layer B.
- Metallic cylinder meters support two-row layout.
- Timeline, proposal box, alert priority, company meter and AI employee ranking are visible.
- Avatar can summarize dashboard state.
- Tests and documentation are updated.
