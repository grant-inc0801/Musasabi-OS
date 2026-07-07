import { useMemo, useRef, useState } from "react";
import {
  COMMAND_DEPARTMENTS,
  DEPT_CONNECTIONS,
  DEPT_STATUS_COLOR,
  DEPT_STATUS_LABEL_JA,
  DEPT_STATUSES,
  summarizeCompany,
} from "@musasabi/ai-company";
import { DepartmentCard } from "./DepartmentCard";
import { DepartmentConnectionLines } from "./DepartmentConnectionLines";
import { DepartmentDetailPanel } from "./DepartmentDetailPanel";
import { DepartmentCommandChat } from "./DepartmentCommandChat";
import { AssistantAvatar } from "./AssistantAvatar";
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
};

export function CommandCenterPage({
  onOpenSettings,
  onOpenPage,
}: {
  onOpenSettings: () => void;
  onOpenPage: (page: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // callback ref で state に載せ、マウント後にライン計測が走るようにする
  const [gridEl, setGridEl] = useState<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const overview = useMemo(() => summarizeCompany(COMMAND_DEPARTMENTS), []);
  const selected = COMMAND_DEPARTMENTS.find((d) => d.id === selectedId) ?? null;

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

        <button type="button" className="cc-settings" onClick={onOpenSettings}>
          ⚙ 設定
        </button>
      </aside>

      <main className="cc-main">
        <h1 className="cc-title">
          部署一覧 <small>リアルタイムステータス(Mock)</small>
        </h1>
        <div className="cc-grid-wrap" ref={setGridEl}>
          <DepartmentConnectionLines
            container={gridEl}
            cards={cardRefs.current}
            connections={DEPT_CONNECTIONS}
          />
          <div className="cc-grid">
            {COMMAND_DEPARTMENTS.map((dept) => (
              <DepartmentCard
                key={dept.id}
                dept={dept}
                selected={dept.id === selectedId}
                onSelect={(id) => setSelectedId((prev) => (prev === id ? null : id))}
                ref={(node) => {
                  if (node) cardRefs.current.set(dept.id, node);
                  else cardRefs.current.delete(dept.id);
                }}
              />
            ))}
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
          <span>
            <span className="legend-line" /> 部門間連携中
          </span>
        </div>
        <DepartmentCommandChat departments={COMMAND_DEPARTMENTS} />
      </main>

      <DepartmentDetailPanel
        dept={selected}
        onClose={() => setSelectedId(null)}
        onOpenDetail={(deptId) => onOpenPage(DEPT_PAGE[deptId] ?? "company")}
      />

      <AssistantAvatar departments={COMMAND_DEPARTMENTS} />
    </div>
  );
}
