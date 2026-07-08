import { useState } from "react";
import {
  COLLAB_ITEMS,
  COLLAB_STATUS_COLOR,
  COLLAB_TYPES,
  SHARED_KNOWLEDGE,
  buildCollaborationSummary,
  collabIcons,
  filterCollabItems,
  type CollabType,
} from "@musasabi/ai-company";

// D-013 Company Brain & Collaboration Engine: 部署間の引き継ぎ・提案・共有ナレッジを
// 可視化する。すべてMock(実実行・外部送信なし)。

export function CollaborationPage() {
  const [type, setType] = useState<CollabType | "all">("all");
  const summary = buildCollaborationSummary();
  const items = filterCollabItems(COLLAB_ITEMS, {
    type: type === "all" ? undefined : type,
  });

  const tiles = [
    { label: "連携項目", value: `${summary.totalItems}件` },
    { label: "対応中", value: `${summary.inProgress}件` },
    { label: "承認待ち", value: `${summary.waitingApproval}件` },
    { label: "共有ナレッジ", value: `${summary.sharedKnowledgeCount}件` },
    { label: "採用(延べ)", value: `${summary.adoptionCount}部署` },
  ];

  return (
    <>
      <section aria-label="コラボレーション概要">
        <h3 style={{ marginTop: 0 }}>コラボレーション・エンジン</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          部署間の引き継ぎ・提案・承認依頼と、全社で共有・採用されるナレッジを一元表示します
          (Company Brain の協働レイヤー。すべてMock)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "8.5rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="部署間の連携">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>部署間の連携(引き継ぎ・提案・承認)</h3>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CollabType | "all")}
            aria-label="種別で絞り込み"
          >
            <option value="all">すべての種別</option>
            {COLLAB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <table style={{ borderCollapse: "collapse", marginTop: "0.6rem" }}>
          <thead>
            <tr>
              {["連携元", "連携先", "種別", "内容", "状態", "日付"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => {
              const icons = collabIcons(i);
              return (
                <tr key={i.id}>
                  <td style={cellStyle}>
                    {icons.from} {i.fromDept}
                  </td>
                  <td style={cellStyle}>
                    {icons.to} {i.toDept}
                  </td>
                  <td style={cellStyle}>{i.type}</td>
                  <td style={cellStyle}>{i.title}</td>
                  <td style={{ ...cellStyle, whiteSpace: "nowrap" }}>
                    <span
                      className="dept-lamp"
                      style={{
                        background: COLLAB_STATUS_COLOR[i.status],
                        boxShadow: `0 0 6px ${COLLAB_STATUS_COLOR[i.status]}`,
                        marginRight: 6,
                      }}
                    />
                    {i.status}
                  </td>
                  <td style={cellStyle}>{i.createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section aria-label="全社共有ナレッジ">
        <h3 style={{ marginTop: 0 }}>全社共有ナレッジ</h3>
        <ul style={{ paddingLeft: 0, listStyle: "none" }}>
          {SHARED_KNOWLEDGE.map((k) => (
            <li key={k.id} style={{ margin: "0.4rem 0" }}>
              <strong>[{k.category}] {k.title}</strong>
              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                発信: {k.sourceDept} ／ 採用: {k.adoptedByDepts.join("・")}
              </div>
            </li>
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
