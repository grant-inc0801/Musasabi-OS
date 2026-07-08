// AI Company System(Phase β-002 優先順位③)。会社 → 本部 → 部門 → 部署 → チーム →
// AI社員 の組織階層、役職・権限・KPI・承認フローを Organization Bible に沿ってシステムへ
// 反映する。現段階では組織モデル(型・マスタデータ・探索/承認ロジック)を提供し、
// 永続化・承認ワークフロー実行・Organization Dashboard は次フェーズ(ARCHITECTURE 第5章)。

export type {
  OrganizationLevel,
  OrganizationUnit,
  EmployeeRank,
  EmployeeState,
  AIEmployee,
} from "./types";
export {
  RANK_AUTHORITY_LEVEL,
  RANK_LABEL_JA,
  APPROVAL_CHAIN,
  EMPLOYEE_STATES,
  EMPLOYEE_STATE_LABEL_JA,
} from "./types";
export {
  COMPANY_GENOME,
  COMPANY_VALUES,
  COMPANY_VALUE_LABEL_JA,
  type CompanyValue,
} from "./genome";
export {
  initialCallProgress,
  hasPassedTestCriteria,
  allowedCallModes,
  recommendedCallMode,
  stateDuringCall,
  type EmployeeCallProgress,
} from "./callIntegration";
export {
  AI_EMPLOYEES,
  getEmployee,
  getEmployeesByUnit,
  initialRosterCallProgress,
} from "./roster";
export {
  COMPANY_ID,
  HEADQUARTERS_IDS,
  ORGANIZATION_UNITS,
  type HeadquartersId,
} from "./organization";
export { getUnit, getChildren, getAncestors, getHeadquarters } from "./orgQueries";
export {
  resolveAuthorityLevel,
  nextApprover,
  canApprove,
  approvalPath,
} from "./approval";
export {
  MOCK_DEPARTMENT_SUMMARIES,
  computeCompanySummary,
  formatJpy,
  DEPARTMENT_STATUS_LABEL_JA,
  type DepartmentSummary,
  type CompanySummary,
  type DepartmentStatus,
} from "./summary";
export * from "./commandCenter";
export * from "./marketResearch";
export * from "./knowledgeVault";
export * from "./backOffice";
export * from "./deptChat";
export * from "./supportDesk";
export * from "./devProjects";
export * from "./companyDashboard";
export * from "./workflow";
export * from "./collaboration";
