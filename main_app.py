```yaml
# docs/sprints/Sprint-003.yaml
sprint_key: S3
title: Sales Learning MVP
status: planned
priority: critical
owner: CEO
maintainer: Musasabi CTO
goals:
  - fastest usable sales learning system for telemarketing sales department
  - tasks for sales department:
    - Import or manually register call information
    - Add transcripts and notes
    - Analyze sales calls
    - Capture objections and rebuttals
    - Attend MUSA coaching
    - Accumulate sales knowledge
tasks:
  - id: S3-004-01
    title: Call Transcript + Manual Notes
    purpose: Enable user creation and editing of call transcripts.
    dependencies: []
    acceptance_criteria:
      - Transcription table exists
      - Transcription editor functions
      - Transcript linked to lead
      - Transcript linked to call log
      - Transcript summary functions
  - id: S3-004-02
    title: Sales Call Analysis Scoring
    purpose: Analyze transcripts to generate sales score.
    dependencies: [S3-004-01]
    acceptance_criteria:
      - Tone score
      - Reaction score
      - Listening score
      - Question score
      - Closing score
      - Overall score
  - id: S3-004-03
    title: Objection and Rebuttal Learning
    purpose: Detect objections and store recommended rebuttals.
    dependencies: [S3-004-01]
    acceptance_criteria:
      - Objection pattern table exists
      - Save rebuttal records
      - Update success/failure count
  - id: S3-004-04
    title: MUSA Sales Coaching Panel
    purpose: Display coaching suggestions after each call transcription.
    dependencies: [S3-004-02, S3-004-03]
    acceptance_criteria:
      - Strengths displayed
      - Weaknesses displayed
      - Areas for improvement displayed
      - Recommended scripts displayed
      - Advice for next call displayed
  - id: S3-004-05
    title: Sales Knowledge Candidate Creation
    purpose: Create knowledge candidates from useful call insights.
    dependencies: [S3-004-02, S3-004-03]
    acceptance_criteria:
      - Create knowledge candidate
      - Candidate contains source transcription
      - Human approval required before publishing
  - id: S3-004-06
    title: Sales Learning Dashboard
    purpose: Display learning progress of the sales team.
    dependencies: [S3-004-02, S3-004-03, S3-004-05]
    acceptance_criteria:
      - Today's call count
      - Average score
      - Top objections
      - Top rebuttals
      - Knowledge candidates
      - Coaching sessions count
constraints:
  - Do not implement AutoCall
  - Do not implement voice generation
  - Do not implement autonomous calling
  - Do not implement Zoom recording download
  - Do not depend on external APIs
  - Do not implement cloud sync
  - This sprint is learning mode only
document_updates:
  - README.md
  - CHANGELOG.md
  - docs/SPRINT_SYSTEM.md
tests:
  - Parse sprint YAML
  - Load task dependencies
  - Detect ready tasks
  - Calculate sprint progress
acceptance_criteria:
  - Sprint-003.yaml exists
  - AI PM can parse Sprint-003.yaml
  - AI PM can identify S3-004-01 as the first ready task
  - Respect for dependencies
  - All tests pass
  - README updated
  - CHANGELOG updated
outputs:
  report:
    - Changed files
    - Test results
    - Recommended commit
```
