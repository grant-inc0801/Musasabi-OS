import { useState } from "react";
import {
  FAQ_ITEMS,
  SUPPORT_STAFF,
  TICKET_STATUSES,
  TICKET_STATUS_COLOR,
  buildSupportKpi,
  setTicketStatus,
  type SupportTicket,
  type TicketStatus,
} from "@musasabi/ai-company";
import { recordMemory } from "../../lib/memoryStorage";
import { loadSupportTickets, saveTicketStatus } from "../../lib/supportStorage";

// カスタマーサポート部ページ(従来画面・サポート部充実フェーズ)。
// すべてMock(実問い合わせ受信・実メール/チャット接続・外部送信なし)。

export function SupportPage() {
  const [tickets, setTickets] = useState<readonly SupportTicket[]>(() => loadSupportTickets());
  const kpi = buildSupportKpi(tickets);
  const tiles = [
    { label: "未対応", value: kpi.openCount, color: TICKET_STATUS_COLOR["未対応"] },
    { label: "対応中", value: kpi.inProgressCount, color: TICKET_STATUS_COLOR["対応中"] },
    { label: "回答済み", value: kpi.answeredCount, color: TICKET_STATUS_COLOR["回答済み"] },
    { label: "クローズ", value: kpi.closedCount, color: TICKET_STATUS_COLOR["クローズ"] },
    { label: "FAQ", value: kpi.faqCount, color: "var(--border)" },
  ];

  function handleStatusChange(ticket: SupportTicket, status: TicketStatus): void {
    if (status === ticket.status) return;
    setTickets((prev) => setTicketStatus(prev, ticket.id, status));
    saveTicketStatus(ticket.id, status);
    recordMemory({
      category: "work",
      actor: ticket.assignee,
      action: "サポート部: 問い合わせステータス変更",
      detail: `${ticket.id} ${ticket.subject}: ${ticket.status} → ${status}(Mock)`,
      tags: ["support"],
    });
  }

  return (
    <>
      <section aria-label="サポートKPI">
        <h3 style={{ marginTop: 0 }}>問い合わせ状況(Mock)</h3>
        <p style={{ color: "var(--warn)", fontSize: "0.9rem" }}>
          β版はMock表示のみです(実問い合わせ受信・実メール/チャット接続は行いません)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "8rem", textAlign: "center" }}>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span
                  className="dept-lamp"
                  style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }}
                />
                {t.label}
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>{t.value}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>件</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="問い合わせ一覧">
        <h3 style={{ marginTop: 0 }}>問い合わせ一覧(Mock)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["ID", "件名", "顧客", "チャネル", "優先度", "受信", "担当", "ステータス"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td style={cellStyle}>{t.id}</td>
                <td style={cellStyle}>{t.subject}</td>
                <td style={cellStyle}>{t.customer}</td>
                <td style={cellStyle}>{t.channel}</td>
                <td style={cellStyle}>{t.priority}</td>
                <td style={cellStyle}>{t.receivedAt}</td>
                <td style={cellStyle}>{t.assignee}</td>
                <td style={cellStyle}>
                  <span
                    className="dept-lamp"
                    style={{
                      background: TICKET_STATUS_COLOR[t.status],
                      boxShadow: `0 0 6px ${TICKET_STATUS_COLOR[t.status]}`,
                      marginRight: 6,
                    }}
                  />
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t, e.target.value as TicketStatus)}
                    aria-label={`${t.id} のステータス`}
                  >
                    {TICKET_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          ステータス変更はMockで、Memory(Company Brain)へ業務記録として残ります。
        </p>
      </section>

      <section aria-label="FAQ">
        <h3 style={{ marginTop: 0 }}>FAQ(Mock)</h3>
        <ul>
          {FAQ_ITEMS.map((f) => (
            <li key={f.question} style={{ margin: "0.35rem 0" }}>
              <strong>{f.question}</strong>(更新 {f.updatedAt}・閲覧 {f.views}回)
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{f.answer}</div>
            </li>
          ))}
        </ul>
        <h4>サポート部AI社員(Mock)</h4>
        <ul>
          {SUPPORT_STAFF.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
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
