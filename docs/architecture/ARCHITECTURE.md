# Musasabi OS Architecture v1.0

## 1. Architecture Goal
Musasabi OS is a local-first Windows desktop AI employee platform.

The first production target is the GRANT sales department beta release.

## 2. System Layers

```text
Windows Desktop
  ↓
Tauri / Desktop Shell
  ↓
React UI
  ↓
Application Services
  ↓
Domain Engines
  ↓
SQLite / Local Storage
  ↓
External Connectors
```

## 3. Primary Applications

### apps/desktop
The main Musasabi OS desktop application.

Responsibilities:

- Home screen
- MUSA avatar
- Sales Workspace
- Command Center
- Settings
- Integration status
- Beta dashboard

## 4. Core Packages

### packages/core
Shared local database, configuration, events, logging, and runtime utilities.

### packages/brain
Company Brain and shared approved knowledge.

### packages/memory
Short-term and long-term memory for AI employees and business activity.

### packages/ai-engine
Thinking Engine, context builder, evidence engine, confidence calculation.

### packages/ai-pm
AI Project Manager, Sprint Manager, issue automation, review gate, pipeline governance.

## 5. Sales Packages

### packages/sales
Lead, call history, hearing notes, transcript, and sales workspace services.

### packages/sales-brain
Best talk learning, objections, rebuttals, closing patterns, sales learning history.

### packages/sales-coach
Real-time deterministic coaching and next-best-line suggestions.

### packages/ai-sales-manager
Lead priority, appointment forecast, daily recommendations, sales command center.

## 6. Integration Packages

### packages/integrations/src/filemaker
FileMaker import, field mapping, import preview, duplicate detection, safe two-way sync.

### packages/integrations/src/zoom-phone
Zoom Phone call log import, real-time sync, call event routing, lead matching.

## 7. Avatar and Voice Packages

### packages/avatar or apps/desktop/src/avatar
MUSA avatar state, expression, speech bubble, mode display, and future 3D hooks.

### packages/voice-analysis
Call quality metrics such as talk ratio, interruption, silence, tone, listening, clarity.

### packages/voice
Internal voice interaction, speech recognition, speech synthesis, command routing, lip sync hooks.

## 8. AI Company System
Musasabi OS must support AI employees, departments, and an AI organization.

Hierarchy:

```text
Company
  ↓
Headquarters
  ↓
Department
  ↓
Team
  ↓
AI Employee
```

Every AI employee has:

- employee key
- department
- role
- authority
- skills
- memory
- KPI
- current mode
- audit trail

## 9. Operating Modes

### Learning Mode
Default for beta. Learns from human work.

### Support Mode
Assists human users with suggestions.

### Analysis Mode
Analyzes data and produces reports.

### AutoCall Mode
Disabled in beta. Requires safety gates before execution.

## 10. Data Architecture
Local-first SQLite is the default beta storage.

External integrations must be optional. Missing credentials must not break startup.

## 11. Security Architecture
Rules:

- API keys are never committed.
- Credentials are never logged.
- AutoCall execution is disabled by default.
- Destructive sync is forbidden by default.
- Approval gates are required for risky actions.
- Audit logs are mandatory for external writes.

## 12. Beta Architecture Objective
Beta v0.9 is complete when the sales department can run daily work using:

- Desktop app
- MUSA avatar
- Sales Workspace
- FileMaker lead sync
- Zoom Phone call sync
- Learning Mode
- Sales Brain
- Sales Coach
- Backup / health / error visibility
