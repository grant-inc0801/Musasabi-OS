// AI 役員秘書 / 参謀(Chief of Staff)+ 市場調査レポート + マーケティングSNS投稿ワークフロー。
// docs/ai-handoff/AI_SECRETARY_RIGHT_DETAIL_PANEL_DIRECTIVE.md /
//        MARKET_RESEARCH_AND_MARKETING_DEPARTMENT_DIRECTIVE.md に基づく。
// すべて Mock・決定論。実外部接続・課金・secrets・本番投稿は行わない(承認までロック)。

// ─────────────────────────────── 共通 ───────────────────────────────

export type Priority = "high" | "medium" | "low";
export const PRIORITY_LABEL_JA: Record<Priority, string> = { high: "高", medium: "中", low: "低" };
export const PRIORITY_COLOR: Record<Priority, string> = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E" };
const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

// ───────────────────────── AI 秘書アイテム ─────────────────────────

/** 秘書カードのカテゴリ(指示書 Card Categories 9種)。 */
export type SecretaryCategory =
  | "approval_request"
  | "department_proposal"
  | "automation_candidate"
  | "ai_combination_idea"
  | "risk_alert"
  | "kpi_warning"
  | "workflow_improvement"
  | "new_business_idea"
  | "followup_reminder";

export const SECRETARY_CATEGORY_LABEL_JA: Record<SecretaryCategory, string> = {
  approval_request: "承認依頼",
  department_proposal: "部署提案",
  automation_candidate: "自動化候補",
  ai_combination_idea: "AI組み合わせ案",
  risk_alert: "リスク警告",
  kpi_warning: "KPI警告",
  workflow_improvement: "ワークフロー改善",
  new_business_idea: "新規事業アイデア",
  followup_reminder: "フォローアップ",
};

export type SecretaryStatus = "waiting_approval" | "proposed" | "in_review" | "scheduled" | "done";
export const SECRETARY_STATUS_LABEL_JA: Record<SecretaryStatus, string> = {
  waiting_approval: "承認待ち",
  proposed: "提案中",
  in_review: "レビュー中",
  scheduled: "予定",
  done: "完了",
};

/** 統一カード形式(指示書 Unified Card Format の必須項目)。 */
export interface SecretaryItem {
  id: string;
  category: SecretaryCategory;
  /** 発信元部署。 */
  sourceDepartment: string;
  /** 関連AI社員。 */
  relatedAiEmployee: string;
  status: SecretaryStatus;
  priority: Priority;
  summary: string;
  reason: string;
  recommendedAction: string;
  approvalNeeded: boolean;
  expectedImpact: string;
  riskLevel: Priority;
  suggestedNextStep: string;
}

/** 秘書アイテム(Mock・全9カテゴリを網羅)。 */
export const SECRETARY_ITEMS: readonly SecretaryItem[] = [
  {
    id: "sec-approval-dev", category: "approval_request",
    sourceDepartment: "システム開発部", relatedAiEmployee: "AI PM",
    status: "waiting_approval", priority: "high",
    summary: "次の実装Issueの作成申請。", reason: "現スプリント項目が完了し次タスクへ着手可能。",
    recommendedAction: "Issue作成(Mock)を承認。", approvalNeeded: true,
    expectedImpact: "開発ループの高速化。", riskLevel: "low",
    suggestedNextStep: "承認 または 修正依頼。",
  },
  {
    id: "sec-auto-sales", category: "automation_candidate",
    sourceDepartment: "営業部", relatedAiEmployee: "セールスコーチAI",
    status: "proposed", priority: "medium",
    summary: "日次のコール結果サマリーを自動化。", reason: "繰り返しの手動報告をテンプレートワークフロー化できる。",
    recommendedAction: "ワークフロー(Mock)を作成。", approvalNeeded: false,
    expectedImpact: "報告時間の削減。", riskLevel: "low",
    suggestedNextStep: "ワークフローのバックログへ追加。",
  },
  {
    id: "sec-combo-pub", category: "ai_combination_idea",
    sourceDepartment: "出版部", relatedAiEmployee: "敏腕編集長AI + セールスコーチAI",
    status: "proposed", priority: "medium",
    summary: "編集ナレッジと販売コピー生成を組み合わせる。", reason: "原稿のポジショニングを販売コピー・note商品ページに再利用できる。",
    recommendedAction: "共有プロンプトテンプレート(Mock)を作成。", approvalNeeded: false,
    expectedImpact: "出版の販促素材が強化される。", riskLevel: "low",
    suggestedNextStep: "Company Brain へ追加。",
  },
  {
    id: "sec-proposal-planning", category: "department_proposal",
    sourceDepartment: "企画部", relatedAiEmployee: "企画AI",
    status: "in_review", priority: "medium",
    summary: "新サービス『AI日報コーチ』の企画提案。", reason: "既存の営業データを活用でき初期投資が小さい。",
    recommendedAction: "市場調査部へ調査を依頼。", approvalNeeded: true,
    expectedImpact: "新規事業ラインの検証。", riskLevel: "medium",
    suggestedNextStep: "市場調査レポートを待って判断。",
  },
  {
    id: "sec-risk-dev", category: "risk_alert",
    sourceDepartment: "システム開発部", relatedAiEmployee: "AI監査",
    status: "in_review", priority: "high",
    summary: "beta-build のエラー率が閾値を超過。", reason: "直近のビルドで失敗が連続。",
    recommendedAction: "原因調査タスクを最優先化。", approvalNeeded: false,
    expectedImpact: "リリース遅延の回避。", riskLevel: "high",
    suggestedNextStep: "開発部AIへ調査を指示。",
  },
  {
    id: "sec-kpi-marketing", category: "kpi_warning",
    sourceDepartment: "マーケティング部", relatedAiEmployee: "マーケティングAI",
    status: "in_review", priority: "medium",
    summary: "リード獲得数の集計元に欠損の可能性。", reason: "先週比でリード数が急減。",
    recommendedAction: "集計ソースを確認。", approvalNeeded: false,
    expectedImpact: "KPIの正確性維持。", riskLevel: "medium",
    suggestedNextStep: "データ管理で整合性チェック。",
  },
  {
    id: "sec-wf-support", category: "workflow_improvement",
    sourceDepartment: "カスタマーサポート部", relatedAiEmployee: "サポートAI",
    status: "proposed", priority: "low",
    summary: "FAQ自動提案をチケット起票時に挿入。", reason: "一次対応の定型化で対応時間を短縮できる。",
    recommendedAction: "ワークフロー改善(Mock)を追加。", approvalNeeded: false,
    expectedImpact: "初動対応の短縮。", riskLevel: "low",
    suggestedNextStep: "サポートのバックログへ追加。",
  },
  {
    id: "sec-newbiz-research", category: "new_business_idea",
    sourceDepartment: "市場調査部", relatedAiEmployee: "リサーチAI",
    status: "proposed", priority: "medium",
    summary: "中小飲食店向けの予約×販促パックの新規事業案。", reason: "調査で未対応セグメントの需要を確認。",
    recommendedAction: "企画部と共同で事業ファクトリーに登録。", approvalNeeded: true,
    expectedImpact: "新規セグメントの開拓。", riskLevel: "medium",
    suggestedNextStep: "AI事業ファクトリーでMock検証。",
  },
  {
    id: "sec-followup-hr", category: "followup_reminder",
    sourceDepartment: "人事部", relatedAiEmployee: "人事AI",
    status: "scheduled", priority: "low",
    summary: "AI社員の稼働レビューを今週中に実施。", reason: "月次の稼働総括の期限が近い。",
    recommendedAction: "レビュー結果を全社ダッシュボードへ反映。", approvalNeeded: false,
    expectedImpact: "稼働状況の可視化維持。", riskLevel: "low",
    suggestedNextStep: "レビュー完了後に記録。",
  },
];

/** 秘書アクション(Mock。指示書 UI Requirements のボタン群)。 */
export type SecretaryActionKind =
  | "approve" | "reject" | "defer" | "create_issue_mock" | "add_backlog" | "send_department";
export const SECRETARY_ACTIONS: ReadonlyArray<{ kind: SecretaryActionKind; labelJa: string }> = [
  { kind: "approve", labelJa: "承認" },
  { kind: "reject", labelJa: "却下" },
  { kind: "defer", labelJa: "保留" },
  { kind: "create_issue_mock", labelJa: "Issue作成(Mock)" },
  { kind: "add_backlog", labelJa: "バックログ追加" },
  { kind: "send_department", labelJa: "部署へ送る" },
];

export interface SecretaryBriefing {
  dateLabel: string;
  headline: string;
  totalItems: number;
  approvalsWaiting: number;
  highPriority: number;
  risks: number;
  lines: readonly string[];
}

/** デイリーブリーフィングを集計する(決定論)。 */
export function computeBriefing(
  items: readonly SecretaryItem[] = SECRETARY_ITEMS,
  dateLabel = "本日",
): SecretaryBriefing {
  const approvalsWaiting = items.filter((i) => i.approvalNeeded && i.status === "waiting_approval").length;
  const highPriority = items.filter((i) => i.priority === "high").length;
  const risks = items.filter((i) => i.category === "risk_alert" || i.riskLevel === "high").length;
  return {
    dateLabel,
    headline: `${dateLabel}の要対応は ${items.length} 件。承認待ち ${approvalsWaiting} 件、優先度『高』${highPriority} 件。`,
    totalItems: items.length,
    approvalsWaiting,
    highPriority,
    risks,
    lines: [
      `承認待ち: ${approvalsWaiting} 件`,
      `リスク/高リスク: ${risks} 件`,
      `自動化候補: ${items.filter((i) => i.category === "automation_candidate").length} 件`,
      `AI組み合わせ案: ${items.filter((i) => i.category === "ai_combination_idea").length} 件`,
    ],
  };
}

export interface SecretaryFilter {
  category?: SecretaryCategory | "all";
  priority?: Priority | "all";
  department?: string | "all";
}

/** カテゴリ/優先度/部署でフィルタし、優先度順に並べる(決定論)。 */
export function filterSecretaryItems(
  items: readonly SecretaryItem[],
  filter: SecretaryFilter = {},
): SecretaryItem[] {
  const { category = "all", priority = "all", department = "all" } = filter;
  return items
    .filter((i) => (category === "all" ? true : i.category === category))
    .filter((i) => (priority === "all" ? true : i.priority === priority))
    .filter((i) => (department === "all" ? true : i.sourceDepartment === department))
    .slice()
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

/** アバター/吹き出し用の要約日本語文。 */
export function summarizeSecretaryJa(items: readonly SecretaryItem[] = SECRETARY_ITEMS): string {
  const b = computeBriefing(items);
  return `AI秘書: 要対応${b.totalItems}件(承認待ち${b.approvalsWaiting}・高${b.highPriority}・リスク${b.risks})。`;
}

/** アイテムに含まれる部署の一覧(フィルタUI用)。 */
export function departmentsOf(items: readonly SecretaryItem[] = SECRETARY_ITEMS): string[] {
  return [...new Set(items.map((i) => i.sourceDepartment))];
}

// ─────────────────────── 市場調査レポート ───────────────────────

export type ResearchStatus = "requested" | "in_progress" | "completed";
export const RESEARCH_STATUS_LABEL_JA: Record<ResearchStatus, string> = {
  requested: "依頼受付", in_progress: "調査中", completed: "完了",
};

export interface CompetitorRow {
  name: string;
  strength: string;
  weakness: string;
  price: string;
}

/** 標準市場調査レポート(指示書 Standard Report Format の必須項目)。 */
export interface MarketResearchReport {
  id: string;
  proposalTitle: string;
  sourceDepartment: string;
  requestingAiEmployee: string;
  researchStatus: ResearchStatus;
  marketSizeSummary: string;
  targetCustomer: string;
  topCompetitors: readonly string[];
  competitorComparison: readonly CompetitorRow[];
  differentiationPoints: readonly string[];
  pricingComparison: string;
  /** 機会スコア(0-100)。 */
  opportunityScore: number;
  riskLevel: Priority;
  recommendedStrategy: string;
  nextAction: string;
  approvalNeeded: boolean;
}

export const MARKET_RESEARCH_REPORTS: readonly MarketResearchReport[] = [
  {
    id: "mr-ai-daily-coach",
    proposalTitle: "AI日報コーチ",
    sourceDepartment: "企画部",
    requestingAiEmployee: "企画AI",
    researchStatus: "completed",
    marketSizeSummary: "国内SFA/営業支援は数百億円規模。中小向け日報×コーチングは未成熟で拡大余地あり。",
    targetCustomer: "従業員5〜50名の中小営業組織のマネージャー。",
    topCompetitors: ["大手SFA A社", "日報SaaS B社", "汎用チャットAI C社"],
    competitorComparison: [
      { name: "大手SFA A社", strength: "機能網羅", weakness: "高価格・重い", price: "¥1,500/人・月〜" },
      { name: "日報SaaS B社", strength: "日報特化", weakness: "コーチング無し", price: "¥800/人・月〜" },
      { name: "汎用チャットAI C社", strength: "低価格", weakness: "営業文脈が弱い", price: "¥0〜¥2,000/月" },
    ],
    differentiationPoints: ["営業文脈に特化したコーチング", "既存コールログと連携", "テンプレ日報の自動生成"],
    pricingComparison: "競合は人数課金中心。本案は中小向けに定額+席課金のハイブリッドが有利。",
    opportunityScore: 72,
    riskLevel: "medium",
    recommendedStrategy: "中小×日報×コーチングの狭い一点突破。既存コールログ資産を差別化に使う。",
    nextAction: "AI事業ファクトリーで最小構成のMock事業を作成し検証。",
    approvalNeeded: true,
  },
  {
    id: "mr-reserve-promo-pack",
    proposalTitle: "飲食店 予約×販促パック",
    sourceDepartment: "市場調査部",
    requestingAiEmployee: "リサーチAI",
    researchStatus: "in_progress",
    marketSizeSummary: "中小飲食は店舗数が多く、予約と販促を分断運用。統合ニーズは中程度〜高。",
    targetCustomer: "個人〜小規模の飲食店オーナー。",
    topCompetitors: ["予約台帳 D社", "販促アプリ E社", "グルメ媒体 F社"],
    competitorComparison: [
      { name: "予約台帳 D社", strength: "予約定番", weakness: "販促弱い", price: "¥10,000/月〜" },
      { name: "販促アプリ E社", strength: "クーポン強い", weakness: "予約無し", price: "¥5,000/月〜" },
      { name: "グルメ媒体 F社", strength: "集客力", weakness: "高手数料", price: "従量・高率" },
    ],
    differentiationPoints: ["予約と販促の一体運用", "AIが再来店施策を自動提案", "架電リスト連携"],
    pricingComparison: "媒体の従量課金に対し、定額+成果連動の軽量プランで差別化。",
    opportunityScore: 64,
    riskLevel: "medium",
    recommendedStrategy: "既存の架電リスト制作課と連携し、獲得〜再来店までを一気通貫でMock化。",
    nextAction: "企画部と共同で事業ユニット案を作成。",
    approvalNeeded: true,
  },
];

// ─────────────────── マーケティング SNS 投稿ワークフロー ───────────────────

export type PostChannel = "x" | "instagram" | "note" | "youtube" | "facebook";
export const POST_CHANNEL_LABEL_JA: Record<PostChannel, string> = {
  x: "X(Twitter)", instagram: "Instagram", note: "note", youtube: "YouTube", facebook: "Facebook",
};

export type PostApprovalStatus = "draft" | "in_review" | "approved" | "scheduled";
export const POST_APPROVAL_LABEL_JA: Record<PostApprovalStatus, string> = {
  draft: "下書き", in_review: "レビュー中", approved: "承認済み", scheduled: "予約済み(Mock)",
};

/** 投稿頻度(指示書 Frequency examples)。 */
export type PostFrequency = "1d" | "3d" | "7d" | "14d" | "30d";
export const POST_FREQUENCIES: ReadonlyArray<{ value: PostFrequency; labelJa: string; days: number }> = [
  { value: "1d", labelJa: "毎日", days: 1 },
  { value: "3d", labelJa: "3日ごと", days: 3 },
  { value: "7d", labelJa: "7日ごと", days: 7 },
  { value: "14d", labelJa: "14日ごと", days: 14 },
  { value: "30d", labelJa: "30日ごと", days: 30 },
];

/** 標準投稿レポート(指示書 Standard Post Report Format)。 */
export interface MarketingPost {
  id: string;
  campaignName: string;
  sourceDepartment: string;
  targetChannel: PostChannel;
  draftText: string;
  /** テキストロック(true=固定・AI改稿しない)。 */
  textLocked: boolean;
  recurringEnabled: boolean;
  frequency: PostFrequency | null;
  attachmentSummary: string;
  approvalStatus: PostApprovalStatus;
  analysisSummary: string;
  recommendedRevision: string;
  nextAction: string;
  revisionHistory: readonly string[];
  nextScheduledDate: string | null;
}

export const MARKETING_POSTS: readonly MarketingPost[] = [
  {
    id: "mp-launch-x",
    campaignName: "AI日報コーチ ローンチ告知",
    sourceDepartment: "マーケティング部",
    targetChannel: "x",
    draftText: "【新登場】AIがあなたの日報をコーチング。営業の振り返りを3分に。#Musasabi",
    textLocked: false,
    recurringEnabled: true,
    frequency: "7d",
    attachmentSummary: "OGP画像1枚(Mock参照)",
    approvalStatus: "in_review",
    analysisSummary: "訴求は明確。ハッシュタグ最適化とCTA追加の余地。",
    recommendedRevision: "末尾に『無料で試す→(Mock)』のCTAを追加。",
    nextAction: "承認後に7日ごとのMock予約を生成。",
    revisionHistory: ["初稿作成", "ハッシュタグ追加提案"],
    nextScheduledDate: null,
  },
  {
    id: "mp-case-note",
    campaignName: "導入事例(Mock)note記事",
    sourceDepartment: "マーケティング部",
    targetChannel: "note",
    draftText: "導入から1週間で日報の質が変わった——中小営業チームのMock事例をご紹介します。",
    textLocked: true,
    recurringEnabled: false,
    frequency: null,
    attachmentSummary: "本文Markdown(Mock)",
    approvalStatus: "approved",
    analysisSummary: "テキストロック済み。改稿は行わない。",
    recommendedRevision: "—(ロック中)",
    nextAction: "単発でMock予約を作成。",
    revisionHistory: ["初稿作成", "テキストロック"],
    nextScheduledDate: "承認済み・日時未設定(Mock)",
  },
];

export interface PostAnalysis {
  status: PostApprovalStatus;
  analysisSummary: string;
  recommendedRevision: string;
}

/**
 * 投稿ドラフトを解析する(決定論・LLM/外部送信なし)。
 * テキストロック時は改稿しない。未ロック時は簡易ヒューリスティックで改善提案を返す。
 */
export function analyzePostDraft(text: string, locked: boolean): PostAnalysis {
  if (locked) {
    return { status: "approved", analysisSummary: "テキストロック済み。改稿は行いません。", recommendedRevision: "—(ロック中)" };
  }
  const suggestions: string[] = [];
  if (!/[#＃]/.test(text)) suggestions.push("ハッシュタグを追加");
  if (!/(試す|登録|詳しく|→|フォロー|チェック)/.test(text)) suggestions.push("CTA(行動喚起)を追加");
  if (text.length > 130) suggestions.push("本文を短くして要点を先頭へ");
  const recommendedRevision = suggestions.length === 0 ? "改善点は見つかりませんでした。" : suggestions.join(" / ");
  return {
    status: "in_review",
    analysisSummary: `文字数${text.length}。${suggestions.length === 0 ? "良好" : `改善提案${suggestions.length}件`}。`,
    recommendedRevision,
  };
}

export interface ScheduledPostRecord {
  index: number;
  channel: PostChannel;
  dayOffset: number;
  label: string;
}

/**
 * Mock の予約投稿レコードを生成する(外部投稿は行わない)。
 * recurringEnabled かつ approved のときのみ生成。単発は1件。
 */
export function scheduleMockPosts(post: MarketingPost, count = 4): ScheduledPostRecord[] {
  if (post.approvalStatus !== "approved" && post.approvalStatus !== "scheduled") return [];
  if (!post.recurringEnabled || post.frequency === null) {
    return [{ index: 1, channel: post.targetChannel, dayOffset: 0, label: "単発(Mock)" }];
  }
  const days = POST_FREQUENCIES.find((f) => f.value === post.frequency)?.days ?? 7;
  return Array.from({ length: count }, (_, i) => ({
    index: i + 1,
    channel: post.targetChannel,
    dayOffset: i * days,
    label: `${i * days}日後(Mock)`,
  }));
}

/** 本番SNS投稿は Production Readiness 承認まで無効(指示書 Approval Rule)。 */
export const EXTERNAL_POSTING_ENABLED = false;
