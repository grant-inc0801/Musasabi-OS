import { useState } from "react";
import {
  ACCOUNTING_STAFF,
  LEDGER_ENTRIES,
  buildAccountingSummary,
  formatJpy,
} from "@musasabi/ai-company";
import { buildXlsx } from "@musasabi/call-list";
import { saveBinaryFile } from "../../lib/saveFile";

// 経理部ページ(従来画面・コア部署の完成フェーズ)。
// すべてMock(実会計データ・実銀行/会計ソフト連携なし)。

export function AccountingPage() {
  const summary = buildAccountingSummary();
  const [exportNote, setExportNote] = useState<string | null>(null);

  async function handleExport(): Promise<void> {
    // 仕訳一覧+収支サマリー行をExcel(.xlsx)で書き出す(既存のbuildXlsxを再利用)。
    const header = ["日付", "項目", "区分", "金額(円)", "状態"];
    const rows: string[][] = [
      header,
      ...LEDGER_ENTRIES.map((e) => [e.date, e.item, e.category, String(e.amountJpy), e.status]),
      [],
      ["収支サマリー(確定分)", "", "", "", ""],
      ["売上(確定)", "", "", String(summary.incomeJpy), ""],
      ["経費(確定)", "", "", String(summary.expenseJpy), ""],
      ["収支", "", "", String(summary.balanceJpy), ""],
      ["未確定件数", "", "", String(summary.pendingCount), ""],
    ];
    const bytes = buildXlsx(rows, "経理");
    const stamp = new Date().toISOString().slice(0, 10);
    const result = await saveBinaryFile(`musasabi-accounting-${stamp}.xlsx`, bytes, "Excel", ["xlsx"]);
    setExportNote(
      result === "cancelled" ? "書き出しをキャンセルしました。" : "仕訳・収支をExcelで書き出しました。",
    );
  }

  const tiles = [
    { label: "売上(確定)", value: formatJpy(summary.incomeJpy) },
    { label: "経費(確定)", value: formatJpy(summary.expenseJpy) },
    { label: "収支", value: formatJpy(summary.balanceJpy) },
    { label: "未確定", value: `${summary.pendingCount}件` },
  ];
  return (
    <>
      <section aria-label="経理サマリー">
        <h3 style={{ marginTop: 0 }}>月次サマリー(Mock)</h3>
        <p style={{ color: "var(--warn)", fontSize: "0.9rem" }}>
          β版はMock値の表示のみです(実会計データ・会計ソフト連携は行いません)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "10rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="仕訳一覧">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>仕訳・経費一覧(Mock)</h3>
          <button type="button" onClick={() => void handleExport()}>
            Excel出力(.xlsx)
          </button>
          {exportNote && (
            <span style={{ color: "var(--ok)", fontSize: "0.85rem" }}>{exportNote}</span>
          )}
        </div>
        <table style={{ borderCollapse: "collapse", marginTop: "0.6rem" }}>
          <thead>
            <tr>
              {["日付", "項目", "区分", "金額", "状態"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEDGER_ENTRIES.map((e) => (
              <tr key={`${e.date}-${e.item}`}>
                <td style={cellStyle}>{e.date}</td>
                <td style={cellStyle}>{e.item}</td>
                <td style={cellStyle}>{e.category}</td>
                <td style={{ ...cellStyle, textAlign: "right" }}>{formatJpy(e.amountJpy)}</td>
                <td style={cellStyle}>{e.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>経理部AI社員(Mock)</h4>
        <ul>
          {ACCOUNTING_STAFF.map((n) => (
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
};
