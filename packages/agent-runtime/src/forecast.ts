// 未来予測エンジン(本番実装・無課金・端末内処理)。
// 市場調査の実データ(RSS見出し+社内RAG)を入力に、AIの発展を半年〜1年先まで
// 「複数に枝分かれしたシナリオ」として生成し、
//   1) 倫理フィルタ(キーワード遮断+シナリオ自体の倫理評価)で不適切な分岐を排除
//   2) 残った分岐を実現性スコアで評価し、最も現実性の高いシナリオを選出
//   3) 選出シナリオから「現在取り組める内容」の提案を生成(実行は人間の承認後)
// 頭脳は LlmProvider(ローカルLLM or ルールベース)。予測は断定ではなく提案であり、
// 選出根拠・除外理由を必ず明示する(説明可能性)。

import type { LlmProvider } from "./llm";
import { checkAgainstConstitution, type AgiProposal } from "@musasabi/agi";

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


// ─────────────── AGI 深層予測(精度・粒度の向上)───────────────
// AGI 的な多段推論で予測を強化する:
//  粒度: 各主分岐を2本のサブ分岐へ展開(2階層のシナリオツリー)
//  精度: (a) 自己批評(critic)が各葉の根拠を検証し確率を較正
//        (b) 過去の予測(履歴)と最新データの差分から学習ノートを生成し、次回に活かす
//  統制: 提案は Musasabi 憲章(packages/agi)への適合チェックを通す
// すべて端末内処理。倫理フィルタは主分岐・サブ分岐の両方に適用する。

export interface ForecastSubBranch {
  id: string;
  title: string;
  at6Months: string;
  at12Months: string;
  /** 生成時の実現性(0〜100)。 */
  plausibility: number;
  /** 自己批評による較正後の実現性。 */
  calibratedPlausibility: number;
  /** 批評ノート(根拠の弱点・補正理由)。 */
  critiqueNote?: string;
  ethical: boolean;
  ethicsNote?: string;
}

export interface DeepForecastResult extends ForecastResult {
  /** 各主分岐のサブ分岐(scenario.id → サブ分岐)。 */
  subBranches: Record<string, ForecastSubBranch[]>;
  /** 選出された葉(主分岐+サブ分岐)。 */
  selectedLeaf: { main: ForecastScenario; sub: ForecastSubBranch } | null;
  /** 過去予測との差分から得た学習ノート(履歴がある場合)。 */
  learningNote?: string;
  /** 提案の憲章チェック結果。 */
  constitutionNotes: string[];
}

const SUB_SEEDS = ["加速側(この分岐がさらに速く進んだ場合)", "堅実側(この分岐が慎重に進んだ場合)"];

async function generateSubBranch(
  provider: LlmProvider,
  main: ForecastScenario,
  seed: string,
  index: number,
): Promise<ForecastSubBranch> {
  const text = await provider.chat([
    {
      role: "system",
      content: "あなたは Musasabi OS の未来予測AIです。親シナリオを前提に、より細かい粒度で予測します。倫理に反する発展は選択肢にしません。",
    },
    {
      role: "user",
      content:
        `[SUBFORECAST] 親シナリオ: ${main.title}\n半年後: ${main.at6Months}\n1年後: ${main.at12Months}\n\n` +
        `サブ分岐: ${seed}\n` +
        "このサブ分岐を予測してください。必ず次の形式で:\nタイトル: (1行)\n半年後: (2文以内)\n1年後: (2文以内)\n確率: NN%",
    },
  ]);
  const titleMatch = text.match(/タイトル[::]\s*(.+)/);
  const m6 = text.match(/半年後[::]\s*([\s\S]*?)(?=\n1年後|$)/);
  const m12 = text.match(/1年後[::]\s*([\s\S]*?)(?=\n確率|$)/);
  const ethicsIssue = screenEthics(text);
  const plausibility = parsePlausibility(text);
  return {
    id: `${main.id}-sub-${index + 1}`,
    title: (titleMatch?.[1] ?? seed).trim().slice(0, 80),
    at6Months: (m6?.[1] ?? text).trim().slice(0, 300),
    at12Months: (m12?.[1] ?? "").trim().slice(0, 300),
    plausibility,
    calibratedPlausibility: plausibility,
    ethical: ethicsIssue === null,
    ethicsNote: ethicsIssue ?? undefined,
  };
}

/** 自己批評: 葉の根拠を検証し、補正確率と批評ノートを返す。 */
async function critiqueLeaf(
  provider: LlmProvider,
  main: ForecastScenario,
  sub: ForecastSubBranch,
): Promise<{ calibrated: number; note: string }> {
  const text = await provider.chat([
    {
      role: "system",
      content: "あなたは Musasabi OS の批評AI(critic)です。予測の根拠の弱点を具体的に指摘し、確率を過大評価から補正します。",
    },
    {
      role: "user",
      content:
        `[CRITIQUE] 予測: ${main.title} → ${sub.title}\n半年後: ${sub.at6Months}\n1年後: ${sub.at12Months}\n提示確率: ${sub.plausibility}%\n\n` +
        "根拠の弱点を1文で指摘し、最後に必ず「補正確率: NN%」の形式で示してください。",
    },
  ]);
  const corrected = parsePlausibility(text.match(/補正確率[::]?\s*\d{1,3}\s*%?/)?.[0] ?? "");
  const calibrated = Math.round((sub.plausibility + (corrected === 50 && !/補正確率/.test(text) ? sub.plausibility : corrected)) / 2);
  return { calibrated, note: text.split("\n")[0].trim().slice(0, 160) };
}

/**
 * AGI 深層予測: 主分岐→サブ分岐展開→自己批評による較正→履歴学習→葉レベルで選出→提案+憲章チェック。
 * pastDigest には前回予測の要約(選出タイトル・確率など)を渡すと学習ノートを生成する。
 */
export async function runForecastDeep(
  provider: LlmProvider,
  marketInputs: string,
  pastDigest?: string,
): Promise<DeepForecastResult> {
  const base = await runForecast(provider, marketInputs, 3);

  // 粒度: 倫理を通過した主分岐をサブ分岐に展開
  const subBranches: Record<string, ForecastSubBranch[]> = {};
  for (const main of base.scenarios) {
    if (!main.ethical) continue;
    const subs: ForecastSubBranch[] = [];
    for (let i = 0; i < SUB_SEEDS.length; i++) {
      subs.push(await generateSubBranch(provider, main, SUB_SEEDS[i], i));
    }
    subBranches[main.id] = subs;
  }

  // 精度: 自己批評で各葉の確率を較正
  for (const main of base.scenarios) {
    for (const sub of subBranches[main.id] ?? []) {
      if (!sub.ethical) continue;
      const { calibrated, note } = await critiqueLeaf(provider, main, sub);
      sub.calibratedPlausibility = Math.max(0, Math.min(100, calibrated));
      sub.critiqueNote = note;
    }
  }

  // 履歴学習: 前回予測との差分を評価(履歴があるときのみ)
  let learningNote: string | undefined;
  if (pastDigest && pastDigest.trim() !== "") {
    learningNote = (
      await provider.chat([
        { role: "system", content: "あなたは Musasabi OS の較正AIです。過去の予測と最新データを比べ、次回の予測精度を上げるための学習ノートを作ります。" },
        {
          role: "user",
          content: `[CALIBRATE] 前回の予測:\n${pastDigest.slice(0, 500)}\n\n最新の市場データ:\n${marketInputs.slice(0, 500)}\n\n前回予測と現状の差分を評価し、次回に活かす学習ノートを2文以内で。`,
        },
      ])
    ).trim().slice(0, 300);
  }

  // 選出: 葉レベル(倫理通過のサブ分岐)で較正後確率が最大のもの
  let selectedLeaf: DeepForecastResult["selectedLeaf"] = null;
  for (const main of base.scenarios) {
    if (!main.ethical) continue;
    for (const sub of subBranches[main.id] ?? []) {
      if (!sub.ethical) continue;
      if (!selectedLeaf || sub.calibratedPlausibility > selectedLeaf.sub.calibratedPlausibility) {
        selectedLeaf = { main, sub };
      }
    }
  }

  // 提案: 選出した葉から生成し、Musasabi 憲章チェックを通す
  let proposals = base.proposals;
  const constitutionNotes: string[] = [];
  if (selectedLeaf) {
    const text = await provider.chat([
      { role: "system", content: "あなたは Musasabi OS の企画部AIです。実行は人間の承認後に行われます。端末内で完結できる準備作業を優先して提案してください。" },
      {
        role: "user",
        content:
          `[PROPOSE] 選出された未来シナリオ(深層):\n${selectedLeaf.main.title} → ${selectedLeaf.sub.title}\n` +
          `半年後: ${selectedLeaf.sub.at6Months}\n1年後: ${selectedLeaf.sub.at12Months}\n\n` +
          "このシナリオに備えて『今すぐ取り組める内容』を2件、次の形式で:\n提案1: (タイトル) — (1文の説明)\n提案2: (タイトル) — (1文の説明)",
      },
    ]);
    const parsed: ForecastProposal[] = [];
    for (const m of text.matchAll(/提案\d[::]\s*(.+?)\s*[—ー-]\s*(.+)/g)) {
      parsed.push({ title: m[1].trim().slice(0, 60), detail: m[2].trim().slice(0, 200) });
    }
    if (parsed.length > 0) proposals = parsed;
    for (const [i, prop] of proposals.entries()) {
      const agiProposal: AgiProposal = {
        id: `forecast-prop-${i + 1}`,
        kind: "strategy",
        title: prop.title,
        rationale: prop.detail,
        impact: "moderate",
        expectedBenefit: 4,
      };
      const check = checkAgainstConstitution(agiProposal);
      constitutionNotes.push(
        `${prop.title}: 憲章適合=${check.compliant ? "OK" : "NG"} / 承認${check.requiresApproval ? "必須" : "任意"} / ${check.notes[0] ?? ""}`,
      );
    }
  }

  return {
    ...base,
    proposals,
    subBranches,
    selectedLeaf,
    learningNote,
    constitutionNotes,
  };
}

// ---------------------------------------------------------------------------
// 予測の的中率トラッキング(予測と実績の突合)
// ---------------------------------------------------------------------------

export type ForecastOutcomeSuggestion = "hit" | "partial" | "miss";

export interface ForecastOutcomeEvaluation {
  /** 予測キーワードのうち実績(証拠)に現れた割合(0〜1)。 */
  matchRatio: number;
  /** 実績に現れた予測キーワード。 */
  matchedKeywords: string[];
  /** 抽出した予測キーワード全体。 */
  keywords: string[];
  /** 決定論の判定候補(hit>=0.6 / partial>=0.3 / miss)。人間が上書きできる。 */
  suggestion: ForecastOutcomeSuggestion;
}

/** 予測文からキーワードを抽出する(漢字・カタカナ・英数の2文字以上の連なり)。 */
export function extractForecastKeywords(text: string): string[] {
  const runs = text.match(/[一-鿿]{2,}|[゠-ヿ]{2,}|[A-Za-z0-9]{2,}/g) ?? [];
  // 予測文で頻出する一般語はキーワードにしない(突合の水増し防止)
  const stop = new Set(["半年", "以内", "1年", "予測", "予想", "見込", "可能", "業界", "市場", "する", "なる", "こと"]);
  return [...new Set(runs.filter((w) => !stop.has(w)))];
}

/**
 * 予測と実績(RSS見出し・社内記録などの証拠テキスト)を突合する(決定論)。
 * キーワード一致率で hit / partial / miss を提案する。最終判定は人間が上書きできる。
 */
export function evaluateForecastOutcome(
  forecastText: string,
  evidence: readonly string[],
): ForecastOutcomeEvaluation {
  const keywords = extractForecastKeywords(forecastText);
  const corpus = evidence.join("\n");
  const matchedKeywords = keywords.filter((k) => corpus.includes(k));
  const matchRatio = keywords.length === 0 ? 0 : matchedKeywords.length / keywords.length;
  const suggestion: ForecastOutcomeSuggestion =
    matchRatio >= 0.6 ? "hit" : matchRatio >= 0.3 ? "partial" : "miss";
  return { matchRatio: Math.round(matchRatio * 100) / 100, matchedKeywords, keywords, suggestion };
}
