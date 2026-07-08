import { useMemo, useState } from "react";
import {
  COMMAND_DEPARTMENTS,
  buildCompanyReport,
  renderReportMarkdown,
  withLiveSalesData,
} from "@musasabi/ai-company";
import { callLogStats } from "@musasabi/call-training";
import { countByStatus } from "@musasabi/sales-list";
import { loadCallLog } from "../../lib/callLogStorage";
import { loadLeads } from "../../lib/salesListStorage";
import { loadMemoryRecords } from "../../lib/memoryStorage";
import { saveBinaryFile } from "../../lib/saveFile";

// D-017 Reporting & Analytics: 全社レポートを生成し、Markdown プレビューと
// Markdown/JSON エクスポートを提供する。すべてローカル(外部送信なし)。

export function ReportsPage() {
  const [note, setNote] = useState<string | null>(null);

  const { report, markdown } = useMemo(() => {
    const stats = callLogStats(loadCallLog());
    const leadCounts = countByStatus(loadLeads());
    const recentLogs = loadMemoryRecords()
      .filter((r) => r.category === "work")
      .slice(0, 5)
      .map((r) => r.action);
    const departments = withLiveSalesData(COMMAND_DEPARTMENTS, {
      callCount: stats.sessionCount,
      appointmentCount: leadCounts.appointment,
      wonCount: leadCounts.won,
      notCalledCount: leadCounts.not_called,
      recentLogs,
    });
    const rep = buildCompanyReport(departments);
    return { report: rep, markdown: renderReportMarkdown(rep) };
  }, []);

  async function exportMarkdown(): Promise<void> {
    const bytes = new TextEncoder().encode(markdown);
    const stamp = new Date().toISOString().slice(0, 10);
    const result = await saveBinaryFile(
      `musasabi-report-${stamp}.md`,
      bytes,
      "Markdown",
      ["md"],
    );
    setNote(result === "cancelled" ? "書き出しをキャンセルしました。" : "Markdownで書き出しました。");
  }

  async function exportJson(): Promise<void> {
    const bytes = new TextEncoder().encode(JSON.stringify(report, null, 2));
    const stamp = new Date().toISOString().slice(0, 10);
    const result = await saveBinaryFile(
      `musasabi-report-${stamp}.json`,
      bytes,
      "JSON",
      ["json"],
    );
    setNote(result === "cancelled" ? "書き出しをキャンセルしました。" : "JSONで書き出しました。");
  }

  return (
    <>
      <section aria-label="レポート概要">
        <h3 style={{ marginTop: 0 }}>全社レポート(Reporting & Analytics)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          運営サマリー・部署別KPI・ワークフロー・コラボレーションを1つのレポートに集約します。
          営業部はテストコール履歴・営業リストの実データを反映します(その他はMock・外部送信なし)。
        </p>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" onClick={() => void exportMarkdown()}>
            Markdownでエクスポート(.md)
          </button>
          <button type="button" onClick={() => void exportJson()}>
            JSONでエクスポート(.json)
          </button>
          {note && <span style={{ color: "var(--ok)", fontSize: "0.85rem" }}>{note}</span>}
        </div>
      </section>

      <section aria-label="レポートプレビュー">
        <h3 style={{ marginTop: 0 }}>プレビュー</h3>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "rgba(255,255,255,0.7)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "0.9rem 1rem",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            maxWidth: "52rem",
            overflowX: "auto",
          }}
        >
          {markdown}
        </pre>
      </section>
    </>
  );
}
