# AI Sales Manager Foundation - Technical Instruction Document

## Objective

Implement the AI Sales Manager Foundation by transitioning Musasabi AI from an assistant role to a Sales Manager role, focusing on decision-making processes for daily sales tasks.

## Vision

The system follows a sequential flow as below:

1. **Sales Leads**
2. **Learning Data**
3. **Sales Brain**
4. **AI Sales Manager**
5. **Today's Priority List**
6. **Salesperson Execution**
7. **Learning Feedback**
8. **Sales Brain Update**

## Directory Structure

Create the following directories and files:

```
packages/ai-sales-manager/
└── src/
    ├── leadScoringEngine.js
    ├── priorityEngine.js
    ├── appointmentPredictor.js
    ├── recommendationEngine.js
    ├── nextActionEngine.js
    ├── executiveDashboard.js
    └── index.js
```

## Database Schema

### SQLite Tables

Create tables as described below:

#### Table: `lead_scores`

- **id** - Primary key
- **lead_id** - Lead identifier
- **score** - Calculated lead score
- **appointment_probability** - Probability of booking an appointment
- **confidence** - Confidence level of the prediction
- **calculated_at** - Timestamp of calculation

#### Table: `daily_recommendations`

- **id** - Primary key
- **lead_id** - Lead identifier
- **priority_rank** - Priority ranking of the lead
- **recommendation** - Recommended action for the lead
- **expected_result** - Expected outcome
- **created_at** - Timestamp

#### Table: `sales_daily_summary`

- **id** - Primary key
- **date** - Date of summary
- **calls** - Number of calls made
- **appointments** - Number of appointments set
- **callbacks** - Number of callbacks scheduled
- **interested** - Number of interested leads
- **score_average** - Average score of leads contacted

## AI Sales Manager Functionality

### Daily Priority List Generation

Automatically generate a prioritized list each morning including:

- Company
- Reason for prioritization
- Expected Appointment Probability
- Recommended Opening Statement
- Expected Objection
- Recommended Rebuttal
- Recommended Closing
- Next Action

### Lead Scoring

Calculate lead scores (0-100) based on:

- Call history
- Callback history
- Industry type
- Previous objections
- Learning records
- Conversation quality
- Appointment history
- Recent activity

### Appointment Prediction

Generate Expected Appointment Probability (0-100%) with a separate storage for confidence levels.

## Executive Dashboard

Display the following elements:

- Today's Priority Leads
- Appointment Forecast
- Today's Target
- Progress Tracking
- Best/Worst Performer
- Lead and Industry Distribution
- Call Queue

## MUSA Recommendations

Provide recommendations on:

- Priority company for calls
- Expected objections and rebuttals
- Recommended opening and closing statements
- Expected appointment probability

## Learning and Adaptation

Ensure that lead scores, appointment probabilities, and knowledge databases update with each completed call.

## Future Compatibility

Design to support future modes and features, including:

- Learning Mode
- AutoCall Mode
- Multiple AI Employees
- Campaign Management
- Departmental Support

## Testing

Implement tests for:

- Lead Scoring
- Priority Ranking
- Appointment Prediction
- Recommendation Generation
- Dashboard Summary

## Documentation

Create documentation files:

- `README.md`
- `CHANGELOG.md`
- `docs/AI_SALES_MANAGER.md`

## Restrictions

Avoid implementing:

- Voice AI
- AutoCall
- Speech Recognition
- LLM reasoning
- External APIs

Emphasize deterministic logic only.

## Acceptance Criteria

- Successful Lead Scoring and Priority Ranking
- Accurate Appointment Predictions
- Functional Dashboard
- Daily Recommendations Generated
- All Tests Passing
- Updated README

## Deliverables

Provide a report detailing:

- Changed Files
- Test Results
- Suggested Commit Message

*Do not push changes automatically.*

### Suggested Commit Message

```
feat(ai): implement AI Sales Manager foundation
```