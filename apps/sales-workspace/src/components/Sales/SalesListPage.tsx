import { useState } from "react";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL_JA,
  countByStatus,
  setLeadNote,
  setLeadStatus,
} from "@musasabi/sales-list";
import type { LeadStatus, SalesLead } from "@musasabi/sales-list";
import { loadLeads, saveLeads, setCallHandoff } from "../../lib/salesListStorage";
import { recordMemory } from "../../lib/memoryStorage";

// 営業リスト(Development Bible 第13章)。架電リスト制作課から取り込んだ店舗の
// ステータス管理(未架電→架電済→アポ獲得→成約)とテストコールへの連携。
// 実架電はしない(テストコールはMock)。保存はこの端末内のみ。

export function SalesListPage({ onNavigateToCallTraining }: { onNavigateToCallTraining: () => void }) {
  const [leads, setLeads] = useState<SalesLead[]>(() => loadLeads());
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const counts = countByStatus(leads);
  const visible = statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter);

  function handleStatus(id: string, status: LeadStatus): void {
    const next = setLeadStatus(leads, id, status, Date.now());
    setLeads(next);
    saveLeads(next);
    const lead = next.find((l) => l.id === id);
    recordMemory({
      category: "work",
      actor: "user",
      action: "営業リストのステータス更新",
      detail: `${lead?.storeName ?? id} → ${LEAD_STATUS_LABEL_JA[status]}`,
      tags: ["sales-list"],
    });
  }

  function handleNote(id: string, note: string): void {
    const next = setLeadNote(leads, id, note, Date.now());
    setLeads(next);
    saveLeads(next);
  }

  function handleCall(lead: SalesLead): void {
    setCallHandoff(`${lead.storeName} ${lead.phone}`.trim());
    onNavigateToCallTraining();
  }

  return (
    <>
      <section aria-label="営業リスト集計">
        <h3 style={{ marginTop: 0 }}>営業リスト({leads.length}件)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          開発部の架電リスト制作課で「営業リストへ取り込む」と、ここに追加されます。
          ステータスとメモはこの端末内に保存されます(実架電はしません)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {LEAD_STATUSES.map((status) => (
            <div key={status} className="card" style={{ minWidth: "7.5rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {LEAD_STATUS_LABEL_JA[status]}
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{counts[status]}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="営業リスト一覧">
        <div style={{ marginBottom: "0.75rem" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            aria-label="ステータスで絞り込み"
          >
            <option value="all">すべてのステータス</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABEL_JA[s]}
              </option>
            ))}
          </select>
        </div>
        {visible.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            該当するリードがありません。架電リスト制作課から取り込んでください。
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", whiteSpace: "nowrap" }}>
              <thead>
                <tr>
                  {["店舗名", "電話番号", "住所", "ジャンル", "取込元", "ステータス", "メモ", ""].map((h, i) => (
                    <th key={i} style={cellStyle}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((lead) => (
                  <tr key={lead.id}>
                    <td style={cellStyle}>{lead.storeName}</td>
                    <td style={cellStyle}>{lead.phone || "—"}</td>
                    <td style={cellStyle}>{lead.address}</td>
                    <td style={cellStyle}>{lead.genre}</td>
                    <td style={cellStyle}>{lead.source}</td>
                    <td style={cellStyle}>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatus(lead.id, e.target.value as LeadStatus)}
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {LEAD_STATUS_LABEL_JA[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <input
                        type="text"
                        defaultValue={lead.note}
                        onBlur={(e) => handleNote(lead.id, e.target.value)}
                        placeholder="メモ"
                        style={{ width: "10rem" }}
                      />
                    </td>
                    <td style={cellStyle}>
                      <button type="button" onClick={() => handleCall(lead)}>
                        テストコールへ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
