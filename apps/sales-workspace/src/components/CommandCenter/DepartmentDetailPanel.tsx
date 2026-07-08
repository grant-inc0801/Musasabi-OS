import { useState } from "react";
import {
  CLEAN_CHECK_STATUS_COLOR,
  DEPT_STATUS_COLOR,
  DEPT_STATUS_LABEL_JA,
  PLANNING_DOC_STATUSES,
  PUBLISHING_CLEAN_CHECKS,
  PUBLISHING_STAFF,
  VAULT_FLOW_JA,
} from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";
import { recentEntriesFor } from "@musasabi/ai-company";
import { deptAssignedEmployees, deptBlockedItems, deptAuditNotes } from "@musasabi/ceo-dashboard";
import { MarketResearchDetail } from "./MarketResearchDetail";
import { recordMemory } from "../../lib/memoryStorage";
import { loadDeptChatHistory } from "../../lib/deptChatStorage";

// 右側: 部署詳細パネル(D-20260706-007)。部署パネルのクリックで表示。
// 営業部はコールシステム関連のMock情報を表示する(実架電なし)。

/** 営業部のコールシステムMock(Directive 5)。 */
const SALES_CALL_MOCK = {
  callsToday: 150,
  connectRate: 32,
  appointments: 28,
  deals: 12,
  inProgress: 120,
  queue: [
    { label: "待機中", count: 12, color: "#6b7280" },
    { label: "通話中", count: 68, color: "#22C55E" },
    { label: "後処理中", count: 28, color: "#3b82f6" },
    { label: "エラー", count: 12, color: "#EF4444" },
  ],
};

/** 営業部の実データ(CommandCenterPage で合成)。 */
export interface SalesLiveProps {
  callCount: number;
  completedCallCount: number;
  appointmentCount: number;
  wonCount: number;
  notCalledCount: number;
}

/**
 * 営業部のコールシステム表示。実データ(テストコール履歴・営業リスト)があれば
 * それを表示し、無ければMock値をMockと明示して表示する。
 */
function SalesCallSystemBlock({ live }: { live?: SalesLiveProps }) {
  const hasLive =
    live !== undefined &&
    (live.callCount > 0 || live.appointmentCount > 0 || live.wonCount > 0 || live.notCalledCount > 0);
  const stats = hasLive
    ? [
        { label: "架電数(テストコール累計)", value: `${live.callCount}件` },
        {
          label: "完了率",
          value: `${live.callCount > 0 ? Math.round((live.completedCallCount / live.callCount) * 100) : 0}%`,
        },
        { label: "アポ獲得数(営業リスト)", value: `${live.appointmentCount}件` },
        { label: "成約数(営業リスト)", value: `${live.wonCount}件` },
      ]
    : [
        { label: "架電数(本日)", value: `${SALES_CALL_MOCK.callsToday}件` },
        { label: "接続率", value: `${SALES_CALL_MOCK.connectRate}%` },
        { label: "アポ獲得数", value: `${SALES_CALL_MOCK.appointments}件` },
        { label: "成約数", value: `${SALES_CALL_MOCK.deals}件` },
      ];
  return (
    <div className="detail-block">
      <strong>
        コールシステム({hasLive ? "実データ・実架電なし" : "Mock・実架電なし"})
      </strong>
      <div className="detail-stats">
        {stats.map((s) => (
          <div key={s.label}>
            <span>{s.label}</span>
            <b>{s.value}</b>
          </div>
        ))}
      </div>
      {hasLive ? (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          未架電リード: {live.notCalledCount}件(営業部 &gt; 営業リストで管理)
        </p>
      ) : (
        <>
          <strong style={{ display: "block", marginTop: "0.6rem" }}>
            コール状況({SALES_CALL_MOCK.inProgress}件 進行中)
          </strong>
          <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1rem" }}>
            {SALES_CALL_MOCK.queue.map((q) => (
              <li key={q.label} style={{ margin: "0.15rem 0" }}>
                <span
                  className="dept-lamp"
                  style={{ background: q.color, boxShadow: `0 0 6px ${q.color}`, marginRight: 6 }}
                />
                {q.label}: {q.count}件
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * 出版部のクリーン運営/規約チェック(D-20260706-009)。AI編集長が
 * 利用ルール・著作権・類似性・出版可否をMockで管理する。実出版・実投稿はしない。
 */
function PublishingCleanBlock() {
  return (
    <>
      <div className="detail-block">
        <strong>クリーン運営 / 規約チェック(Mock・AI編集長)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1rem", fontSize: "0.82rem", listStyle: "none" }}>
          {PUBLISHING_CLEAN_CHECKS.map((c) => (
            <li key={c.item} style={{ margin: "0.2rem 0", display: "flex", alignItems: "center", gap: 6 }}>
              <span
                className="dept-lamp"
                style={{
                  background: CLEAN_CHECK_STATUS_COLOR[c.status],
                  boxShadow: `0 0 6px ${CLEAN_CHECK_STATUS_COLOR[c.status]}`,
                }}
              />
              {c.item}: {c.status}
            </li>
          ))}
        </ul>
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          高リスク案件・新規販売チャネルはCEO/管理部の承認待ちへ回します(Mock)。
          実出版・実投稿・実販売は行いません。
        </p>
      </div>
      <div className="detail-block">
        <strong>出版部AI社員(Mock)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {PUBLISHING_STAFF.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

/**
 * 企画部の資料作成・保管庫連携(D-20260706-010)。マニュアル・提案資料を作成し
 * 保管庫へ保存するMockフロー。実ファイル保存はしない。
 */
function PlanningDocsBlock() {
  const [savedNote, setSavedNote] = useState<string | null>(null);

  function handleSaveToVault(): void {
    setSavedNote("「保管庫操作ガイド v1.0」を保管庫へ保存しました(Mock)。");
    recordMemory({
      category: "work",
      actor: "AIドキュメントライター",
      action: "企画部: 資料を保管庫へ保存",
      detail: "保管庫操作ガイド v1.0(Mock)",
      tags: ["planning", "vault"],
    });
  }

  return (
    <div className="detail-block">
      <strong>資料作成・保管庫連携(Mock)</strong>
      <p style={{ margin: "0.35rem 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
        フロー: {VAULT_FLOW_JA}
      </p>
      {PLANNING_DOC_STATUSES.map((s) => (
        <div key={s.label} style={{ margin: "0.3rem 0" }}>
          <strong style={{ fontSize: "0.8rem" }}>{s.label}</strong>
          <ul style={{ margin: "0.1rem 0 0", paddingLeft: "1.1rem", fontSize: "0.78rem" }}>
            {s.items.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
      ))}
      <button type="button" onClick={handleSaveToVault} style={{ marginTop: "0.4rem" }}>
        保存待ち資料を保管庫へ保存(Mock)
      </button>
      {savedNote && <p style={{ color: "var(--ok)", fontSize: "0.8rem", margin: "0.4rem 0 0" }}>{savedNote}</p>}
    </div>
  );
}

export function DepartmentDetailPanel({
  dept,
  salesLive,
  onClose,
  onOpenDetail,
}: {
  dept: CommandDepartment | null;
  salesLive?: SalesLiveProps;
  onClose: () => void;
  onOpenDetail: (deptId: string) => void;
}) {
  if (!dept) {
    return (
      <aside className="dept-detail" aria-label="部署詳細">
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          部署パネルをクリックすると、ここに詳細が表示されます。
        </p>
      </aside>
    );
  }
  const color = DEPT_STATUS_COLOR[dept.status];
  return (
    <aside className="dept-detail" aria-label="部署詳細">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem" }}>{dept.name} 詳細</h2>
        <button type="button" onClick={onClose} style={{ padding: "0.15rem 0.6rem" }}>
          ×
        </button>
      </div>
      <p style={{ margin: "0.4rem 0 0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span className="dept-lamp" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        {DEPT_STATUS_LABEL_JA[dept.status]}
        <span style={{ color: "var(--text-muted)" }}>{dept.memberCount}人</span>
      </p>

      {dept.status === "error" && dept.errorCause && (
        <div className="detail-block" style={{ borderColor: "#EF444488" }}>
          <strong style={{ color: "#c93430" }}>エラー情報</strong>
          <p style={{ margin: "0.3rem 0 0" }}>原因: {dept.errorCause}</p>
          <p style={{ margin: "0.2rem 0 0" }}>対処: {dept.errorFix}</p>
        </div>
      )}

      {dept.id === "sales" && <SalesCallSystemBlock live={salesLive} />}
      {dept.id === "market_research" && <MarketResearchDetail />}
      {dept.id === "publishing" && <PublishingCleanBlock />}
      {dept.id === "planning" && <PlanningDocsBlock />}

      <div className="detail-block">
        <strong>作業内容</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem" }}>
          {dept.tasks.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <div className="detail-block">
        <strong>作業進捗</strong>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${dept.progressPercent}%`, background: color }}
          />
        </div>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{dept.progressPercent}%</span>
      </div>

      <div className="detail-block">
        <strong>作業ログ(最新{dept.logs.length}件)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {dept.logs.map((log) => (
            <li key={log}>{log}</li>
          ))}
        </ul>
      </div>

      <LayerBBlocks dept={dept} />

      <RecentInstructionsBlock deptId={dept.id} />

      <button type="button" onClick={() => onOpenDetail(dept.id)}>
        詳細を見る
      </button>
    </aside>
  );
}

/**
 * Layer B(部門インタラクション)の必須要素: 担当AI社員・ブロック項目・承認待ち・
 * 監査メモ・提案からIssue作成(Mock)。CEO_DASHBOARD_TWO_LAYER_UI_DIRECTIVE。
 */
function LayerBBlocks({ dept }: { dept: CommandDepartment }) {
  const employees = deptAssignedEmployees(dept.id);
  const blocked = deptBlockedItems(dept.id);
  const auditNotes = deptAuditNotes(dept.id);
  const waitingApproval = dept.status === "waiting_approval";
  const [issued, setIssued] = useState(false);

  return (
    <>
      <div className="detail-block">
        <strong>担当AI社員</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {employees.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </div>

      <div className="detail-block">
        <strong>ブロック項目</strong>
        {blocked.length === 0 ? (
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>なし</p>
        ) : (
          <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
            {blocked.map((b) => <li key={b}>{b}</li>)}
          </ul>
        )}
      </div>

      <div className="detail-block">
        <strong>承認待ち</strong>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.82rem", color: waitingApproval ? "var(--warn)" : "var(--text-muted)" }}>
          {waitingApproval ? "この部門に承認待ちの案件があります(CEO/管理部の承認へ)。" : "承認待ちはありません。"}
        </p>
      </div>

      <div className="detail-block">
        <strong>監査メモ(AI監査)</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
          {auditNotes.map((n) => <li key={n}>{n}</li>)}
        </ul>
      </div>

      <div className="detail-block">
        <strong>提案 → Issue(Mock)</strong>
        <p style={{ margin: "0.3rem 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          この部門の改善提案をドラフトIssue化します(実際のIssueは作成しません)。
        </p>
        <button type="button" onClick={() => setIssued(true)} disabled={issued}>
          {issued ? "ドラフトIssue作成済み(Mock)" : "提案をIssueドラフト化"}
        </button>
        {issued && (
          <p style={{ color: "var(--ok)", fontSize: "0.8rem", margin: "0.35rem 0 0" }}>
            「[提案] {dept.name}の改善」ドラフトを作成しました(Mock)。
          </p>
        )}
      </div>
    </>
  );
}

/** この部署あての直近の指示(チャット履歴から。無ければ非表示)。 */
function RecentInstructionsBlock({ deptId }: { deptId: string }) {
  const recent = recentEntriesFor(loadDeptChatHistory(), deptId, 3);
  if (recent.length === 0) return null;
  return (
    <div className="detail-block">
      <strong>直近の指示(チャット)</strong>
      <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", fontSize: "0.82rem" }}>
        {recent.map((e) => (
          <li key={e.atMs}>
            {new Date(e.atMs).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}{" "}
            {e.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
