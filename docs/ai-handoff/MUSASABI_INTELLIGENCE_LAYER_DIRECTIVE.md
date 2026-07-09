# Musasabi Intelligence Layer Directive

## Purpose
Implement the Musasabi Intelligence Layer above Company Brain.

This layer improves judgment quality, knowledge relationships, workflow design and explainability across all AI employees.

Included modules:
- AI Policy Engine
- Knowledge Graph
- Workflow Composer
- Explainability Center

## Architecture
AI CEO -> Musasabi Intelligence Layer -> Company Brain / Workflow / Departments / AI Employees

All important AI recommendations should reference this layer before execution.

## 1. AI Policy Engine

### Purpose
Centralize company rules, approval standards and decision criteria so all AI employees follow the same policies.

### Managed Rules
- Company Constitution
- Company DNA
- Mission
- Vision
- Values
- Brand Rules
- Decision Principles
- Approval Rules
- Security Rules
- Department Rules
- Budget Rules
- Risk Rules
- KPI Rules

### Rule Priority
Higher-level rules override lower-level rules.

Priority order:
1. Company Constitution
2. Company DNA
3. Policy
4. Department Rule
5. Workflow Rule
6. Individual AI Rule

### Decision Validation
Before an important recommendation or action:
1. Check relevant policies.
2. Validate approval requirements.
3. Estimate risk.
4. Send result to Explainability Center.
5. Continue only if allowed in mock mode.

## 2. Knowledge Graph

### Purpose
Represent relationships between departments, AI employees, projects, customers, documents, workflows and decisions.

### Node Types
- Department
- AI Employee
- Customer
- Project
- Issue
- Workflow
- Company Brain Item
- Knowledge Item
- Secret Reference
- API Integration
- KPI
- Report
- Avatar
- Business Unit

### Relationship Examples
- AI Employee assigned to Department
- Department owns Project
- Project uses Workflow
- Workflow creates Report
- Customer related to Project
- Knowledge supports Decision
- Secret Reference used by Integration

### Use Cases
- Search related knowledge.
- Trace why a recommendation was made.
- Find related departments and AI employees.
- Link MEISHI-TUBE to its business unit, workflows, reports and customer data.

## 3. Workflow Composer

### Purpose
Create workflows through a no-code style composition model.

### Node Types
- AI Employee
- Department
- Approval
- Condition
- Timer
- Scheduler
- API Integration
- Secret Reference
- Report
- Notification
- Dashboard Update
- Company Brain Write
- Audit Check

### Required Features
- Workflow template list.
- Mock workflow builder data model.
- Node and edge representation.
- Approval node support.
- Company Brain save support.
- AI Secretary notification support.

### Example Workflow
Sales Department -> Market Research Department -> Marketing Department -> AI CEO Approval -> Development Department -> AI Audit.

## 4. Explainability Center

### Purpose
Show why an AI recommendation was made so humans can approve or reject with confidence.

### Required Fields
- Recommendation
- Reason
- Evidence
- Used Knowledge
- Used Policy
- Used Workflow
- KPI Impact
- Risk
- ROI
- Confidence
- Expected Benefit
- Required Approval
- Next Action

### Explainability Score
Show numeric scores for:
- Confidence
- Evidence Strength
- Risk
- Cost
- Expected Benefit

### UI Behavior
When a user clicks "Why" or "Reason" on a recommendation, show Explainability Center details.

## 5. AI Secretary Integration
AI Secretary should show:
- Policy violations
- New knowledge links
- Workflow proposals
- Weak explainability alerts
- Policy change requests
- Knowledge Graph updates

Use the existing unified secretary card format.

## 6. AI Audit Integration
AI Audit should monitor:
- Policy changes
- Workflow changes
- Graph changes
- Explainability quality
- Rule violations
- Approval bypass attempts

## 7. AI CEO Dashboard Integration
Add a Musasabi Intelligence summary panel with:
- Policy status
- Knowledge Graph status
- Workflow Composer status
- Explainability alerts
- Recent decisions

## 8. Company Brain Integration
Store and retrieve:
- Policies
- Workflow templates
- Knowledge links
- Explainability reports
- Decision history

## Production Rules
Mock phase:
- Use mock policies, graph nodes, workflow templates and explainability reports.
- Do not perform real external changes.
- Do not connect production services.
- Do not require secrets.

Production Readiness phase:
- Enable real policy enforcement after approval.
- Enable real workflow execution only through approval gates.
- Maintain audit logs.

## Completion Criteria
- AI Policy Engine mock implemented.
- Knowledge Graph mock implemented.
- Workflow Composer mock implemented.
- Explainability Center mock implemented.
- AI Secretary integration implemented.
- AI Audit integration implemented.
- AI CEO dashboard summary implemented.
- Company Brain integration represented.
- Tests updated.
- README and CLAUDE_RESPONSE.md updated in Japanese.
