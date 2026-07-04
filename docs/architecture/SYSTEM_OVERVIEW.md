# Musasabi OS System Overview

## Product Summary
Musasabi OS is a Windows desktop AI employee platform for daily business operations.

The first target is internal beta use by GRANT's sales department.

## Current Strategic Priority
**Epic β-001: Sales Department Operational Release**

The product must become usable by sales representatives before expanding into full AI company automation.

## Main User Flow

```text
Sales representative starts Windows
  ↓
Musasabi OS opens
  ↓
MUSA avatar appears
  ↓
Sales Workspace opens
  ↓
Lead list is shown
  ↓
Zoom Phone / FileMaker data is available
  ↓
User records call notes and transcript
  ↓
MUSA gives coaching
  ↓
Sales Brain learns
  ↓
Dashboard updates
```

## Key Systems

### 1. Desktop App
Runs Musasabi OS as a Windows desktop application.

### 2. MUSA Avatar
The visible AI employee presence. Starts as a usable 2D resident avatar and evolves into 3D/VRM.

### 3. Sales Workspace
The daily operating screen for telemarketing sales.

### 4. Sales Brain
Learns best talks, objections, rebuttals, closings, and call outcomes.

### 5. Sales Coach
Gives deterministic coaching based on lead data, call history, transcript, Sales Brain, and forecast.

### 6. FileMaker Integration
Imports and safely synchronizes real CRM lead data.

### 7. Zoom Phone Integration
Imports and syncs call logs and call events.

### 8. Voice Analysis
Analyzes call quality using transcript timing or manual/mock metrics first.

### 9. Voice Engine
Supports internal voice interaction with MUSA. Customer AutoCall is excluded from beta.

### 10. AI PM
Manages development process, sprint definitions, handoff, review, and automation.

## Beta Must Not Include

- AutoCall execution
- Autonomous outbound customer conversation
- Cloud sync as a requirement
- Marketplace
- Multi-tenant deployment
- Destructive FileMaker overwrite

## Beta Success Criteria

- App launches without PowerShell for normal users.
- MUSA avatar is visible.
- Sales user can manage leads.
- Call history and transcript can be saved.
- Learning records are created.
- MUSA gives coaching.
- FileMaker sample/real sync path exists.
- Zoom Phone sample/real sync path exists.
- Tests pass.
- Documentation is sufficient for internal deployment.
