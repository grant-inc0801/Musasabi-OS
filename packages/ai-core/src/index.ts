// AI Sales Employee ロジック(日次計画・リード管理・KPI)。Sales Workspace と連携する。
// Development Bible 第13章・第24章を参照。
export * from "./types";

import * as LeadPrioritizerModule from "./LeadPrioritizer";
import * as DailyPlanGeneratorModule from "./DailyPlanGenerator";
import * as KpiCalculatorModule from "./KpiCalculator";
import * as RecommendedActionEngineModule from "./RecommendedActionEngine";

export const prioritizeLeads = LeadPrioritizerModule.prioritizeLeads;
export const generateDailyPlan = DailyPlanGeneratorModule.generateDailyPlan;
export const calculateKpi = KpiCalculatorModule.calculateKpi;
export const recommendActions = RecommendedActionEngineModule.recommendActions;
