import type { OrganizationUnit } from "./types";

// Organization Bible 第1章・第3章の組織図をデータ化する(Phase β-002 優先順位③)。
// 会社直下に CEO と 8本部、各本部に代表的な部門(division)を配置する。部署(department)・
// チーム(team)はEpic β-001で実運用に入ったAI営業本部のみ具体化し、他本部は本部・部門
// レベルまで定義する(Organization Bible 第6章「現段階では組織構造の反映まで」)。

export const COMPANY_ID = "musasabi";

/** 8本部の識別子(Organization Bible 第1章)。 */
export const HEADQUARTERS_IDS = [
  "hq-planning", // AI企画本部
  "hq-development", // AI開発本部
  "hq-sales", // AI営業本部
  "hq-marketing", // AIマーケティング本部
  "hq-creative", // AIクリエイティブ本部
  "hq-admin", // AI管理本部
  "hq-support", // AIサポート本部
  "hq-research", // AI研究開発本部
] as const;

export type HeadquartersId = (typeof HEADQUARTERS_IDS)[number];

/**
 * 組織単位の一覧(Organization Bible 第1・3章)。会社 → 本部 → 部門 →(営業のみ)部署。
 * ここはマスタデータであり、実行時に永続化ストアへ差し替えられる。
 */
export const ORGANIZATION_UNITS: readonly OrganizationUnit[] = [
  { id: COMPANY_ID, name: "Musasabi OS", level: "company", parentId: null },

  // 8本部
  { id: "hq-planning", name: "AI企画本部", level: "headquarters", parentId: COMPANY_ID },
  { id: "hq-development", name: "AI開発本部", level: "headquarters", parentId: COMPANY_ID },
  { id: "hq-sales", name: "AI営業本部", level: "headquarters", parentId: COMPANY_ID },
  { id: "hq-marketing", name: "AIマーケティング本部", level: "headquarters", parentId: COMPANY_ID },
  { id: "hq-creative", name: "AIクリエイティブ本部", level: "headquarters", parentId: COMPANY_ID },
  { id: "hq-admin", name: "AI管理本部", level: "headquarters", parentId: COMPANY_ID },
  { id: "hq-support", name: "AIサポート本部", level: "headquarters", parentId: COMPANY_ID },
  { id: "hq-research", name: "AI研究開発本部", level: "headquarters", parentId: COMPANY_ID },

  // AI企画本部(第3.1章)
  { id: "div-planning-strategy", name: "経営企画部門", level: "division", parentId: "hq-planning" },
  { id: "div-planning-pmo", name: "PMO部門", level: "division", parentId: "hq-planning" },

  // AI開発本部(第3.2章)
  { id: "div-dev-desktop", name: "Desktop部門", level: "division", parentId: "hq-development" },
  { id: "div-dev-backend", name: "Backend部門", level: "division", parentId: "hq-development" },
  { id: "div-dev-frontend", name: "Frontend部門", level: "division", parentId: "hq-development" },
  { id: "div-dev-qa", name: "QA部門", level: "division", parentId: "hq-development" },
  { id: "div-dev-devops", name: "DevOps部門", level: "division", parentId: "hq-development" },
  { id: "div-dev-security", name: "Security部門", level: "division", parentId: "hq-development" },
  { id: "div-dev-architecture", name: "Architecture部門", level: "division", parentId: "hq-development" },

  // AI営業本部(第3.3章)— Epic β-001の実運用本部。営業部門配下に部署を具体化。
  { id: "div-sales-main", name: "営業部門", level: "division", parentId: "hq-sales" },
  { id: "div-sales-inside", name: "インサイドセールス部門", level: "division", parentId: "hq-sales" },
  { id: "div-sales-field", name: "フィールドセールス部門", level: "division", parentId: "hq-sales" },
  { id: "div-sales-planning", name: "営業企画部門", level: "division", parentId: "hq-sales" },
  { id: "div-sales-analytics", name: "営業分析部門", level: "division", parentId: "hq-sales" },
  { id: "dept-sales-team-a", name: "営業部 第一営業部署", level: "department", parentId: "div-sales-main" },

  // AIマーケティング本部(第3.4章)
  { id: "div-mkt-sns", name: "SNS部門", level: "division", parentId: "hq-marketing" },
  { id: "div-mkt-ads", name: "広告部門", level: "division", parentId: "hq-marketing" },
  { id: "div-mkt-seo", name: "SEO部門", level: "division", parentId: "hq-marketing" },

  // AIクリエイティブ本部(第3.5章)
  { id: "div-creative-uiux", name: "UI/UXデザイン部門", level: "division", parentId: "hq-creative" },
  { id: "div-creative-brand", name: "ブランドデザイン部門", level: "division", parentId: "hq-creative" },
  { id: "div-creative-motion", name: "モーション・アニメーション部門", level: "division", parentId: "hq-creative" },

  // AI管理本部(第3.6章)
  { id: "div-admin-hr", name: "人事部門", level: "division", parentId: "hq-admin" },
  { id: "div-admin-accounting", name: "経理部門", level: "division", parentId: "hq-admin" },
  { id: "div-admin-legal", name: "法務部門", level: "division", parentId: "hq-admin" },
  { id: "div-admin-it", name: "IT部門", level: "division", parentId: "hq-admin" },

  // AIサポート本部(第3.7章)
  { id: "div-support-desk", name: "サポート部門", level: "division", parentId: "hq-support" },
  { id: "div-support-onboarding", name: "導入支援部門", level: "division", parentId: "hq-support" },

  // AI研究開発本部(第3.8章)
  { id: "div-research-memory", name: "Memory研究部門", level: "division", parentId: "hq-research" },
  { id: "div-research-vision", name: "Vision研究部門", level: "division", parentId: "hq-research" },
  { id: "div-research-automation", name: "Automation研究部門", level: "division", parentId: "hq-research" },
];
