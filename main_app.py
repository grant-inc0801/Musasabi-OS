```typescript
// packages/sales-dashboard/src/SalesDashboardService.ts
export class SalesDashboardService {
  getTodayOverview() { /* Implementation here. */ }
  getTeamPerformance() { /* Implementation here. */ }
  getAIPerformance() { /* Implementation here. */ }
  getLeadPipeline() { /* Implementation here. */ }
  getLearningInsights() { /* Implementation here. */ }
  getForecast() { /* Implementation here. */ }
  getRiskAlerts() { /* Implementation here. */ }
}

// packages/sales-dashboard/src/TeamPerformanceService.ts
export class TeamPerformanceService {
  calculatePerformance() { /* Implementation here. */ }
}

// packages/sales-dashboard/src/AIPerformanceService.ts
export class AIPerformanceService {
  calculateAIPerformance() { /* Implementation here. */ }
}

// packages/sales-dashboard/src/SalesForecastService.ts
export class SalesForecastService {
  calculateForecast() { /* Implementation here. */ }
}

// packages/sales-dashboard/src/SalesRiskDetector.ts
export class SalesRiskDetector {
  detectRisks() { /* Implementation here. */ }
}

// packages/sales-dashboard/src/SalesDashboardRepository.ts
export class SalesDashboardRepository {
  fetchDashboardSnapshots() { /* Implementation here. */ }
  fetchTeamPerformance() { /* Implementation here. */ }
}

// packages/sales-dashboard/src/index.ts
import { SalesDashboardService } from './SalesDashboardService';

// SQLite table creation scripts
/*
CREATE TABLE sales_dashboard_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT,
  calls_today INTEGER,
  appointments_today INTEGER,
  appointment_rate REAL,
  autocall_status TEXT,
  learning_status TEXT,
  forecast_json TEXT,
  risk_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales_team_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operator TEXT,
  report_date TEXT,
  calls INTEGER,
  appointments INTEGER,
  appointment_rate REAL,
  average_score REAL,
  coaching_usage INTEGER,
  learning_count INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
*/
```