// Phase 6: Operational Excellence(Directive D-20260708-007)。
// 本番運用の監視・インシデント管理・SLO/KPI・復旧手順を扱う(Mock・決定論)。
// 実監視データには接続しない。

/** サービスの稼働メトリクス(Mock)。 */
export interface ServiceMetric {
  service: string;
  /** 稼働率(0-100)。 */
  uptimePercent: number;
  /** エラー率(%)。 */
  errorRatePercent: number;
  /** p95 レイテンシ(ms)。 */
  p95LatencyMs: number;
}

/** SLO 目標。 */
export interface Slo {
  minUptimePercent: number;
  maxErrorRatePercent: number;
  maxP95LatencyMs: number;
}

export const DEFAULT_SLO: Slo = {
  minUptimePercent: 99.5,
  maxErrorRatePercent: 1,
  maxP95LatencyMs: 800,
};

export type SloStatus = "healthy" | "at_risk" | "breached";

export const SLO_STATUS_LABEL_JA: Record<SloStatus, string> = {
  healthy: "正常",
  at_risk: "注意",
  breached: "違反",
};

/** メトリクスを SLO と比較して状態を判定する(決定論)。 */
export function evaluateSlo(metric: ServiceMetric, slo: Slo = DEFAULT_SLO): SloStatus {
  const breached =
    metric.uptimePercent < slo.minUptimePercent ||
    metric.errorRatePercent > slo.maxErrorRatePercent ||
    metric.p95LatencyMs > slo.maxP95LatencyMs;
  if (breached) return "breached";
  const atRisk =
    metric.uptimePercent < slo.minUptimePercent + 0.3 ||
    metric.errorRatePercent > slo.maxErrorRatePercent * 0.7 ||
    metric.p95LatencyMs > slo.maxP95LatencyMs * 0.85;
  return atRisk ? "at_risk" : "healthy";
}

/** インシデント。 */
export type IncidentSeverity = "sev1" | "sev2" | "sev3";
export type IncidentStatus = "open" | "mitigating" | "resolved";

export const SEVERITY_LABEL_JA: Record<IncidentSeverity, string> = {
  sev1: "重大(Sev1)",
  sev2: "高(Sev2)",
  sev3: "中(Sev3)",
};

export const INCIDENT_STATUS_LABEL_JA: Record<IncidentStatus, string> = {
  open: "未対応",
  mitigating: "対応中",
  resolved: "解決済み",
};

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  /** 復旧手順(ランブック)のキー。 */
  runbookId?: string;
}

/** 復旧手順(ランブック)。 */
export interface Runbook {
  id: string;
  title: string;
  steps: readonly string[];
}

export const RUNBOOKS: readonly Runbook[] = [
  {
    id: "rb-restart",
    title: "サービス再起動手順",
    steps: ["監視ダッシュボードで対象を特定", "ヘルスチェックを確認", "ローリング再起動を実行", "回復を確認しインシデントを更新"],
  },
  {
    id: "rb-restore",
    title: "バックアップからの復元手順",
    steps: ["直近の正常バックアップを特定", "復元先を隔離環境で準備", "整合性を検証", "本番へ切替(承認必須)"],
  },
];

export function getRunbook(id: string, runbooks: readonly Runbook[] = RUNBOOKS): Runbook | undefined {
  return runbooks.find((r) => r.id === id);
}

// ---- 運用サマリー ----

export interface OpsSummary {
  services: number;
  healthy: number;
  atRisk: number;
  breached: number;
  openIncidents: number;
  /** 全サービスの平均稼働率。 */
  avgUptimePercent: number;
  lines: string[];
}

/** 運用サマリーを組み立てる(決定論)。 */
export function buildOpsSummary(
  metrics: readonly ServiceMetric[],
  incidents: readonly Incident[],
  slo: Slo = DEFAULT_SLO,
): OpsSummary {
  const statuses = metrics.map((m) => evaluateSlo(m, slo));
  const healthy = statuses.filter((s) => s === "healthy").length;
  const atRisk = statuses.filter((s) => s === "at_risk").length;
  const breached = statuses.filter((s) => s === "breached").length;
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;
  const avgUptimePercent =
    metrics.length === 0
      ? 0
      : Math.round((metrics.reduce((s, m) => s + m.uptimePercent, 0) / metrics.length) * 100) / 100;
  const lines: string[] = [];
  lines.push(`監視対象${metrics.length}サービス中、違反${breached}件・注意${atRisk}件です。`);
  lines.push(`未解決インシデントは${openIncidents}件、平均稼働率は${avgUptimePercent}%です。`);
  return { services: metrics.length, healthy, atRisk, breached, openIncidents, avgUptimePercent, lines };
}

// ---- Mock データ ----

export const MOCK_METRICS: readonly ServiceMetric[] = [
  { service: "sales-workspace", uptimePercent: 99.95, errorRatePercent: 0.2, p95LatencyMs: 420 },
  { service: "ai-company-api", uptimePercent: 99.6, errorRatePercent: 0.8, p95LatencyMs: 690 },
  { service: "beta-build", uptimePercent: 99.2, errorRatePercent: 1.4, p95LatencyMs: 900 },
];

export const MOCK_INCIDENTS: readonly Incident[] = [
  { id: "inc-01", title: "beta-build のエラー率上昇", service: "beta-build", severity: "sev2", status: "mitigating", runbookId: "rb-restart" },
  { id: "inc-02", title: "APIレイテンシの一時上昇", service: "ai-company-api", severity: "sev3", status: "resolved" },
];
