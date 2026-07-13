// 未来予測エンジン(本番実装・無課金・端末内処理)。
// 市場調査の実データ(RSS見出し+社内RAG)を入力に、AIの発展を半年〜1年先まで
// 「複数に枝分かれしたシナリオ」として生成し、
//   1) 倫理フィルタ(キーワード遮断+シナリオ自体の倫理評価)で不適切な分岐を排除
//   2) 残った分岐を実現性スコアで評価し、最も現実性の高いシナリオを選出
//   3) 選出シナリオから「現在取り組める内容」の提案を生成(実行は人間の承認後)
// 頭脳は LlmProvider(ローカルLLM or ルールベース)。予測は断定ではなく提案であり、
// 選出根拠・除外理由を必ず明示する(説明可能性)。

import type { LlmProvider } from "./llm";

export type ForecastHorizon = "6m" | "12m";

export interface ForecastScenario {
  id: string;
  title: string;
  /** 半年後の状態(このシナリオが進んだ場合)。 */
  at6Months: string;
  /** 1年後の状態。 */
  at12Months: string;
  /** 実現性スコア(0〜100)。 */
  plausibility: number;
  /** 倫理フィルタを通過したか。 */
  ethical: boolean;
  /** 除外理由(ethical=false のとき)。 */
  ethicsNote?: string;
}

export interface ForecastProposal {
  title: string;
  detail: string;
}

export interface ForecastResult {
  /** 入力に使った市場データの要約。 */
  inputsDigest: string;
  scenarios: ForecastScenario[];
  /** 選出されたシナリオ(倫理通過のうち実現性最大)。全滅時は null。 */
  selected: ForecastScenario | null;
  /** 選出シナリオから導いた「現在取り組める内容」の提案。 */
  proposals: ForecastProposal[];
  brainName: string;
  generatedAtMs: number;
}

/** 倫理フィルタ: 排除対象の兆候(会社憲章・Intelligence Layer の方針に基づく決定論スクリーン)。 */
const ETHICS_BLOCKLIST: ReadonlyArray<{ pattern: RegExp; reason: string }> = [
  { pattern: /悪用|詐欺|なりすまし|偽情報|フェイク/, reason: "欺瞞・悪用を前提とする内容" },
  { pattern: /世論操作|情報操作|洗脳/, reason: "人の意思決定の不当な操作" },
  { pattern: /監視社会|無断収集|プライバシー侵害/, reason: "プライバシー・人権の侵害" },
  { pattern: /兵器|軍事転用/, reason: "危害を目的とする利用" },
  { pattern: /差別|排除を助長/, reason: "差別の助長" },
  { pattern: /違法|脱法/, reason: "法令違反" },
];

/** シナリオ文面を倫理スクリーンにかける。問題があれば理由を返す。 */
export function screenEthics(text: string): string | null {
  for (const rule of ETHICS_BLOCKLIST) {
    if (rule.pattern.test(text)) return rule.reason;
  }
  return null;
}

/** 「確率: 65%」「実現性: 70」等の表記からスコアを取り出す(なければ 50)。 */
export function parsePlausibility(text: string): number {
  const m = text.match(/(?:確率|実現性|可能性)[::]?\s*(\d{1,3})\s*%?/);
  if (!m) return 50;
  return Math.max(0, Math.min(100, Number(m[1])));
}

const SCENARIO_SEEDS = [
  "楽観分岐(技術進展が加速した場合)",
  "主流分岐(現在のトレンドが順当に進んだ場合)",
  "抑制分岐(規制・コスト・信頼性問題で減速した場合)",
];

/**
 * 未来予測を実行する。branches 本の分岐シナリオを生成→倫理フィルタ→実現性で選出→提案生成。
 */
export async function runForecast(
  provider: LlmProvider,
  marketInputs: string,
  branches = 3,
): Promise<ForecastResult> {
  const inputsDigest = marketInputs.slice(0, 800);
  const scenarios: ForecastScenario[] = [];

  for (let i = 0; i < branches; i++) {
    const seed = SCENARIO_SEEDS[i % SCENARIO_SEEDS.length];
    const text = await provider.chat([
      {
        role: "system",
        content:
          "あなたは Musasabi OS の市場調査部の未来予測AIです。誇張せず、根拠に基づいて予測します。" +
          "倫理に反する発展(悪用・欺瞞・監視・差別など)は予測の選択肢として提案しません。",
      },
      {
        role: "user",
        content:
          `[FORECAST] 市場データ:\n${inputsDigest}\n\n` +
          `分岐: ${seed}\n` +
          "この分岐でのAI業界の発展を予測してください。必ず次の形式で:\n" +
          "タイトル: (1行)\n半年後: (2文以内)\n1年後: (2文以内)\n確率: NN%(この分岐が現実になる確率)",
      },
    ]);
    const titleMatch = text.match(/タイトル[::]\s*(.+)/);
    const m6 = text.match(/半年後[::]\s*([\s\S]*?)(?=\n1年後|$)/);
    const m12 = text.match(/1年後[::]\s*([\s\S]*?)(?=\n確率|$)/);
    const ethicsIssue = screenEthics(text);
    scenarios.push({
      id: `scenario-${i + 1}`,
      title: (titleMatch?.[1] ?? seed).trim().slice(0, 80),
      at6Months: (m6?.[1] ?? text).trim().slice(0, 300),
      at12Months: (m12?.[1] ?? "").trim().slice(0, 300),
      plausibility: parsePlausibility(text),
      ethical: ethicsIssue === null,
      ethicsNote: ethicsIssue ?? undefined,
    });
  }

  // 選出: 倫理を通過した分岐のうち実現性最大
  const ethicalScenarios = scenarios.filter((s) => s.ethical);
  const selected =
    ethicalScenarios.length === 0
      ? null
      : ethicalScenarios.reduce((a, b) => (b.plausibility > a.plausibility ? b : a));

  // 提案: 選出シナリオから「現在取り組める内容」を生成
  const proposals: ForecastProposal[] = [];
  if (selected) {
    const text = await provider.chat([
      {
        role: "system",
        content:
          "あなたは Musasabi OS の企画部AIです。実行は人間の承認後に行われます。" +
          "端末内で完結できる準備作業(調査・ドラフト・レポート・体制整備)を優先して提案してください。",
      },
      {
        role: "user",
        content:
          `[PROPOSE] 選出された未来シナリオ:\n${selected.title}\n半年後: ${selected.at6Months}\n1年後: ${selected.at12Months}\n\n` +
          "このシナリオに備えて『今すぐ取り組める内容』を2件、次の形式で:\n提案1: (タイトル) — (1文の説明)\n提案2: (タイトル) — (1文の説明)",
      },
    ]);
    for (const m of text.matchAll(/提案\d[::]\s*(.+?)\s*[—ー-]\s*(.+)/g)) {
      proposals.push({ title: m[1].trim().slice(0, 60), detail: m[2].trim().slice(0, 200) });
    }
    if (proposals.length === 0) {
      proposals.push({ title: "シナリオ対応計画の作成", detail: text.trim().slice(0, 200) });
    }
  }

  return {
    inputsDigest,
    scenarios,
    selected,
    proposals,
    brainName: provider.name,
    generatedAtMs: Date.now(),
  };
}
