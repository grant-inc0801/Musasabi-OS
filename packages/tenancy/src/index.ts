// Phase 5: Product Launch(Directive D-20260708-006)。
// Musasabi OS を商用 SaaS 化するためのマルチテナント/プラン/機能ゲート基盤。
// 課金は Mock、顧客データ分離は必須、secrets/本番認証情報はコミットしない。

/** プラン階層。 */
export type PlanTier = "free" | "pro" | "enterprise";

export const PLAN_LABEL_JA: Record<PlanTier, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

export const PLAN_ORDER: readonly PlanTier[] = ["free", "pro", "enterprise"];

/** 機能フラグ。 */
export type FeatureKey =
  | "departments"
  | "avatar"
  | "connectors_mock"
  | "connectors_production"
  | "reports_export"
  | "sso"
  | "audit_log"
  | "priority_support";

export const FEATURE_LABEL_JA: Record<FeatureKey, string> = {
  departments: "部門ダッシュボード",
  avatar: "常駐アバター",
  connectors_mock: "外部連携(Mock)",
  connectors_production: "外部連携(本番)",
  reports_export: "レポート出力",
  sso: "シングルサインオン",
  audit_log: "監査ログ",
  priority_support: "優先サポート",
};

/** プランごとの機能セット(上位プランは下位を包含)。 */
export const PLAN_FEATURES: Record<PlanTier, readonly FeatureKey[]> = {
  free: ["departments", "avatar", "connectors_mock"],
  pro: ["departments", "avatar", "connectors_mock", "reports_export", "audit_log"],
  enterprise: [
    "departments",
    "avatar",
    "connectors_mock",
    "connectors_production",
    "reports_export",
    "audit_log",
    "sso",
    "priority_support",
  ],
};

/** プランの利用上限(Mock)。 */
export interface PlanLimits {
  maxSeats: number;
  maxDepartments: number;
  /** 月間 API 呼び出し上限(Mock)。 */
  maxMonthlyOperations: number;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: { maxSeats: 3, maxDepartments: 3, maxMonthlyOperations: 1000 },
  pro: { maxSeats: 25, maxDepartments: 12, maxMonthlyOperations: 50000 },
  enterprise: { maxSeats: 500, maxDepartments: 100, maxMonthlyOperations: 5000000 },
};

/** 指定プランが機能を持つか。 */
export function hasFeature(plan: PlanTier, feature: FeatureKey): boolean {
  return PLAN_FEATURES[plan].includes(feature);
}

/** ロール(テナント内権限)。 */
export type TenantRole = "owner" | "admin" | "member";

export const ROLE_LABEL_JA: Record<TenantRole, string> = {
  owner: "オーナー",
  admin: "管理者",
  member: "メンバー",
};

const ROLE_LEVEL: Record<TenantRole, number> = { owner: 3, admin: 2, member: 1 };

/** 管理操作(メンバー招待・プラン変更等)が可能か。 */
export function canManage(role: TenantRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL.admin;
}

/** テナント(顧客企業)。 */
export interface Tenant {
  id: string;
  name: string;
  plan: PlanTier;
  seatsUsed: number;
  departmentsUsed: number;
  monthlyOperations: number;
}

/** 使用量メトリクス。 */
export type UsageMetric = "seats" | "departments" | "operations";

/** 使用量が上限内か判定する。 */
export function withinLimit(tenant: Tenant, metric: UsageMetric): boolean {
  const limits = PLAN_LIMITS[tenant.plan];
  switch (metric) {
    case "seats":
      return tenant.seatsUsed <= limits.maxSeats;
    case "departments":
      return tenant.departmentsUsed <= limits.maxDepartments;
    case "operations":
      return tenant.monthlyOperations <= limits.maxMonthlyOperations;
  }
}

/** 使用率(0-100+)。上限0のときは0。 */
export function usagePercent(tenant: Tenant, metric: UsageMetric): number {
  const limits = PLAN_LIMITS[tenant.plan];
  const [used, max] =
    metric === "seats"
      ? [tenant.seatsUsed, limits.maxSeats]
      : metric === "departments"
        ? [tenant.departmentsUsed, limits.maxDepartments]
        : [tenant.monthlyOperations, limits.maxMonthlyOperations];
  return max <= 0 ? 0 : Math.round((used / max) * 100);
}

/** アップグレードの推奨先(上限超過 or 90%以上で1つ上のプラン)。無ければ null。 */
export function recommendUpgrade(tenant: Tenant): PlanTier | null {
  const idx = PLAN_ORDER.indexOf(tenant.plan);
  if (idx >= PLAN_ORDER.length - 1) return null;
  const metrics: UsageMetric[] = ["seats", "departments", "operations"];
  const pressured = metrics.some((m) => !withinLimit(tenant, m) || usagePercent(tenant, m) >= 90);
  return pressured ? PLAN_ORDER[idx + 1] : null;
}

// ---- Mock テナント ----

export const MOCK_TENANTS: readonly Tenant[] = [
  { id: "t-acme", name: "Acme商事", plan: "pro", seatsUsed: 22, departmentsUsed: 9, monthlyOperations: 41000 },
  { id: "t-bloom", name: "Bloom出版", plan: "free", seatsUsed: 3, departmentsUsed: 3, monthlyOperations: 980 },
  { id: "t-nova", name: "Nova Corp", plan: "enterprise", seatsUsed: 210, departmentsUsed: 24, monthlyOperations: 1200000 },
];
