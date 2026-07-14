import { useRef, useState } from "react";
import {
  AgentRuntime,
  detectBrain,
  runForecastDeep,
  type AgentRunState,
  type DeepForecastResult,
  type ForecastProposal,
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
import { buildAccuracyDigest, trackForecastOutcome } from "../../lib/forecastTracking";
import { saveAgentDocToVault } from "../../lib/vaultStorage";

// 市場調査部: 未来予測(シナリオ分岐)。
// 市場実データ(RSS)+社内RAGを入力に、AIの発展を半年〜1年先まで複数分岐で予測。
// 倫理フィルタで不適切な分岐を除外し、実現性の最も高いシナリオを選出。
// 選出シナリオから「現在取り組める内容」を提案し、人間の承認後にエージェントが構築・実行する。

export function ForecastSection() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<DeepForecastResult | null>(null);
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
      // AGI深層予測: 過去の予測履歴+的中率実績を渡して較正(学習ノート生成)
      const history = localStorage.getItem("musasabi.forecastHistory") ?? "";
      const accuracy = buildAccuracyDigest();
      const pastDigest = [history, accuracy].filter((s) => s.trim() !== "").join("\n");
      const forecast = await runForecastDeep(brain.provider, inputs, pastDigest);
      setResult(forecast);
      // 履歴を保存(次回の較正に使う・直近3件)+的中率トラッキングへ pending 登録
      if (forecast.selectedLeaf) {
        const entry = `${new Date().toLocaleDateString("ja-JP")} 選出: ${forecast.selectedLeaf.main.title} → ${forecast.selectedLeaf.sub.title}(較正後実現性${forecast.selectedLeaf.sub.calibratedPlausibility}%)`;
        const prev = history.split("\n").filter((l) => l.trim() !== "").slice(0, 2);
        localStorage.setItem("musasabi.forecastHistory", [entry, ...prev].join("\n"));
        trackForecastOutcome(
          `${forecast.selectedLeaf.main.title} → ${forecast.selectedLeaf.sub.title}: ${forecast.selectedLeaf.sub.at6Months}`,
          forecast.selectedLeaf.sub.calibratedPlausibility,
        );
      }
      // 予測レポート全文(ツリー込みMD)を保管庫へ自動保存 — RAG索引され
      // チャット「保管庫で予測を探して」で後から引ける
      saveAgentDocToVault({
        title: `未来予測レポート: ${forecast.selectedLeaf ? forecast.selectedLeaf.sub.title.slice(0, 40) : new Date().toLocaleDateString("ja-JP")}`,
        text: buildForecastMarkdown(forecast),
        tags: ["agent", "forecast-report"],
      });
      recordMemory({
        category: "company",
        actor: "市場調査部",
        action: "未来予測を実行(半年〜1年・シナリオ分岐)",
        detail: forecast.selectedLeaf
          ? `選出: ${forecast.selectedLeaf.main.title} → ${forecast.selectedLeaf.sub.title}(較正後${forecast.selectedLeaf.sub.calibratedPlausibility}%)${forecast.learningNote ? " / 学習: " + forecast.learningNote.slice(0, 80) : ""}`
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
        // 成果物(最終報告)を保管庫へ自動保存(RAG索引対象)
        if (state.finalReport && state.finalReport.trim() !== "") {
          saveAgentDocToVault({
            title: `実行報告: ${proposal.title}`,
            text: `目標: ${proposal.title}\n${proposal.detail}\n\n${state.finalReport}`,
            tags: ["agent", "forecast-build"],
          });
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

  function buildForecastMarkdown(r: DeepForecastResult): string {
    return [
      `# 未来予測レポート(半年〜1年・シナリオ分岐)`,
      `生成: ${new Date(r.generatedAtMs).toLocaleString("ja-JP")} / 頭脳: ${r.brainName}`,
      "",
      "## 入力(市場データ)",
      r.inputsDigest,
      "",
      ...(r.learningNote ? ["## 🧠 前回予測からの学習", r.learningNote, ""] : []),
      ...r.scenarios.flatMap((s) => [
        `## ${s.ethical ? "" : "【倫理フィルタで除外】"}${s.title}(実現性 ${s.plausibility}%)`,
        `- 半年後: ${s.at6Months}`,
        `- 1年後: ${s.at12Months}`,
        ...(s.ethicsNote ? [`- 除外理由: ${s.ethicsNote}`] : []),
        ...(r.subBranches[s.id] ?? []).flatMap((sub) => [
          `### └ ${sub.ethical ? "" : "【倫理除外】"}${sub.title}(較正後 ${sub.calibratedPlausibility}% / 生成時 ${sub.plausibility}%)`,
          `- 半年後: ${sub.at6Months}`,
          `- 1年後: ${sub.at12Months}`,
          ...(sub.critiqueNote ? [`- 批評AI: ${sub.critiqueNote}`] : []),
          ...(sub.ethicsNote ? [`- 除外理由: ${sub.ethicsNote}`] : []),
        ]),
        "",
      ]),
      r.selectedLeaf
        ? `## ✅ 選出シナリオ: ${r.selectedLeaf.main.title} → ${r.selectedLeaf.sub.title}`
        : "## 選出なし(全分岐が倫理フィルタで除外)",
      "",
      "## 現在取り組める内容(提案)",
      ...r.proposals.map((p, i) => `${i + 1}. ${p.title} — ${p.detail}`),
    ].join("\n");
  }

  function saveForecastFile(): void {
    if (!result) return;
    void saveBinaryFile(
      `ai-forecast-${new Date().toISOString().slice(0, 10)}.md`,
      new TextEncoder().encode(buildForecastMarkdown(result)),
      "Markdown",
      ["md"],
    );
  }

  return (
    <section aria-label="未来予測">
      <h3>未来予測(半年〜1年・シナリオ分岐)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "52rem" }}>
        市場実データ(RSS)と社内調査記録から、AIの発展を<strong>複数に枝分かれしたシナリオ</strong>として予測します。
        各分岐は<strong>サブ分岐へ展開(2階層)</strong>し、批評AIの自己批評で実現性を較正、前回予測からの学習で精度を高めます。倫理に反する分岐は<strong>倫理フィルタで除外</strong>し、残りから較正後の実現性が最も高い葉を選出。
        そこから「現在取り組める内容」を提案し、<strong>承認ボタンを押した場合のみ</strong>エージェントが構築・実行します。
      </p>
      <button type="button" onClick={() => void handleForecast()} disabled={busy}>
        {busy ? "AGI深層予測中…(主分岐→サブ分岐→自己批評→較正)" : "🔮 AGI深層予測(半年〜1年・2階層)"}
      </button>
      {note && <p style={{ color: "#EF4444", fontSize: "0.8rem", marginTop: "0.4rem" }}>{note}</p>}

      {result && (
        <div style={{ marginTop: "0.6rem" }}>
          {result.learningNote && (
            <div className="card" style={{ marginBottom: "0.4rem", fontSize: "0.78rem" }}>
              🧠 <strong>前回予測からの学習(較正)</strong>: {result.learningNote}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {result.scenarios.map((s) => {
              const subs = result.subBranches[s.id] ?? [];
              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.8rem",
                    borderColor: !s.ethical ? "#EF4444" : undefined,
                    opacity: s.ethical ? 1 : 0.65,
                  }}
                >
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {!s.ethical && <span className="badge" style={{ fontSize: "0.64rem", background: "#EF444422" }}>🚫 倫理フィルタで除外</span>}
                    <strong>{s.title}</strong>
                    <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-muted)" }}>実現性 {s.plausibility}%</span>
                  </div>
                  <div style={{ marginTop: "0.2rem" }}>半年後: {s.at6Months}</div>
                  {s.at12Months && <div>1年後: {s.at12Months}</div>}
                  {s.ethicsNote && <div style={{ color: "#EF4444", fontSize: "0.74rem" }}>除外理由: {s.ethicsNote}</div>}
                  {subs.map((sub) => {
                    const isLeafSelected = result.selectedLeaf?.sub.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        className="card"
                        style={{
                          marginTop: "0.35rem",
                          marginLeft: "1.2rem",
                          padding: "0.4rem 0.6rem",
                          fontSize: "0.76rem",
                          borderColor: isLeafSelected ? "#22C55E" : !sub.ethical ? "#EF4444" : undefined,
                          opacity: sub.ethical ? 1 : 0.65,
                        }}
                      >
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                          <span aria-hidden>└</span>
                          {isLeafSelected && <span className="badge" style={{ fontSize: "0.62rem", background: "#22C55E22" }}>✅ 選出(最も現実性が高い)</span>}
                          {!sub.ethical && <span className="badge" style={{ fontSize: "0.62rem", background: "#EF444422" }}>🚫 倫理除外</span>}
                          <strong>{sub.title}</strong>
                          <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            較正後 {sub.calibratedPlausibility}%(生成時 {sub.plausibility}%)
                          </span>
                        </div>
                        <div>半年後: {sub.at6Months}</div>
                        {sub.at12Months && <div>1年後: {sub.at12Months}</div>}
                        {sub.critiqueNote && (
                          <div style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>批評AI: {sub.critiqueNote}</div>
                        )}
                        {sub.ethicsNote && <div style={{ color: "#EF4444", fontSize: "0.7rem" }}>除外理由: {sub.ethicsNote}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {result.proposals.length > 0 && (
            <div className="card" style={{ marginTop: "0.5rem" }}>
              <strong>💡 現在取り組める内容(選出シナリオへの備え)</strong>
              {result.constitutionNotes.length > 0 && (
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                  🏛 Musasabi憲章チェック: {result.constitutionNotes.join(" / ")}
                </div>
              )}
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
