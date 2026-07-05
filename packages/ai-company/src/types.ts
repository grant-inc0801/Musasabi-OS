// AI Company System の型定義(Phase β-002 優先順位③)。
// Organization Bible(docs/ORGANIZATION_BIBLE.md)の組織モデルをシステムへ反映する。
// フレームワーク非依存の純粋な型・定数のみを置く。

/** 組織階層のレベル(Organization Bible 第1章・第6章)。 */
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
  /** 上位組織のID。会社(company)のみ null。 */
  parentId: string | null;
}

/**
 * 役職ランク(Organization Bible 第2章 / Development Bible 第23章)。
 * CEO → 役員 → 本部長 → 部長 → 課長 → 主任 → 一般社員 → 研修社員。
 */
export type EmployeeRank =
  | "ceo"
  | "executive"
  | "headquarters_manager"
  | "department_manager"
  | "section_chief"
  | "supervisor"
  | "staff"
  | "trainee";

/**
 * 役職ランク → 権限レベル(Organization Bible 第2章)。
 * CEO は単一インスタンスの特例で最上位(9)、以降 役員=8 … 研修社員=2。
 */
export const RANK_AUTHORITY_LEVEL: Record<EmployeeRank, number> = {
  ceo: 9,
  executive: 8,
  headquarters_manager: 7,
  department_manager: 6,
  section_chief: 5,
  supervisor: 4,
  staff: 3,
  trainee: 2,
};

/** 役職ランクの日本語ラベル(UI表示用)。 */
export const RANK_LABEL_JA: Record<EmployeeRank, string> = {
  ceo: "CEO",
  executive: "役員",
  headquarters_manager: "本部長",
  department_manager: "部長",
  section_chief: "課長",
  supervisor: "主任",
  staff: "一般社員",
  trainee: "研修社員",
};

/**
 * AI社員(Organization Bible 第3章 / Development Bible 第24章)。
 * Role / Department / Authority / KPI を持つ。
 */
export interface AIEmployee {
  id: string; // 例: "MUSA-101"
  name: string;
  role: string;
  /** 所属する組織単位(通常は department か team)のID。 */
  unitId: string;
  rank: EmployeeRank;
  /** RANK_AUTHORITY_LEVEL[rank] と一致させる(resolveAuthorityLevel で算出)。 */
  authorityLevel: number;
  /** KPI名 → 目標値(Organization Bible 第4章)。 */
  kpi: Record<string, number>;
}

/**
 * 承認フローの順序(Organization Bible 第5章 / Development Bible 第25章)。
 * 社員 → 主任 → 課長 → 部長 → 本部長 → CEO。役員(executive)は本部横断の特例で
 * この直列チェーンには含めない。
 */
export const APPROVAL_CHAIN: readonly EmployeeRank[] = [
  "staff",
  "supervisor",
  "section_chief",
  "department_manager",
  "headquarters_manager",
  "ceo",
];
