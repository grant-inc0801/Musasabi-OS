```plaintext
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

```sql
-- lead_scores table
CREATE TABLE lead_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    appointment_probability REAL NOT NULL,
    confidence REAL NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- daily_recommendations table
CREATE TABLE daily_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    priority_rank INTEGER NOT NULL,
    recommendation TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- sales_daily_summary table
CREATE TABLE sales_daily_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    calls INTEGER NOT NULL,
    appointments INTEGER NOT NULL,
    callbacks INTEGER NOT NULL,
    interested INTEGER NOT NULL,
    score_average REAL NOT NULL
);
```