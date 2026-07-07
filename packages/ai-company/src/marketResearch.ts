// 市場調査部+出版部クリーン運営体制(Directive D-20260706-009)。
// すべてMockデータ(実Web巡回・実API接続・実出版/投稿/販売はしない)。

// ---- 市場調査部 ----

/** AI最新情報(収集Mock)。 */
export interface AiTechnologyItem {
  source: string;
  title: string;
  category: string;
}

export const AI_TECHNOLOGY_ITEMS: readonly AiTechnologyItem[] = [
  { source: "Anthropic", title: "新Claudeモデルの提供開始(長文脈・低価格帯)", category: "モデル" },
  { source: "OpenAI", title: "音声APIの料金改定とリアルタイム性能向上", category: "料金改定" },
  { source: "GitHub Trending", title: "ローカルLLMエージェントOSSが急上昇", category: "OSS" },
  { source: "Hugging Face", title: "日本語特化の音声認識モデルが公開", category: "Voice" },
  { source: "arXiv", title: "マルチエージェント協調の新手法論文", category: "Agent" },
  { source: "Product Hunt", title: "ノーコードAI電話応対サービスが登場", category: "新サービス" },
];

/** 新AIサービス調査(Mock)。 */
export interface AiServiceResearchItem {
  name: string;
  provider: string;
  summary: string;
  relatedDept: string;
}

export const AI_SERVICE_ITEMS: readonly AiServiceResearchItem[] = [
  { name: "AI音声コーチSaaS", provider: "海外スタートアップ", summary: "通話音声を解析して話し方を改善", relatedDept: "営業部" },
  { name: "AI表紙生成ツール", provider: "国内サービス", summary: "電子書籍の表紙を権利クリアな素材で生成", relatedDept: "出版部" },
  { name: "MCP対応ワークフロー基盤", provider: "OSS", summary: "社内ツールをエージェントから安全に呼び出す", relatedDept: "開発部" },
];

/** 技術評価(Mock)。 */
export interface AiServiceEvaluation {
  name: string;
  accuracy: string;
  cost: string;
  japanese: string;
  commercialUse: string;
  license: string;
  recommendation: "採用候補" | "検証中" | "保留";
}

export const AI_SERVICE_EVALUATIONS: readonly AiServiceEvaluation[] = [
  { name: "日本語STTモデル(OSS)", accuracy: "高", cost: "低(ローカル)", japanese: "◎", commercialUse: "可", license: "MIT", recommendation: "採用候補" },
  { name: "音声コーチSaaS API", accuracy: "中", cost: "中(従量)", japanese: "○", commercialUse: "要確認", license: "商用", recommendation: "検証中" },
  { name: "表紙生成API", accuracy: "高", cost: "中", japanese: "○", commercialUse: "可(要クレジット)", license: "商用", recommendation: "保留" },
];

/** AI組み合わせ研究(Mock。Directive の例)。 */
export interface AiCombinationCandidate {
  combo: string;
  outcome: string;
}

export const AI_COMBINATION_CANDIDATES: readonly AiCombinationCandidate[] = [
  { combo: "OpenAI + Claude + Codex + VRoid + VOICEVOX", outcome: "営業AI社員 / デスクトップAI秘書 / 出版AI編集長" },
  { combo: "Whisper + VOICEVOX + Zoom Phone + Sales Brain", outcome: "テストコール改善AI / 音声コーチ / AutoCall品質管理" },
  { combo: "GitHub Trending + Product Hunt + Claude Code", outcome: "新規AIツール企画・Issue化システム" },
];

/** 部署間連携・CEO提案(Mock)。 */
export interface HandoffProposal {
  title: string;
  target: "開発部" | "企画部" | "CEO";
  status: "検討中" | "提案済み" | "承認待ち";
}

export const HANDOFF_PROPOSALS: readonly HandoffProposal[] = [
  { title: "日本語STTをテストコール解析へ組み込む", target: "開発部", status: "提案済み" },
  { title: "AI音声コーチを営業トレーニングへ応用", target: "開発部", status: "検討中" },
  { title: "架電リストツールの外販サービス化", target: "企画部", status: "提案済み" },
  { title: "AI出版パイプラインの商品化", target: "企画部", status: "検討中" },
  { title: "新AI音声サービス群の採用方針", target: "CEO", status: "承認待ち" },
];

/** 採用状況(Mock)。 */
export interface TechnologyAdoptionStatus {
  name: string;
  status: "採用済み" | "保留";
}

export const TECHNOLOGY_ADOPTIONS: readonly TechnologyAdoptionStatus[] = [
  { name: "three.js + VRM(アバター基盤)", status: "採用済み" },
  { name: "SerpAPI(架電リスト実データ)", status: "採用済み" },
  { name: "表紙生成API", status: "保留" },
];

/** 市場調査部KPI(Mock)。 */
export interface MarketResearchKpi {
  collectedToday: number;
  newServicesFound: number;
  evaluations: number;
  devHandoffs: number;
  planningHandoffs: number;
  ceoPending: number;
  adoptionCandidates: number;
}

export function buildMarketResearchKpi(): MarketResearchKpi {
  return {
    collectedToday: AI_TECHNOLOGY_ITEMS.length,
    newServicesFound: AI_SERVICE_ITEMS.length,
    evaluations: AI_SERVICE_EVALUATIONS.length,
    devHandoffs: HANDOFF_PROPOSALS.filter((p) => p.target === "開発部").length,
    planningHandoffs: HANDOFF_PROPOSALS.filter((p) => p.target === "企画部").length,
    ceoPending: HANDOFF_PROPOSALS.filter((p) => p.target === "CEO" && p.status === "承認待ち").length,
    adoptionCandidates: AI_SERVICE_EVALUATIONS.filter((e) => e.recommendation === "採用候補").length,
  };
}

/** 市場調査部のAI社員(Mock)。 */
export const MARKET_RESEARCH_STAFF: readonly string[] = [
  "AIリサーチャー",
  "AIアナリスト",
  "AIアーキテクト",
  "AIプロダクトストラテジスト",
  "AIトレンドウォッチャー",
];

// ---- 出版部クリーン運営体制 ----

export type CleanCheckStatus = "確認済" | "確認中" | "承認待ち" | "未着手";

export interface PublishingCleanCheck {
  item: string;
  status: CleanCheckStatus;
}

/** 出版前チェック(Mock。AI編集長が管理)。 */
export const PUBLISHING_CLEAN_CHECKS: readonly PublishingCleanCheck[] = [
  { item: "利用ルール確認(Kindle/note)", status: "確認済" },
  { item: "AI生成利用ルール確認", status: "確認済" },
  { item: "著作権チェック", status: "確認中" },
  { item: "類似作品チェック", status: "承認待ち" },
  { item: "引用・参考文献チェック", status: "確認済" },
  { item: "表紙素材権利チェック", status: "確認中" },
  { item: "販売プラットフォーム適合性", status: "確認済" },
  { item: "年齢制限・表現リスク", status: "確認済" },
  { item: "出版可否判定", status: "未着手" },
];

export const CLEAN_CHECK_STATUS_COLOR: Record<CleanCheckStatus, string> = {
  確認済: "#22C55E",
  確認中: "#FACC15",
  承認待ち: "#A855F7",
  未着手: "#6b7280",
};

/** 出版部のAI社員(Mock)。 */
export const PUBLISHING_STAFF: readonly string[] = [
  "AI編集長(規約・品質・出版可否の最終管理)",
  "AI校正担当(誤字脱字・文章品質)",
  "AI類似性チェッカー(既存作品との酷似確認)",
  "AI権利管理担当(素材・引用・著作権確認)",
  "AI販売戦略担当(Kindle/note等の販売設計)",
];

/** アバター吹き出し用: 市場調査部・出版部の要約行(Mock・決定的)。 */
export function buildResearchAndPublishingSummaryJa(): string[] {
  const kpi = buildMarketResearchKpi();
  const lines: string[] = [];
  lines.push(
    `市場調査部が新しいAIサービスを${kpi.newServicesFound}件発見しました。開発部と連携すると営業部のテストコール改善ツールに応用できそうです。`,
  );
  const waiting = PUBLISHING_CLEAN_CHECKS.filter((c) => c.status === "承認待ち");
  if (waiting.length > 0) {
    lines.push(
      `出版部で${waiting.map((c) => c.item).join("・")}が承認待ちです。AI編集長が確認し、必要に応じてCEO承認へ進めます。`,
    );
  }
  return lines;
}
