import { useRef, useState } from "react";
import {
  AgentRuntime,
  detectBrain,
  runForecast,
  type AgentRunState,
  type ForecastProposal,
  type ForecastResult,
} from "@musasabi/agent-runtime";
import { fetchAllHeadlines } from "../../lib/rssFeeds";
import { searchBrain } from "../../lib/brainRag";
import { loadLlmSettings } from "../../lib/llmSettings";
import { resolveLlmFetch } from "../../lib/llmFetch";
import { buildAgentTools } from "../../lib/agentTools";
import { buildReportProvider } from "../../lib/brainProviders";
import { recordMemory } from "../../lib/memoryStorage";
import { saveBinaryFile } from "../../lib/saveFile";
import { sendAgentNotification } from "../../lib/freeConnectors";
import { notifyOs } from "../../lib/osNotify";

// 市場調査部: 未来予測(シナリオ分岐)。
// 市場実データ(RSS)+社内RAGを入力に、AIの発展を半年〜1年先まで複数分岐で予測。
// 倫理フィルタで不適切な分岐を除外し、実現性の最も高いシナリオを選出。
// 選出シナリオから「現在取り組める内容」を提案し、人間の承認後にエージェントが構築・実行する。

export function ForecastSection() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [execRun, setExecRun] = useState<AgentRunState | null>(null);
  const [execBusy, setExecBusy] = useState(false);
  const runtimeRef = useRef<AgentRuntime | null>(null);

  async function gatherInputs(): Promise<string> {
    const parts: string[] = [];
    const headlines = await fetchAllHeadlines(5).catch(() => []);
    if (headlines.length > 0) {
      parts.push("外部実データ(RSS見出し):\n" + headlines.slice(0, 8).map((h) => `・${h.title}(${h.feedLabel})`).join("\n"));
    }
    const { hits } = await searchBrain("AI 市場 動向 発展", 5).catch(() => ({ hits: [] as never[] }));
    if (hits.length > 0) {
      parts.push("社内調査記録:\n" + hits.map((h) => `・${h.doc.text}`).join("\n"));
    }
    return parts.length > 0 ? parts.join("\n") : "追加の市場データなし(一般的なAI業界動向に基づく予測)";
  }

  async function handleForecast(): Promise<void> {
    if (busy) return;
    setBusy(true);
    setNote(null);
    setResult(null);
    setExecRun(null);
    try {
      const brain = await detectBrain(loadLlmSettings(), await resolveLlmFetch());
      const inputs = await gatherInputs();
      const forecast = await runForecast(brain.provider, inputs, 3);
      setResult(forecast);
      recordMemory({
        category: "company",
        actor: "市場調査部",
        action: "未来予測を実行(半年〜1年・シナリオ分岐)",
        detail: forecast.selected
          ? `選出: ${forecast.selected.title}(実現性${forecast.selected.plausibility}%)`
          : "倫理フィルタにより全分岐が除外",
        tags: ["forecast"],
      });
    } catch (e) {
      setNote(`予測に失敗しました: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  /** 提案を承認 → エージェントが構築・実行する。 */
  async function approveAndBuild(proposal: ForecastProposal): Promise<void> {
    if (execBusy) return;
    setExecBusy(true);
    setExecRun(null);
    try {
      const brain = await detectBrain(loadLlmSettings(), await resolveLlmFetch());
      const rt = new AgentRuntime({
        provider: brain.provider,
        reportProvider: await buildReportProvider(brain),
        tools: buildAgentTools(),
      });
      runtimeRef.current = rt;
      let state = await rt.start({
        id: `forecast-${Date.now()}`,
        title: proposal.title,
        description: `${proposal.title}: ${proposal.detail}(未来予測から人間が承認した取り組み)`,
      });
      state = await rt.runUntilPause(state);
      // この実行はユーザーの「承認して構築・実行」クリックが承認にあたる
      while (state.status === "waiting_approval") {
        state.auditLog.push({ atMs: Date.now(), event: "pre_approved", detail: "未来予測の提案をユーザーが承認済み(ボタン承認)" });
        state = await rt.runUntilPause(rt.approve(state));
      }
      setExecRun({ ...state, steps: [...state.steps] });
      if (state.status === "completed") {
        for (const w of state.brainWrites) {
          recordMemory({ category: "work", actor: "forecast-agent", action: w.action, detail: w.detail, tags: ["forecast-build"] });
        }
        void sendAgentNotification(`未来予測の取り組み完了: ${proposal.title}`, state.finalReport ?? "").catch(() => undefined);
        void notifyOs("Musasabi — 予測対応の構築完了", proposal.title).catch(() => undefined);
      }
    } catch (e) {
      setNote(`実行に失敗しました: ${String(e)}`);
    } finally {
      setExecBusy(false);
    }
  }

  function saveForecastFile(): void {
    if (!result) return;
    const md = [
      `# 未来予測レポート(半年〜1年・シナリオ分岐)`,
      `生成: ${new Date(result.generatedAtMs).toLocaleString("ja-JP")} / 頭脳: ${result.brainName}`,
      "",
      "## 入力(市場データ)",
      result.inputsDigest,
      "",
      ...result.scenarios.flatMap((s) => [
        `## ${s.ethical ? "" : "【倫理フィルタで除外】"}${s.title}(実現性 ${s.plausibility}%)`,
        `- 半年後: ${s.at6Months}`,
        `- 1年後: ${s.at12Months}`,
        ...(s.ethicsNote ? [`- 除外理由: ${s.ethicsNote}`] : []),
        "",
      ]),
      result.selected ? `## ✅ 選出シナリオ: ${result.selected.title}` : "## 選出なし(全分岐が倫理フィルタで除外)",
      "",
      "## 現在取り組める内容(提案)",
      ...result.proposals.map((p, i) => `${i + 1}. ${p.title} — ${p.detail}`),
    ].join("\n");
    void saveBinaryFile(
      `ai-forecast-${new Date().toISOString().slice(0, 10)}.md`,
      new TextEncoder().encode(md),
      "Markdown",
      ["md"],
    );
  }

  return (
    <section aria-label="未来予測">
      <h3>未来予測(半年〜1年・シナリオ分岐)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "52rem" }}>
        市場実データ(RSS)と社内調査記録から、AIの発展を<strong>複数に枝分かれしたシナリオ</strong>として予測します。
        倫理に反する分岐は<strong>倫理フィルタで除外</strong>し、残りから実現性の最も高いシナリオを選出。
        そこから「現在取り組める内容」を提案し、<strong>承認ボタンを押した場合のみ</strong>エージェントが構築・実行します。
      </p>
      <button type="button" onClick={() => void handleForecast()} disabled={busy}>
        {busy ? "予測中…(3分岐+提案を生成)" : "🔮 半年〜1年先を予測"}
      </button>
      {note && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: "0.4rem" }}>{note}</p>}

      {result && (
        <div style={{ marginTop: "0.6rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {result.scenarios.map((s) => {
              const isSelected = result.selected?.id === s.id;
              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.8rem",
                    borderColor: isSelected ? "#22C55E" : !s.ethical ? "#EF4444" : undefined,
                    opacity: s.ethical ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {isSelected && <span className="badge" style={{ fontSize: "0.64rem", background: "#22C55E22" }}>✅ 選出(最も現実性が高い)</span>}
                    {!s.ethical && <span className="badge" style={{ fontSize: "0.64rem", background: "#EF444422" }}>🚫 倫理フィルタで除外</span>}
                    <strong>{s.title}</strong>
                    <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-muted)" }}>実現性 {s.plausibility}%</span>
                  </div>
                  <div style={{ marginTop: "0.2rem" }}>半年後: {s.at6Months}</div>
                  {s.at12Months && <div>1年後: {s.at12Months}</div>}
                  {s.ethicsNote && <div style={{ color: "#EF4444", fontSize: "0.74rem" }}>除外理由: {s.ethicsNote}</div>}
                </div>
              );
            })}
          </div>

          {result.proposals.length > 0 && (
            <div className="card" style={{ marginTop: "0.5rem" }}>
              <strong>💡 現在取り組める内容(選出シナリオへの備え)</strong>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.35rem" }}>
                {result.proposals.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.82rem", flexWrap: "wrap" }}>
                    <span><strong>{p.title}</strong> — {p.detail}</span>
                    <button
                      type="button"
                      style={{ marginLeft: "auto" }}
                      onClick={() => void approveAndBuild(p)}
                      disabled={execBusy}
                    >
                      {execBusy ? "実行中…" : "✔ 承認して構築・実行"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button type="button" style={{ marginTop: "0.4rem" }} onClick={saveForecastFile}>
            📄 予測レポートをファイル保存
          </button>
        </div>
      )}

      {execRun && (
        <div className="card" style={{ marginTop: "0.5rem", borderColor: execRun.status === "completed" ? "#22C55E" : undefined }}>
          <strong>{execRun.status === "completed" ? "✅ 構築・実行完了" : `⛔ 停止(${execRun.status})`}(頭脳: {execRun.brainName})</strong>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.78rem", margin: "0.3rem 0 0" }}>{execRun.finalReport ?? ""}</pre>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Company Brain へ {execRun.brainWrites.length} 件保存・監査ログ {execRun.auditLog.length} 件(ボタン承認は監査に記録済み)
          </div>
        </div>
      )}
    </section>
  );
}
