import type { Lead, LeadStatus } from "@musasabi/ai-core";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "新規",
  contacted: "連絡済み",
  callback: "コールバック",
  interested: "興味あり",
  negotiating: "交渉中",
  appointment: "アポイントメント",
  lost: "失注",
};

export function LeadTable({ leads }: { leads: Lead[] }) {
  return (
    <section aria-label="リード一覧">
      <h2>リード一覧</h2>
      <table>
        <thead>
          <tr>
            <th>氏名</th>
            <th>会社</th>
            <th>ステータス</th>
            <th>優先度</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.company}</td>
              <td>{STATUS_LABEL[lead.status]}</td>
              <td>{lead.priorityScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
