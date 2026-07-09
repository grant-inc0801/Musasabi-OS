// マーケティング PDCA エンジン(MARKETING_PDCA_AND_MINIMIZED_ICON_DIRECTIVE.md §1)。
// 投稿タイトル単位の管理・数値分析ダッシュボード・PDCA(Plan/Do/Check/Act)・バージョン管理・
// Company Brain ナレッジ化・AI秘書サマリー(統一カード)を Mock・決定論で提供する。
// 実SNS接続・本番投稿・secrets なし。テキストロック時は解析のみ(本文改変なし)。

import type { SecretaryItem } from "@musasabi/ai-secretary";

export type PostChannel = "x" | "instagram" | "note" | "youtube" | "facebook";
export const POST_CHANNEL_LABEL_JA: Record<PostChannel, string> = {
  x: "X(Twitter)", instagram: "Instagram", note: "note", youtube: "YouTube", facebook: "Facebook",
};

export type PostFrequency = "1d" | "3d" | "7d" | "14d" | "30d";
export const POST_FREQUENCIES: ReadonlyArray<{ value: PostFrequency; labelJa: string; days: number }> = [
  { value: "1d", labelJa: "毎日", days: 1 },
  { value: "3d", labelJa: "3日ごと", days: 3 },
  { value: "7d", labelJa: "7日ごと", days: 7 },
  { value: "14d", labelJa: "14日ごと", days: 14 },
  { value: "30d", labelJa: "30日ごと", days: 30 },
];

export type PostApprovalStatus = "draft" | "in_review" | "approved" | "scheduled";
export const POST_APPROVAL_LABEL_JA: Record<PostApprovalStatus, string> = {
  draft: "下書き", in_review: "レビュー中", approved: "承認済み", scheduled: "予約済み(Mock)",
};

export type PostStatus = "planning" | "drafting" | "analyzing" | "approved" | "scheduled" | "archived";
export const POST_STATUS_LABEL_JA: Record<PostStatus, string> = {
  planning: "計画", drafting: "作成", analyzing: "分析", approved: "承認", scheduled: "予約", archived: "保管",
};

// ─────────────────── 数値分析ダッシュボード(12指標) ───────────────────

/** 投稿の数値分析・評価(指示書 Numeric Analysis Dashboard の12指標、0-100)。 */
export interface PostMetrics {
  overall: number;
  title: number;
  body: number;
  cta: number;
  targetMatch: number;
  hashtag: number;
  postingTime: number;
  engagementForecast: number;
  clickForecast: number;
  conversionForecast: number;
  improvementRate: number;
  riskScore: number;
}

export const METRIC_LABEL_JA: Record<keyof PostMetrics, string> = {
  overall: "総合スコア", title: "タイトル", body: "本文", cta: "CTA",
  targetMatch: "ターゲット適合", hashtag: "ハッシュタグ", postingTime: "投稿時間帯",
  engagementForecast: "エンゲージ予測", clickForecast: "クリック予測", conversionForecast: "CV予測",
  improvementRate: "改善余地", riskScore: "リスク",
};

export const METRIC_KEYS = Object.keys(METRIC_LABEL_JA) as Array<keyof PostMetrics>;

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * 投稿本文などから数値指標を決定論的に算出する(LLM/外部送信なし)。
 * ハッシュタグ有無・CTA有無・文字数・投稿時間帯などのヒューリスティック。
 */
export function analyzePostMetrics(input: {
  title: string;
  body: string;
  hasCta?: boolean;
  hasHashtag?: boolean;
  hasAttachment?: boolean;
  postingHour?: number; // 0-23
}): PostMetrics {
  const { title, body } = input;
  const hasCta = input.hasCta ?? /(試す|登録|詳しく|→|フォロー|チェック|購入|予約)/.test(body);
  const hasHashtag = input.hasHashtag ?? /[#＃]/.test(body);
  const len = body.length;
  const hour = input.postingHour ?? 12;

  const titleScore = clamp(50 + Math.min(title.length, 24) * 1.6);
  const bodyScore = clamp(len === 0 ? 0 : 90 - Math.max(0, len - 120) * 0.4 - (len < 20 ? 25 : 0));
  const ctaScore = hasCta ? 88 : 55;
  const hashtagScore = hasHashtag ? 84 : 58;
  // 投稿時間帯: 7-9, 12-13, 19-22 を高評価
  const goodHour = (hour >= 7 && hour <= 9) || (hour >= 12 && hour <= 13) || (hour >= 19 && hour <= 22);
  const postingTime = goodHour ? 86 : 62;
  const targetMatch = clamp(60 + (hasHashtag ? 12 : 0) + (hasCta ? 12 : 0));
  const attachmentBonus = input.hasAttachment ? 6 : 0;

  const overall = clamp((titleScore + bodyScore + ctaScore + hashtagScore + postingTime + targetMatch) / 6 + attachmentBonus);
  const engagementForecast = clamp(overall * 0.9 + (hasHashtag ? 6 : 0));
  const clickForecast = clamp(overall * 0.8 + (hasCta ? 10 : 0));
  const conversionForecast = clamp(clickForecast * 0.6 + (hasCta ? 8 : 0));
  const improvementRate = clamp(100 - overall);
  const riskScore = clamp((hasCta ? 0 : 20) + (len > 200 ? 20 : 0) + (hasHashtag ? 0 : 10));

  return {
    overall, title: titleScore, body: bodyScore, cta: ctaScore, targetMatch,
    hashtag: hashtagScore, postingTime, engagementForecast, clickForecast,
    conversionForecast, improvementRate, riskScore,
  };
}

// ─────────────────── バージョン管理 ───────────────────

export interface PostVersion {
  version: number;
  text: string;
  score: number;
  reason: string;
  isBest: boolean;
}

// ─────────────────── 投稿レコード(タイトル単位) ───────────────────

/** 投稿管理ユニット(指示書 Post Management Unit の必須項目)。 */
export interface MarketingPostRecord {
  postTitle: string;
  targetChannel: PostChannel;
  campaignName: string;
  assignedAiEmployee: string;
  draftText: string;
  attachmentReferences: readonly string[];
  textLocked: boolean;
  recurringEnabled: boolean;
  postingFrequency: PostFrequency | null;
  approvalStatus: PostApprovalStatus;
  currentVersion: number;
  currentStatus: PostStatus;
  createdDate: string;
  nextScheduledDate: string | null;
  versions: readonly PostVersion[];
  metrics: PostMetrics;
}

function makePost(p: Omit<MarketingPostRecord, "metrics" | "versions" | "currentVersion"> & {
  versionsText: Array<{ text: string; reason: string }>;
}): MarketingPostRecord {
  const versions: PostVersion[] = p.versionsText.map((v, i) => {
    const m = analyzePostMetrics({ title: p.postTitle, body: v.text });
    return { version: i + 1, text: v.text, score: m.overall, reason: v.reason, isBest: false };
  });
  const bestIdx = versions.reduce((best, v, i, arr) => (v.score > arr[best].score ? i : best), 0);
  if (versions.length) versions[bestIdx].isBest = true;
  const current = versions[versions.length - 1];
  return {
    ...p,
    currentVersion: versions.length,
    versions,
    metrics: analyzePostMetrics({ title: p.postTitle, body: current?.text ?? p.draftText }),
  };
}

export const MARKETING_POSTS: readonly MarketingPostRecord[] = [
  makePost({
    postTitle: "AI日報コーチ ローンチ告知",
    targetChannel: "x", campaignName: "ローンチキャンペーン", assignedAiEmployee: "マーケティングAI",
    draftText: "", attachmentReferences: ["OGP画像(Mock)"], textLocked: false, recurringEnabled: true,
    postingFrequency: "7d", approvalStatus: "in_review", currentStatus: "analyzing",
    createdDate: "2026-07-05", nextScheduledDate: null,
    versionsText: [
      { text: "新サービスをリリースしました。", reason: "初稿" },
      { text: "【新登場】AIが日報をコーチング。今すぐ試す→ #Musasabi #営業", reason: "CTAとハッシュタグを追加" },
    ],
  }),
  makePost({
    postTitle: "導入事例(Mock)note記事",
    targetChannel: "note", campaignName: "事例シリーズ", assignedAiEmployee: "マーケティングAI",
    draftText: "", attachmentReferences: ["本文Markdown(Mock)"], textLocked: true, recurringEnabled: false,
    postingFrequency: null, approvalStatus: "approved", currentStatus: "approved",
    createdDate: "2026-07-02", nextScheduledDate: "承認済み・日時未設定(Mock)",
    versionsText: [
      { text: "導入から1週間で日報の質が変わった——中小営業チームのMock事例。詳しくはこちら→ #導入事例", reason: "初稿(テキストロック)" },
    ],
  }),
];

// ─────────────────── PDCA 自動化 ───────────────────

export interface PdcaCycle {
  postTitle: string;
  plan: { channel: string; purpose: string; targetCustomer: string; expectedAction: string };
  do: string;
  check: { score: number; weakPoints: string[] };
  act: { textLocked: boolean; suggestions: string[]; nextVersionText: string | null };
}

/** 弱点(低いスコアの指標)を抽出する。 */
export function weakPoints(m: PostMetrics): string[] {
  return METRIC_KEYS
    .filter((k) => k !== "riskScore" && k !== "improvementRate" && m[k] < 70)
    .map((k) => METRIC_LABEL_JA[k]);
}

/** 改善提案(決定論)。テキストロック時は本文改変を提案しない。 */
export function buildSuggestions(m: PostMetrics, textLocked: boolean): string[] {
  const s: string[] = [];
  if (m.cta < 70) s.push("CTA(行動喚起)を追加");
  if (m.hashtag < 70) s.push("ハッシュタグを最適化");
  if (m.title < 70) s.push("タイトルを具体的に");
  if (m.postingTime < 70) s.push("投稿時間帯を最適化(朝/昼/夜)");
  if (m.body < 70) s.push("本文を要点先頭に整理");
  if (textLocked) return s.length ? [`(テキストロック中: 本文は変更せず)${s.join(" / ")}`] : ["ロック中: 改善余地は小さいです"];
  return s.length ? s : ["改善点は見つかりませんでした"];
}

/** 投稿タイトルに対する PDCA サイクルを Mock 実行する。 */
export function runPdca(post: MarketingPostRecord): PdcaCycle {
  const m = post.metrics;
  const suggestions = buildSuggestions(m, post.textLocked);
  const nextVersionText = post.textLocked
    ? null
    : `${post.versions[post.versions.length - 1]?.text ?? post.draftText}（改善案: ${suggestions.join("・")}）`;
  return {
    postTitle: post.postTitle,
    plan: {
      channel: POST_CHANNEL_LABEL_JA[post.targetChannel],
      purpose: `${post.campaignName}の認知/獲得`,
      targetCustomer: "中小営業組織の意思決定者",
      expectedAction: "詳細ページ閲覧 → 無料トライアル(Mock)",
    },
    do: post.approvalStatus === "approved" || post.approvalStatus === "scheduled"
      ? "承認済み。Mock予約を作成可能。"
      : "ドラフト作成済み。承認後にMock予約。",
    check: { score: m.overall, weakPoints: weakPoints(m) },
    act: { textLocked: post.textLocked, suggestions, nextVersionText },
  };
}

/** テキストロックを尊重して次バージョンを作る(ロック時は現状のまま返す)。 */
export function createNextVersion(post: MarketingPostRecord, newText: string, reason: string): MarketingPostRecord {
  if (post.textLocked) return post;
  const score = analyzePostMetrics({ title: post.postTitle, body: newText }).overall;
  const nextVersions: PostVersion[] = [
    ...post.versions.map((v) => ({ ...v, isBest: false })),
    { version: post.versions.length + 1, text: newText, score, reason, isBest: false },
  ];
  const bestIdx = nextVersions.reduce((b, v, i, a) => (v.score > a[b].score ? i : b), 0);
  nextVersions[bestIdx].isBest = true;
  return {
    ...post,
    draftText: newText,
    currentVersion: nextVersions.length,
    versions: nextVersions,
    metrics: analyzePostMetrics({ title: post.postTitle, body: newText }),
  };
}

// ─────────────────── Company Brain ナレッジ化 ───────────────────

/** 高スコア投稿を再利用ナレッジとして保存する(指示書 Company Brain Integration)。 */
export interface MarketingKnowledge {
  bestTitlePattern: string;
  bestCtaPattern: string;
  bestPostingTime: string;
  bestHashtagPattern: string;
  bestAttachmentPattern: string;
  successfulCampaignTemplate: string;
}

/** スコア閾値以上の投稿からナレッジ雛形を抽出する(決定論)。 */
export function extractKnowledge(posts: readonly MarketingPostRecord[] = MARKETING_POSTS, threshold = 70): MarketingKnowledge[] {
  return posts
    .filter((p) => p.metrics.overall >= threshold)
    .map((p) => ({
      bestTitlePattern: `具体名+ベネフィット(${p.postTitle})`,
      bestCtaPattern: "『今すぐ試す→(Mock)』",
      bestPostingTime: "朝7-9時 / 夜19-22時",
      bestHashtagPattern: "#サービス名 + #ターゲット文脈",
      bestAttachmentPattern: p.attachmentReferences[0] ?? "OGP画像",
      successfulCampaignTemplate: `${p.campaignName}: 告知→事例→CTA の3段`,
    }));
}

// ─────────────────── AI 秘書サマリー(統一カード) ───────────────────

/**
 * マーケティングの承認依頼・PDCA改善提案・高/低スコア・繰り返し予定・推奨を
 * AI秘書の統一カード形式で返す(指示書 AI Secretary Integration)。
 */
export function buildMarketingSecretaryItems(posts: readonly MarketingPostRecord[] = MARKETING_POSTS): SecretaryItem[] {
  const items: SecretaryItem[] = [];
  for (const p of posts) {
    if (p.approvalStatus === "in_review" || p.approvalStatus === "draft") {
      items.push({
        id: `mkt-approval-${p.postTitle}`, category: "approval_request",
        sourceDepartment: "マーケティング部", relatedAiEmployee: p.assignedAiEmployee,
        status: "waiting_approval", priority: p.metrics.overall >= 80 ? "medium" : "high",
        summary: `投稿「${p.postTitle}」の承認依頼(総合${p.metrics.overall})。`,
        reason: `PDCA解析済み。弱点: ${weakPoints(p.metrics).join("・") || "なし"}。`,
        recommendedAction: p.textLocked ? "内容確認のうえ承認(ロック中)。" : "改善提案を反映して承認。",
        approvalNeeded: true, expectedImpact: `エンゲージ予測${p.metrics.engagementForecast}。`,
        riskLevel: p.metrics.riskScore >= 30 ? "medium" : "low",
        suggestedNextStep: "承認 → Mock予約を生成。",
      });
    }
    if (p.metrics.overall >= 80) {
      items.push({
        id: `mkt-high-${p.postTitle}`, category: "workflow_improvement",
        sourceDepartment: "マーケティング部", relatedAiEmployee: p.assignedAiEmployee,
        status: "proposed", priority: "low",
        summary: `高スコア投稿「${p.postTitle}」をナレッジ化。`,
        reason: "総合スコアが高く、再利用テンプレートに適する。",
        recommendedAction: "Company Brain へベストパターンを保存。", approvalNeeded: false,
        expectedImpact: "以後の投稿品質の底上げ。", riskLevel: "low",
        suggestedNextStep: "テンプレート登録。",
      });
    } else {
      items.push({
        id: `mkt-low-${p.postTitle}`, category: "kpi_warning",
        sourceDepartment: "マーケティング部", relatedAiEmployee: p.assignedAiEmployee,
        status: "in_review", priority: "medium",
        summary: `低スコア投稿「${p.postTitle}」(総合${p.metrics.overall})。`,
        reason: `弱点: ${weakPoints(p.metrics).join("・") || "軽微"}。`,
        recommendedAction: buildSuggestions(p.metrics, p.textLocked).join(" / "), approvalNeeded: false,
        expectedImpact: "改善でCV予測の向上。", riskLevel: "medium",
        suggestedNextStep: p.textLocked ? "ロック解除を検討。" : "次バージョンを作成。",
      });
    }
    if (p.recurringEnabled && p.postingFrequency) {
      const freq = POST_FREQUENCIES.find((f) => f.value === p.postingFrequency)?.labelJa;
      items.push({
        id: `mkt-recurring-${p.postTitle}`, category: "followup_reminder",
        sourceDepartment: "マーケティング部", relatedAiEmployee: p.assignedAiEmployee,
        status: "scheduled", priority: "low",
        summary: `「${p.postTitle}」は${freq}の繰り返し予定(Mock)。`,
        reason: "繰り返し投稿が有効。", recommendedAction: "承認後にMock予約を生成。",
        approvalNeeded: false, expectedImpact: "継続的な接触。", riskLevel: "low",
        suggestedNextStep: "予約レコードを確認。",
      });
    }
  }
  return items;
}

export function summarizeMarketingJa(posts: readonly MarketingPostRecord[] = MARKETING_POSTS): string {
  const avg = Math.round(posts.reduce((a, p) => a + p.metrics.overall, 0) / (posts.length || 1));
  const inReview = posts.filter((p) => p.approvalStatus === "in_review").length;
  return `マーケPDCA: 投稿${posts.length}件・平均スコア${avg}・承認待ち${inReview}。`;
}

/** 本番SNS投稿は Production Readiness 承認まで無効。 */
export const EXTERNAL_POSTING_ENABLED = false;
