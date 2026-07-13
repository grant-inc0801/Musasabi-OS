import { useMemo, useState } from "react";
import {
  COMMAND_DEPARTMENTS,
  DEPT_STATUS_COLOR,
  DEPT_STATUS_LABEL_JA,
  DEPT_STATUSES,
  summarizeCompany,
  withLiveSalesData,
} from "@musasabi/ai-company";
import { callLogStats } from "@musasabi/call-training";
import { countByStatus } from "@musasabi/sales-list";
import { loadCallLog } from "../../lib/callLogStorage";
import { loadLeads } from "../../lib/salesListStorage";
import { loadMemoryRecords } from "../../lib/memoryStorage";
import { VAULT_CAPACITY_CHARS, loadVaultDocs, vaultUsageChars } from "../../lib/vaultStorage";
import { DepartmentCylinder } from "./DepartmentCylinder";
import { VaultDetailPanel } from "./VaultDetailPanel";
import { DepartmentDetailPanel } from "./DepartmentDetailPanel";
import { DepartmentCommandChat } from "./DepartmentCommandChat";
import { AiSecretaryPanel } from "./AiSecretaryPanel";
import { CeoDashboardPanel } from "./CeoDashboardPanel";
import brandIcon from "../../assets/brand-icon.png";

// Musasabi Command Center(Directive D-20260706-007)。
// シルバーグレー近未来UI: 最小サイドバー+部署パネル一覧+右詳細+下部チャット+
// 右下アバター。βはMockデータ(実架電・実API・外部送信なし)。

/** 「詳細を見る」で開く既存ページ(部署→従来画面)。 */
const DEPT_PAGE: Record<string, string> = {
  sales: "sales_kpi",
  support: "support",
  development: "development",
  publishing: "publishing",
  planning: "planning",
  market_research: "market_research",
  marketing: "marketing",
  accounting: "accounting",
  hr: "hr",
};

export function CommandCenterPage({
  onOpenSettings,
  onOpenPage,
}: {
  onOpenSettings: () => void;
  onOpenPage: (page: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 営業部は実データ(テストコール履歴・営業リスト・Memory)を反映する。
  // データが無い場合はMock表示のまま(withLiveSalesData 側で判定)。
  const { departments, salesLive } = useMemo(() => {
    const stats = callLogStats(loadCallLog());
    const leadCounts = countByStatus(loadLeads());
    const recentLogs = loadMemoryRecords()
      .filter((r) => r.category === "work")
      .slice(0, 5)
      .map(
        (r) =>
          `${new Date(r.timestampMs).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} ${r.action}`,
      );
    const live = {
      callCount: stats.sessionCount,
      appointmentCount: leadCounts.appointment,
      wonCount: leadCounts.won,
      notCalledCount: leadCounts.not_called,
      recentLogs,
    };
    return {
      departments: withLiveSalesData(COMMAND_DEPARTMENTS, live),
      salesLive: { ...live, completedCallCount: stats.completedCount },
    };
  }, []);

  const overview = useMemo(() => summarizeCompany(departments), [departments]);
  const selected = departments.find((d) => d.id === selectedId) ?? null;

  return (
    <div className="command-center">
      <aside className="cc-sidebar" aria-label="サイドバー">
        <img src={brandIcon} width={44} height={44} alt="" style={{ borderRadius: 10 }} />
        <div className="cc-logo">Musasabi OS</div>

        <div className="cc-stat">
          <span>全社員数</span>
          <b>{overview.totalMembers}人</b>
          <small>(稼働中: {overview.activeMembers}人)</small>
        </div>

        <div className="cc-stat">
          <span>稼働率</span>
          <div className="cc-gauge" style={{ ["--pct" as string]: `${overview.utilizationPercent}` }}>
            <b>{overview.utilizationPercent}%</b>
          </div>
        </div>

        <button
          type="button"
          className="cc-navbtn"
          onClick={() => onOpenPage("company_dashboard")}
        >
          📊 全社ダッシュボード
        </button>
        <button type="button" className="cc-settings" onClick={onOpenSettings}>
          ⚙ 設定
        </button>
      </aside>

      <main className="cc-main">
        <h1 className="cc-title">
          部署一覧 <small>リアルタイムステータス(Mock)</small>
        </h1>
        <div className="cc-grid-wrap">
          <div className="cc-grid">
            {departments.map((dept) => (
              <DepartmentCylinder
                key={dept.id}
                dept={dept}
                selected={dept.id === selectedId}
                onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
              />
            ))}
            <VaultCard
              selected={selectedId === "vault"}
              onSelect={() => setSelectedId((prev) => (prev === "vault" ? null : "vault"))}
            />
          </div>
        </div>
        <div className="cc-legend">
          {DEPT_STATUSES.map((s) => (
            <span key={s}>
              <span
                className="dept-lamp"
                style={{ background: DEPT_STATUS_COLOR[s], boxShadow: `0 0 6px ${DEPT_STATUS_COLOR[s]}` }}
              />
              {DEPT_STATUS_LABEL_JA[s]}
            </span>
          ))}
        </div>
        <CeoDashboardPanel departments={departments} />
      </main>

      {selectedId === "vault" ? (
        <VaultDetailPanel onClose={() => setSelectedId(null)} />
      ) : selected ? (
        <DepartmentDetailPanel
          dept={selected}
          salesLive={salesLive}
          onClose={() => setSelectedId(null)}
          onOpenDetail={(deptId) => onOpenPage(DEPT_PAGE[deptId] ?? "company")}
        />
      ) : (
        /* 部署未選択の既定状態: AI秘書 / 参謀モード(AI Secretary directive) */
        <AiSecretaryPanel />
      )}

      {/* 右下フロート: Musasabi アシスタントチャット(第8弾でアバターを置き換え) */}
      <DepartmentCommandChat departments={departments} />
    </div>
  );
}

/** 保管庫パネル(名称・保管件数・使用容量・容量ステータス)。実文書ストアの実データ表示。 */
function VaultCard({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  const docs = loadVaultDocs();
  const usage = vaultUsageChars(docs);
  const usagePercent = Math.min(100, Math.round((usage / VAULT_CAPACITY_CHARS) * 100));
  const status = usagePercent >= 90 ? "危険" : usagePercent >= 70 ? "注意" : "正常";
  const color = usagePercent >= 90 ? "#EF4444" : usagePercent >= 70 ? "#F59E0B" : "#22C55E";
  return (
    <button
      type="button"
      className={`dept-card${selected ? " selected" : ""}`}
      style={{ ["--glow" as string]: color }}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="dept-card-sheen" aria-hidden="true" />
      <div className="dept-card-head">
        <span className="dept-card-icon" aria-hidden="true">
          🗄
        </span>
        <div className="dept-card-name">保管庫</div>
      </div>
      <div className="dept-card-members">
        {docs.length}件 / {(usage / 1000).toFixed(1)}千文字
      </div>
      <div className="dept-card-status">
        <span className="dept-lamp" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        {status}(使用率{usagePercent}%)
      </div>
    </button>
  );
}
