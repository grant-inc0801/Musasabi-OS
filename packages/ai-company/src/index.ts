// AI Company System。会社 → 本部 → 部門 → 部署 → チーム → AI社員 の組織階層、
// 役職・KPI・承認フローを扱う中核パッケージ。Development Bible 第21〜29章を参照。
//
// 現段階では組織階層をシステム設計へ反映するための型のみを定義し、
// 実装(永続化・承認ワークフロー・ダッシュボード)は次フェーズで行う。

export type OrganizationLevel =
  | "company"
  | "headquarters" // 本部
  | "division" // 部門
  | "department" // 部署
  | "team";

export interface OrganizationUnit {
  id: string;
  name: string;
  level: OrganizationLevel;
  parentId: string | null;
}

// Development Bible 第23章: CEO → 役員 → 本部長 → 部長 → 課長 → 主任 → 一般社員 → 研修社員
export type EmployeeRank =
  | "ceo"
  | "executive"
  | "headquarters_manager"
  | "department_manager"
  | "section_chief"
  | "supervisor"
  | "staff"
  | "trainee";

// Development Bible 第24章: 全AI社員は Role / Department / Authority / KPI / Memory / Skill を持つ
export interface AIEmployee {
  id: string; // 例: "MUSA-101"
  name: string;
  role: string;
  departmentId: string;
  rank: EmployeeRank;
  authorityLevel: number;
  kpi: Record<string, number>;
}

// Development Bible 第25章: 承認フローは 社員 → 主任 → 課長 → 部長 → 本部長 → CEO の順
export const APPROVAL_CHAIN: EmployeeRank[] = [
  "staff",
  "supervisor",
  "section_chief",
  "department_manager",
  "headquarters_manager",
  "ceo",
];
