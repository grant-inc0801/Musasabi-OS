// Musasabi Agent Runtime — 本物のエージェント実行ループ。
// 認識(sense)→計画(plan)→行動(act)→観察(observe)→報告(report)を、
// ポリシー検証(Intelligence Layer)・承認ゲート・監査ログ・Company Brain 書き込みを
// 通しながら自律実行する。頭脳は LlmProvider(ローカルLLM or ルールベース)を差し込む。
//
// 安全設計: ツールはすべてローカル・決定論(外部送信なし)。行動前に validateDecision で
// ポリシー検証し、実外部変更・課金を伴う行動は遮断。承認ノードでは人間承認まで停止。
// 最大ステップ数ガード付き。

import { validateDecision, WORKFLOW_TEMPLATES, type WorkflowTemplate } from "@musasabi/intelligence-layer";
import type { LlmMessage, LlmProvider } from "./llm";

export * from "./llm";
export { WORKFLOW_TEMPLATES };

// ─────────────────────────── 型 ───────────────────────────

export interface AgentGoal {
  id: string;
  title: string;
  /** 目標の説明(計画プロンプトに使用)。 */
  description: string;
  /** ワークフローテンプレートに沿って実行する場合は指定。 */
  workflowTemplateId?: string;
}

export type AgentStepKind = "plan" | "act" | "approval" | "observe" | "report";
export type AgentStepStatus = "done" | "waiting_approval" | "blocked";

export interface AgentStep {
  index: number;
  kind: AgentStepKind;
  /** 実行主体(部署/AI社員のラベル。テンプレートのノード名など)。 */
  actor: string;
  /** ツール名(actのとき)。 */
  tool?: string;
  input: string;
  output: string;
  status: AgentStepStatus;
  atMs: number;
}

export type AgentRunStatus = "running" | "waiting_approval" | "completed" | "blocked";

export interface BrainWrite {
  category: "work" | "decision";
  action: string;
  detail: string;
}

export interface AuditEntry {
  atMs: number;
  event: string;
  detail: string;
}

export interface AgentRunState {
  id: string;
  goal: AgentGoal;
  status: AgentRunStatus;
  brainName: string;
  steps: AgentStep[];
  /** 実行完了時の最終報告(説明可能性: 根拠・使用ツール・次アクション込み)。 */
  finalReport: string | null;
  brainWrites: BrainWrite[];
  auditLog: AuditEntry[];
}

/** エージェントが使えるローカルツール(すべて決定論・外部送信なし)。 */
export interface AgentTool {
  name: string;
  labelJa: string;
  /** 実外部変更を伴うか(本ランタイムのツールは常に false)。 */
  external: boolean;
  run(input: string): Promise<string> | string;
}

// ─────────────────────── 既定ツール ───────────────────────

/** 既定ツール群(Mock・ローカル)。UI側で write_brain の結果を localStorage へ永続化する。 */
export function defaultTools(): AgentTool[] {
  return [
    {
      name: "summarize", labelJa: "要約", external: false,
      run: (input) => `要約: ${input.replace(/\s+/g, " ").slice(0, 80)}${input.length > 80 ? "…" : ""}`,
    },
    {
      name: "research_snapshot", labelJa: "市場スナップショット", external: false,
      run: () => "市場スナップショット(Mock): 対象セグメントの需要は中〜高。競合3社・機会スコア64〜72。",
    },
    {
      name: "draft_content", labelJa: "ドラフト作成", external: false,
      run: (input) => `ドラフト(Mock): ${input} — 要点→ベネフィット→CTAの3段構成で作成しました。`,
    },
    {
      name: "build_report", labelJa: "レポート生成", external: false,
      run: (input) => `# 実行レポート(Mock)\n- 対象: ${input}\n- 結果: 完了\n- 次アクション: 承認後に反映`,
    },
    {
      name: "notify_secretary", labelJa: "AI秘書へ通知", external: false,
      run: (input) => `AI秘書へ通知しました(Mock): ${input}`,
    },
  ];
}

// ─────────────────────── ランタイム ───────────────────────

export interface AgentRuntimeOptions {
  provider: LlmProvider;
  tools?: AgentTool[];
  maxSteps?: number;
  now?: () => number;
}

const SYSTEM_PROMPT =
  "あなたは Musasabi OS のAI社員エージェントです。会社憲章(実外部変更・課金は人間承認まで禁止・" +
  "監査ログ保持)に従い、与えられた目標を段階的に実行します。回答は簡潔な日本語で。";

export class AgentRuntime {
  private readonly provider: LlmProvider;
  private readonly tools: Map<string, AgentTool>;
  private readonly maxSteps: number;
  private readonly now: () => number;

  constructor(opts: AgentRuntimeOptions) {
    this.provider = opts.provider;
    this.tools = new Map((opts.tools ?? defaultTools()).map((t) => [t.name, t]));
    this.maxSteps = opts.maxSteps ?? 16;
    this.now = opts.now ?? (() => Date.now());
  }

  /** 目標から実行キュー(計画)を作り、初期状態を返す。 */
  async start(goal: AgentGoal): Promise<AgentRunState> {
    const state: AgentRunState = {
      id: `run-${goal.id}-${this.now()}`,
      goal,
      status: "running",
      brainName: this.provider.name,
      steps: [],
      finalReport: null,
      brainWrites: [],
      auditLog: [{ atMs: this.now(), event: "run_started", detail: goal.title }],
    };

    // 計画: テンプレート指定があればノード列を計画に使い、なければ頭脳に計画させる。
    const template = goal.workflowTemplateId
      ? WORKFLOW_TEMPLATES.find((t) => t.id === goal.workflowTemplateId)
      : undefined;
    const planText = template
      ? template.nodes.map((n, i) => `${i + 1}. ${n.label}`).join("\n")
      : await this.provider.chat([
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `[PLAN] 次の目標を3〜5ステップの実行計画にしてください: ${goal.description}` },
        ]);

    state.steps.push({
      index: 0, kind: "plan", actor: "エージェント(計画)",
      input: goal.description, output: planText, status: "done", atMs: this.now(),
    });
    state.auditLog.push({ atMs: this.now(), event: "planned", detail: planText.slice(0, 120) });

    // 実行キューをテンプレート/既定シーケンスから構築して内部保持。
    this.queues.set(state.id, this.buildQueue(goal, template));
    return state;
  }

  private queues = new Map<string, Array<{ kind: AgentStepKind; actor: string; tool?: string; input: string }>>();

  private buildQueue(
    goal: AgentGoal,
    template: WorkflowTemplate | undefined,
  ): Array<{ kind: AgentStepKind; actor: string; tool?: string; input: string }> {
    if (template) {
      const q: Array<{ kind: AgentStepKind; actor: string; tool?: string; input: string }> = [];
      for (const node of template.nodes) {
        if (node.type === "approval") {
          q.push({ kind: "approval", actor: node.label, input: goal.title });
        } else if (node.type === "audit_check") {
          q.push({ kind: "observe", actor: node.label, input: "監査観点で結果を確認" });
        } else if (node.type === "brain_write") {
          q.push({ kind: "act", actor: node.label, tool: "build_report", input: goal.title });
        } else if (node.type === "notification") {
          q.push({ kind: "act", actor: node.label, tool: "notify_secretary", input: goal.title });
        } else {
          // 部署/AI社員ノード → 内容系ツールを割り当て(決定論)
          const tool = node.label.includes("調査") ? "research_snapshot"
            : node.label.includes("マーケ") ? "draft_content"
            : "summarize";
          q.push({ kind: "act", actor: node.label, tool, input: `${goal.title}: ${node.label}` });
        }
      }
      q.push({ kind: "report", actor: "エージェント(報告)", input: goal.title });
      return q;
    }
    // テンプレート無し: 汎用 act→observe→report
    return [
      { kind: "act", actor: "エージェント", tool: "summarize", input: goal.description },
      { kind: "observe", actor: "エージェント", input: goal.description },
      { kind: "report", actor: "エージェント(報告)", input: goal.title },
    ];
  }

  /** 1ステップ進める。承認待ち/完了/遮断で停止状態を返す。 */
  async tick(state: AgentRunState): Promise<AgentRunState> {
    if (state.status !== "running") return state;
    if (state.steps.length >= this.maxSteps) {
      state.status = "blocked";
      state.auditLog.push({ atMs: this.now(), event: "max_steps", detail: `上限${this.maxSteps}ステップに到達` });
      return state;
    }
    const queue = this.queues.get(state.id) ?? [];
    const next = queue.shift();
    if (!next) {
      state.status = "completed";
      return state;
    }

    const index = state.steps.length;

    if (next.kind === "approval") {
      state.steps.push({
        index, kind: "approval", actor: next.actor,
        input: next.input, output: "人間の承認待ちで停止中(承認で再開)。",
        status: "waiting_approval", atMs: this.now(),
      });
      state.status = "waiting_approval";
      state.auditLog.push({ atMs: this.now(), event: "approval_requested", detail: next.actor });
      // 未消化のキューを戻す
      this.queues.set(state.id, queue);
      return state;
    }

    if (next.kind === "act") {
      const tool = next.tool ? this.tools.get(next.tool) : undefined;
      // 行動前ポリシー検証(Intelligence Layer)。ツールは全てローカルなので external/paid=false。
      const validation = validateDecision({
        id: `${state.id}-${index}`, title: next.input, department: next.actor,
        external: tool?.external ?? false, paid: false, impact: "low", risk: "low",
      });
      if (!validation.allowed) {
        state.steps.push({
          index, kind: "act", actor: next.actor, tool: next.tool,
          input: next.input, output: `ポリシー違反のため遮断: ${validation.note}`,
          status: "blocked", atMs: this.now(),
        });
        state.status = "blocked";
        state.auditLog.push({ atMs: this.now(), event: "policy_blocked", detail: next.input });
        return state;
      }
      const output = tool ? await tool.run(next.input) : "(ツール未定義のためスキップ)";
      state.steps.push({
        index, kind: "act", actor: next.actor, tool: next.tool,
        input: next.input, output, status: "done", atMs: this.now(),
      });
      state.auditLog.push({ atMs: this.now(), event: "acted", detail: `${next.actor}/${next.tool}` });
      if (next.tool === "build_report") {
        state.brainWrites.push({ category: "work", action: "エージェント成果物", detail: output.slice(0, 160) });
      }
      this.queues.set(state.id, queue);
      return state;
    }

    if (next.kind === "observe") {
      const lastOutput = state.steps[state.steps.length - 1]?.output ?? "";
      const output = await this.provider.chat([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `[OBSERVE] 直前の出力を評価してください: ${lastOutput.slice(0, 200)}` },
      ]);
      state.steps.push({
        index, kind: "observe", actor: next.actor,
        input: lastOutput.slice(0, 120), output, status: "done", atMs: this.now(),
      });
      this.queues.set(state.id, queue);
      return state;
    }

    // report
    const summary = await this.provider.chat([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `[REPORT] 目標「${state.goal.title}」の実行結果を1〜2文で総括してください。` },
    ]);
    const toolsUsed = [...new Set(state.steps.filter((s) => s.tool).map((s) => s.tool))].join("・") || "なし";
    const finalReport = [
      `目標: ${state.goal.title}`,
      `頭脳: ${state.brainName}`,
      `総括: ${summary}`,
      `使用ツール: ${toolsUsed}`,
      `ステップ数: ${state.steps.length + 1} / 承認: ${state.steps.some((s) => s.kind === "approval") ? "経由" : "なし"}`,
      "次アクション: 結果を確認し、必要なら再実行または本番反映(承認後)。",
    ].join("\n");
    state.steps.push({
      index, kind: "report", actor: next.actor,
      input: state.goal.title, output: finalReport, status: "done", atMs: this.now(),
    });
    state.finalReport = finalReport;
    state.brainWrites.push({ category: "decision", action: "エージェント実行完了", detail: `${state.goal.title}: ${summary.slice(0, 120)}` });
    state.status = "completed";
    state.auditLog.push({ atMs: this.now(), event: "run_completed", detail: state.goal.title });
    this.queues.delete(state.id);
    return state;
  }

  /** 承認して再開する。 */
  approve(state: AgentRunState): AgentRunState {
    if (state.status !== "waiting_approval") return state;
    const waiting = state.steps.find((s) => s.status === "waiting_approval");
    if (waiting) {
      waiting.status = "done";
      waiting.output = "人間が承認しました。実行を再開します。";
    }
    state.status = "running";
    state.auditLog.push({ atMs: this.now(), event: "approved", detail: waiting?.actor ?? "" });
    return state;
  }

  /** 完了/停止まで tick を回す(承認待ちでは停止して返す)。 */
  async runUntilPause(state: AgentRunState): Promise<AgentRunState> {
    let s = state;
    while (s.status === "running") {
      s = await this.tick(s);
    }
    return s;
  }
}

/** チャット用: 頭脳に1問1答させる(アシスタント/秘書チャットの実LLM化)。 */
export async function chatOnce(
  provider: LlmProvider,
  userText: string,
  appContext: string,
): Promise<string> {
  const messages: LlmMessage[] = [
    { role: "system", content: `${SYSTEM_PROMPT}\n以下はアプリの画面構成です。案内に使ってください:\n${appContext}` },
    { role: "user", content: userText },
  ];
  return provider.chat(messages);
}
