// LLM プロバイダ抽象化(エージェントの「頭脳」差し込み口)。
// 無料ローカルLLM(Ollama 互換API: http://localhost:11434)を第一候補として検出し、
// 未検出時は決定論ルールベース頭脳へフォールバックする。
// ローカル推論のみ: APIキー不要・課金なし・データの外部送信なし。

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmProvider {
  /** 表示名(UI用)。 */
  name: string;
  kind: "ollama" | "rule_based";
  chat(messages: readonly LlmMessage[]): Promise<string>;
}

export interface LlmSettings {
  /** Ollama 互換エンドポイント(既定: http://127.0.0.1:11434)。 */
  baseUrl: string;
  /** 使用モデル名(既定: qwen2.5:0.5b — 無料・軽量)。 */
  model: string;
}

export const DEFAULT_LLM_SETTINGS: LlmSettings = {
  baseUrl: "http://127.0.0.1:11434",
  model: "qwen2.5:0.5b",
};

type FetchLike = (url: string, init?: {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

// 既定 fetch はアロー関数で包む(ブラウザの window.fetch は this 束縛が必要なため、
// 未束縛のまま呼ぶと "Illegal invocation" になる)。
const defaultFetch: FetchLike = (url, init) =>
  (fetch as unknown as FetchLike)(url, init);

/** Ollama 互換API(/api/tags・/api/chat)プロバイダ。 */
export class OllamaProvider implements LlmProvider {
  readonly kind = "ollama" as const;
  readonly name: string;

  constructor(
    private readonly settings: LlmSettings = DEFAULT_LLM_SETTINGS,
    private readonly fetchImpl: FetchLike = defaultFetch,
    private readonly timeoutMs = 30000,
  ) {
    this.name = `ローカルLLM(Ollama: ${settings.model})`;
  }

  /** サーバ疎通+モデル一覧を確認する(短いタイムアウト)。失敗理由を返す。 */
  async probe(probeTimeoutMs = 3000): Promise<{ ok: boolean; error?: string }> {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), probeTimeoutMs);
      const res = await this.fetchImpl(`${this.settings.baseUrl}/api/tags`, { signal: ctl.signal });
      clearTimeout(timer);
      return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status}` };
    } catch (e) {
      const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      return { ok: false, error: msg.includes("Abort") ? `接続タイムアウト(${probeTimeoutMs}ms)` : msg };
    }
  }

  async isAvailable(probeTimeoutMs = 3000): Promise<boolean> {
    return (await this.probe(probeTimeoutMs)).ok;
  }

  async chat(messages: readonly LlmMessage[]): Promise<string> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), this.timeoutMs);
    try {
      const res = await this.fetchImpl(`${this.settings.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ model: this.settings.model, messages, stream: false }),
        signal: ctl.signal,
      });
      if (!res.ok) throw new Error(`ollama http ${res.status}`);
      const data = (await res.json()) as { message?: { content?: string } };
      const content = data.message?.content ?? "";
      if (content.trim() === "") throw new Error("ollama empty response");
      return content;
    } finally {
      clearTimeout(timer);
    }
  }
}

/**
 * 決定論ルールベース頭脳(フォールバック)。LLM未検出でも同じエージェントループが
 * 動作するよう、プロンプト中のマーカーに応じて定型の思考結果を返す。
 */
export class RuleBasedProvider implements LlmProvider {
  readonly kind = "rule_based" as const;
  readonly name = "ルールベース頭脳(フォールバック・決定論)";

  async chat(messages: readonly LlmMessage[]): Promise<string> {
    const last = messages[messages.length - 1]?.content ?? "";
    if (last.includes("[PLAN]")) {
      return "1. 現状を確認する\n2. 必要な作業を実行する\n3. 結果を確認して報告する";
    }
    if (last.includes("[OBSERVE]")) {
      return "出力は目的に沿っています。次のステップへ進みます。";
    }
    if (last.includes("[REPORT]")) {
      return "目標に対する全ステップが完了しました。成果物と根拠は各ステップの出力を参照してください。";
    }
    if (last.includes("[DISCUSS]")) {
      return "この議題は進める価値があると考えます。担当領域の観点では大きな支障はありません(ルールベース発言)。";
    }
    if (last.includes("[CONCLUDE]")) {
      return "結論: 各部の意見に大きな対立はなく、提案どおり進めます。次のアクションは担当部署の実行計画作成です。";
    }
    if (last.includes("[FORECAST]")) {
      if (last.includes("楽観分岐")) {
        return "タイトル: エージェント型AIの業務標準化が加速\n半年後: 主要ベンダーのエージェント基盤が出揃い、中小企業でも導入が始まる。\n1年後: 定型業務の相当部分がエージェント経由になり、運用ガバナンスが競争力になる。\n確率: 55%";
      }
      if (last.includes("抑制分岐")) {
        return "タイトル: 規制・信頼性重視で導入が慎重化\n半年後: 精度・責任問題への懸念から、承認フローと監査を伴う限定導入が中心になる。\n1年後: 監査可能性と人間承認を備えた製品だけが企業導入で残る。\n確率: 40%";
      }
      return "タイトル: ローカルLLMと小型モデルの実用化が主流に\n半年後: 小型高性能モデルの普及で、端末内AIの業務利用が一般化し始める。\n1年後: コストとプライバシーの利点から、ローカル+クラウドの併用が標準構成になる。\n確率: 65%";
    }
    if (last.includes("[PROPOSE]")) {
      return "提案1: 社内データのRAG整備 — 予測されるエージェント標準化に備え、社内知識の索引と検索品質を今のうちに高める。\n提案2: 運用ガバナンス文書の整備 — 承認フロー・監査ログの運用ルールを文書化し、導入拡大時の信頼性要件に先回りする。";
    }
    // 汎用応答(チャット用)
    const text = last.replace(/\s+/g, " ").slice(0, 60);
    return `「${text}」について承知しました。サイドバーの各グループから該当機能へ移動できます(ルールベース応答)。`;
  }
}

export interface DetectedBrain {
  provider: LlmProvider;
  source: "ollama" | "fallback";
  /** フォールバック時の検出失敗理由(診断表示用)。 */
  probeError?: string;
}

/** 頭脳を検出する: Ollama が生きていればLLM、いなければルールベース。 */
export async function detectBrain(
  settings: LlmSettings = DEFAULT_LLM_SETTINGS,
  fetchImpl?: FetchLike,
): Promise<DetectedBrain> {
  const ollama = new OllamaProvider(settings, fetchImpl);
  const probe = await ollama.probe();
  if (probe.ok) {
    return { provider: ollama, source: "ollama" };
  }
  return { provider: new RuleBasedProvider(), source: "fallback", probeError: probe.error };
}
