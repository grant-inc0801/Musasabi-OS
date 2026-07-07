import {
  PLANNING_DOC_STATUSES,
  PLANNING_DOC_TASKS,
  VAULT_FLOW_JA,
  VAULT_ITEMS,
  VAULT_STATUS_COLOR,
  computeVaultSummary,
  filterVaultItems,
} from "@musasabi/ai-company";
import { recordMemory } from "../../lib/memoryStorage";

// 企画部ページ(従来画面)。資料作成業務と保管庫連携(D-20260706-010)。
// すべてMock(実ファイル操作なし)。

function formatKb(kb: number): string {
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)}MB` : `${kb}KB`;
}

export function PlanningPage() {
  const summary = computeVaultSummary(VAULT_ITEMS);
  const planningDocs = filterVaultItems(VAULT_ITEMS, { dept: "企画部" });

  function handleSaveToVault(): void {
    alert("「保管庫操作ガイド v1.0」を保管庫へ保存しました(Mock)。");
    recordMemory({
      category: "work",
      actor: "AIドキュメントライター",
      action: "企画部: 資料を保管庫へ保存",
      detail: "保管庫操作ガイド v1.0(Mock)",
      tags: ["planning", "vault"],
    });
  }

  return (
    <>
      <section aria-label="企画部の業務">
        <h3 style={{ marginTop: 0 }}>資料作成業務(Mock)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          開発した自動化・新ツール・新サービスのマニュアルや提案資料を作成し、
          保管庫へ保存します。フロー: {VAULT_FLOW_JA}
        </p>
        <ul>
          {PLANNING_DOC_TASKS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section aria-label="資料状況">
        <h3 style={{ marginTop: 0 }}>資料状況</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {PLANNING_DOC_STATUSES.map((s) => (
            <div key={s.label} className="card" style={{ minWidth: "16rem", flex: "1 1 16rem" }}>
              <strong style={{ fontSize: "0.9rem" }}>{s.label}({s.items.length})</strong>
              <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.1rem", fontSize: "0.85rem" }}>
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button type="button" onClick={handleSaveToVault} style={{ marginTop: "0.75rem" }}>
          保存待ち資料を保管庫へ保存(Mock)
        </button>
      </section>

      <section aria-label="保管庫の状態">
        <h3 style={{ marginTop: 0 }}>保管庫の状態</h3>
        <p style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="dept-lamp"
            style={{
              background: VAULT_STATUS_COLOR[summary.status],
              boxShadow: `0 0 8px ${VAULT_STATUS_COLOR[summary.status]}`,
            }}
          />
          {summary.status} — {formatKb(summary.totalKb)} / {formatKb(summary.capacityKb)}
          (使用率{summary.usagePercent}%)・保管{summary.itemCount}件
        </p>
        <h4>企画部の保管資料({planningDocs.length}件)</h4>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["タイトル", "種類", "バージョン", "更新日", "サイズ", "ステータス"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planningDocs.map((d) => (
              <tr key={d.id}>
                <td style={cellStyle}>
                  {d.isProtected ? "🔒 " : ""}
                  {d.title}
                </td>
                <td style={cellStyle}>{d.category}</td>
                <td style={cellStyle}>{d.version}</td>
                <td style={cellStyle}>{new Date(d.updatedAtMs).toLocaleDateString("ja-JP")}</td>
                <td style={cellStyle}>{formatKb(d.sizeKb)}</td>
                <td style={cellStyle}>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          全資料の閲覧・容量管理はコマンドセンターの「保管庫」パネルから行えます。
        </p>
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
