import {
  COMMAND_DEPARTMENTS,
  DEPT_STATUS_LABEL_JA,
  deptIcon,
  summarizeCompany,
  type CommandDepartment,
  type DeptStatus,
} from "./commandCenter";
import { buildSupportKpi, SUPPORT_TICKETS } from "./supportDesk";
import { buildDevKpi, DEV_PROJECTS } from "./devProjects";
import { buildMarketingKpi, buildAccountingSummary, buildHrKpi } from "./backOffice";
import { buildMarketResearchKpi } from "./marketResearch";
import { computeVaultSummary } from "./knowledgeVault";
import { VAULT_ITEMS } from "./knowledgeVault";
import { formatJpy } from "./summary";

// D-011 Core Departments Completion: 全部署のKPIを一元表示する全社ダッシュボード。
// 各部署ページ/Command Center で使う既存の集計関数を横断的に束ねる(すべてMock)。

/** ダッシュボードの1部署ぶんの要約行。 */
export interface DeptDashboardRow {
  deptId: string;
  name: string;
  icon: string;
  status: DeptStatus;
  statusLabel: string;
  memberCount: number;
  progressPercent: number;
  /** 部署ごとの主要指標(2〜3件)。 */
  metrics: { label: string; value: string }[];
}

export interface CompanyDashboard {
  totalMembers: number;
  activeMembers: number;
  utilizationPercent: number;
  departments: DeptDashboardRow[];
}

/** 部署IDごとの主要指標を既存の集計関数から導出する。 */
function metricsFor(dept: CommandDepartment): { label: string; value: string }[] {
  switch (dept.id) {
    case "sales":
      return [{ label: "本日進捗", value: `${dept.progressPercent}%` }];
    case "support": {
      const k = buildSupportKpi(SUPPORT_TICKETS);
      return [
        { label: "未対応", value: `${k.openCount}件` },
        { label: "対応中", value: `${k.inProgressCount}件` },
      ];
    }
    case "marketing": {
      const k = buildMarketingKpi();
      return [
        { label: "配信中", value: `${k.activeCampaigns}件` },
        { label: "リード", value: `${k.totalLeads}件` },
      ];
    }
    case "development": {
      const k = buildDevKpi(DEV_PROJECTS);
      return [
        { label: "エラー対応", value: `${k.errorCount}件` },
        { label: "リリース済", value: `${k.released}件` },
      ];
    }
    case "publishing":
      return [{ label: "本日進捗", value: `${dept.progressPercent}%` }];
    case "planning": {
      const v = computeVaultSummary(VAULT_ITEMS);
      return [
        { label: "保管件数", value: `${v.itemCount}件` },
        { label: "使用率", value: `${v.usagePercent}%` },
      ];
    }
    case "accounting": {
      const s = buildAccountingSummary();
      return [
        { label: "収支", value: formatJpy(s.balanceJpy) },
        { label: "未確定", value: `${s.pendingCount}件` },
      ];
    }
    case "hr": {
      const k = buildHrKpi();
      return [
        { label: "平均稼働", value: `${k.averageUtilizationPercent}%` },
        { label: "承認待ち", value: `${k.hiringPendingApproval}件` },
      ];
    }
    case "market_research": {
      const k = buildMarketResearchKpi();
      return [
        { label: "新サービス", value: `${k.newServicesFound}件` },
        { label: "CEO提案待ち", value: `${k.ceoPending}件` },
      ];
    }
    default:
      return [{ label: "本日進捗", value: `${dept.progressPercent}%` }];
  }
}

/**
 * 全社ダッシュボードを構築する。営業部の実データを反映したい場合は、
 * withLiveSalesData を通した departments を渡す(既定は COMMAND_DEPARTMENTS)。
 */
export function buildCompanyDashboard(
  departments: readonly CommandDepartment[] = COMMAND_DEPARTMENTS,
): CompanyDashboard {
  const overview = summarizeCompany(departments);
  return {
    totalMembers: overview.totalMembers,
    activeMembers: overview.activeMembers,
    utilizationPercent: overview.utilizationPercent,
    departments: departments.map((d) => ({
      deptId: d.id,
      name: d.name,
      icon: deptIcon(d.id),
      status: d.status,
      statusLabel: DEPT_STATUS_LABEL_JA[d.status],
      memberCount: d.memberCount,
      progressPercent: d.progressPercent,
      metrics: metricsFor(d),
    })),
  };
}
