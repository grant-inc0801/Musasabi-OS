```markdown
# Technical Specification: Sales Department Dashboard (S7-007)

## Objective

Implement the Sales Department Dashboard to serve as the central daily operating screen for the sales department manager and CEO. The dashboard will display real-time sales activity, learning mode progress, AutoCall mode status, appointment performance, AI coaching impact, and team productivity.

## Vision

The dashboard integrates the following components:
- Zoom Phone
- FileMaker
- Sales Workspace
- Learning Mode
- AutoCall Mode
- Sales Brain
- Sales Department Dashboard

## Dashboard Sections

### 1. Today Overview

Display real-time data including:
- Calls Today
- Appointments Today
- Appointment Rate
- Callbacks Scheduled
- Interested Leads
- No Answer Count
- AutoCall Status
- Learning Mode Status

### 2. Team Performance

Display performance metrics for each operator:
- Calls
- Appointments
- Appointment Rate
- Average Call Score
- Coaching Usage
- Learning Contributions

### 3. AI Performance

Display AI-related metrics:
- MUSA Coaching Suggestions
- Suggestion Usage Rate
- Suggestion Success Rate
- AutoCall Calls
- AutoCall Appointments
- AutoCall Appointment Rate
- AI Confidence

### 4. Lead Pipeline

Display the sales lead pipeline stages:
- New Leads
- Calling
- Callback
- Interested
- Closed
- Excluded

### 5. Learning Insights

Display insights into the learning process:
- Top Objections
- Top Rebuttals
- Best Opening
- Best Closing
- New Knowledge Candidates
- Approved Learning

### 6. Forecast

Display projected sales figures:
- Expected Calls
- Expected Appointments
- End-of-day Forecast
- Monthly Forecast
- Target Gap

### 7. Risk Alerts

Detect and display risk alerts for:
- Low call volume
- Low appointment rate
- High no-answer rate
- Missed callbacks
- AutoCall stopped
- Learning confidence low
- FileMaker sync failed
- Zoom sync failed

## Required Modules

Modules to be implemented in `packages/sales-dashboard/src/`:
- `SalesDashboardService.ts`
- `TeamPerformanceService.ts`
- `AIPerformanceService.ts`
- `SalesForecastService.ts`
- `SalesRiskDetector.ts`
- `SalesDashboardRepository.ts`
- `index.ts`

## Database Schema

### SQLite

Create the following tables:

#### sales_dashboard_snapshots

Fields:
- id
- snapshot_date
- calls_today
- appointments_today
- appointment_rate
- autocall_status
- learning_status
- forecast_json
- risk_json
- created_at

#### sales_team_performance

Fields:
- id
- operator
- report_date
- calls
- appointments
- appointment_rate
- average_score
- coaching_usage
- learning_count
- created_at

## User Interface

Design and layout of the Sales Department Dashboard:
- KPI cards
- Charts
- Operator table
- AI performance panel
- Risk alerts panel
- Forecast panel
- Learning insights panel

## Avatar Integration

Implement avatar reactions:
- Celebration for target achievement
- Warning for risk alerts
- Concerned when AutoCall stops
- Happy when learning improves

## Testing

Implement tests for:
- KPI calculation
- Team performance calculation
- AI performance calculation
- Forecast calculation
- Risk detection
- Dashboard rendering
- Avatar event integration

## Documentation

Create new documentation:
- `docs/SALES_DEPARTMENT_DASHBOARD.md`

Update existing documentation:
- `README.md`
- `CHANGELOG.md`

## Restrictions

This implementation should not include any of the following:
- External BI tools
- Cloud analytics
- Paid forecasting services
- Autonomous management actions

## Acceptance Criteria

The final implementation must meet the following criteria:
- Sales Department Dashboard is functional
- Today Overview works correctly
- Team Performance section works correctly
- AI Performance section functions as expected
- Learning Insights are displayed correctly
- Forecasting functions accurately
- Risk Alerts are effective
- Avatar reactions are linked to dashboard status
- All tests pass successfully
- Documentation is updated

## Deliverables

Provide the following:
- Report of changed files
- Test results
- Screenshot of the dashboard
- Suggested commit message

Suggested Commit Message:
```
feat(sales): implement Sales Department Dashboard
```
```