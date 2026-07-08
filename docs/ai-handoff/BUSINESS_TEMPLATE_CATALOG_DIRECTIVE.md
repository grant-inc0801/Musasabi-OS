# Business Template Catalog Directive

## Purpose
Expand AI Business Factory so Musasabi OS can create business units from selectable templates.

## Template Catalog
Add templates for:
- SaaS business
- Sales agency business
- Publishing business
- Call center business
- EC business
- Restaurant business
- Consulting business
- MEISHI-TUBE business

## Template Contents
Each template should define:
- Business unit name
- AI business director role
- Required teams
- Required AI employees
- Monthly KPI examples
- Workflow examples
- Required documents
- Knowledge workspace
- Dashboard cards
- Risk checks
- Reporting format

## Behavior
When a user selects a template, Musasabi OS should create a mock business unit with departments, AI employees, KPI dashboard, workflows, reports and audit monitoring.

## Rules
Use mock data first. Do not connect external services. Do not require secrets. Extend AI_BUSINESS_FACTORY_DIRECTIVE.md.

## First Implementation
Implement MEISHI-TUBE and SaaS templates first, then add the other templates incrementally.