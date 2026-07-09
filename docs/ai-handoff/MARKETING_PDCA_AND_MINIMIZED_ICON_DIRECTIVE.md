# Marketing PDCA and Minimized Icon Directive

## Purpose
Add Marketing Department PDCA automation and clarify the minimized mini panel icon design.

## 1. Marketing PDCA Engine

### Post Management Unit
Manage all marketing posts by Post Title.

Required fields:
- Post Title
- Target Channel
- Campaign Name
- Assigned AI Employee
- Draft Text
- Attachment References
- Text Locked
- Recurring Enabled
- Posting Frequency
- Approval Status
- Current Version
- Current Status
- Created Date
- Next Scheduled Date

### Numeric Analysis Dashboard
Each post should show numeric analysis and evaluation.

Metrics:
- Overall Score
- Title Score
- Body Score
- CTA Score
- Target Match Score
- Hashtag Score
- Posting Time Score
- Engagement Forecast
- Click Forecast
- Conversion Forecast
- Improvement Rate
- Risk Score

### PDCA Automation
For every post title, run PDCA in mock mode.

Plan:
- Define target channel, purpose, target customer and expected action.

Do:
- Create draft and schedule mock post after approval.

Check:
- Analyze results using mock metrics.
- Show scores and weak points.

Act:
- Suggest improved title, body, CTA, hashtag, timing or attachment.
- Create next version if Text Locked is false.
- Only analyze without changing text if Text Locked is true.

### Version Control
- Keep version history per Post Title.
- Show previous score and new score.
- Show reason for revision.
- Mark best performing version.

### Company Brain Integration
High score posts should be saved as reusable knowledge:
- Best Title Pattern
- Best CTA Pattern
- Best Posting Time
- Best Hashtag Pattern
- Best Attachment Pattern
- Successful Campaign Template

### AI Secretary Integration
The AI Secretary right detail panel should show:
- Post approval requests
- PDCA improvement proposals
- High score posts
- Low score alerts
- Recurring post schedule
- Marketing recommendations

Use the unified secretary card format.

## 2. Minimized Mini Panel Icon UI

### Definition
The mini panel means the icon shown when Musasabi OS is minimized.
It does not mean the department cylinder mini panel.

### UI Requirement
When minimized, Musasabi OS should show a compact floating icon.

Design:
- No glass surface border line.
- No visible frame around the glass face.
- Metallic base/body.
- Glass expression should rely on transparency, gloss and reflection only.
- Icon should feel integrated, not boxed.
- Keep it compact and suitable for bottom-right desktop placement.

### Status Indication
The minimized icon should show system status using subtle color accents:
- Green: healthy / complete
- Yellow: working
- Purple: waiting for approval
- Red: error / attention needed

### Interaction
- Click: restore main dashboard.
- Hover: show short AI Secretary summary mock.
- Badge: show number of approvals or alerts.

## Implementation Rules
- Use mock data first.
- Do not connect real SNS accounts.
- Do not perform real posting.
- Do not require secrets.
- Keep desktop app stable.
- Update tests, README and CLAUDE_RESPONSE.md in Japanese.

## Completion Criteria
- Posts are managed by title.
- Numeric analysis and evaluation are visible.
- PDCA cycle is represented with version history.
- Text lock behavior is respected.
- AI Secretary receives marketing summaries.
- Minimized icon has no glass border line and supports status accents.
