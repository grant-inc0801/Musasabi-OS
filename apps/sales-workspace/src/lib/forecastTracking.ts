// 予測の的中率トラッキング(本番・完全ローカル)。
// 未来予測で選出されたシナリオを記録し、後日 RSS 実データ・社内記録と突合して
// hit(的中)/ partial(部分的中)/ miss(外れ)を判定する。判定結果は的中率
// ダッシュボードに表示し、次回予測の較正(pastDigest)へフィードバックする。

import { evaluateForecastOutcome } from "@musasabi/agent-runtime";

export type ForecastOutcomeStatus = "pending" | "hit" | "partial" | "miss";

export interface ForecastOutcomeRecord {
  id: string;
  /** 予測の要旨(選出シナリオ: 主分岐→サブ分岐)。突合はこの文に対して行う。 */
  summary: string;
  /** 予測時点の較正後実現性(%)。 */
  plausibility: number;
  createdAtMs: number;
  status: ForecastOutcomeStatus;
  /** 判定日時(pending 以外)。 */
  verifiedAtMs?: number;
  /** 自動突合の根拠(一致キーワードと一致率)。 */
  evidenceNote?: string;
}

const KEY = "musasabi.forecastOutcomes";
/** 保持する予測記録の上限。 */
const MAX_RECORDS = 30;

export function loadForecastOutcomes(): ForecastOutcomeRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as ForecastOutcomeRecord[]) : [];
    return Array.isArray(parsed) ? parsed.filter((r) => r && typeof r.id === "string") : [];
  } catch {
    return [];
  }
}

function save(records: readonly ForecastOutcomeRecord[]): void {
  localStorage.setItem(KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
}

/** 予測実行時に選出シナリオを pending として記録する。 */
export function trackForecastOutcome(summary: string, plausibility: number): ForecastOutcomeRecord {
  const rec: ForecastOutcomeRecord = {
    id: `fo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    summary: summary.slice(0, 300),
    plausibility,
    createdAtMs: Date.now(),
    status: "pending",
  };
  save([rec, ...loadForecastOutcomes()]);
  return rec;
}

/** 判定を手動で上書きする(人間の最終判断を優先)。 */
export function setForecastOutcomeStatus(id: string, status: ForecastOutcomeStatus): ForecastOutcomeRecord[] {
  const next = loadForecastOutcomes().map((r) =>
    r.id === id ? { ...r, status, verifiedAtMs: status === "pending" ? undefined : Date.now() } : r,
  );
  save(next);
  return next;
}

export function removeForecastOutcome(id: string): ForecastOutcomeRecord[] {
  const next = loadForecastOutcomes().filter((r) => r.id !== id);
  save(next);
  return next;
}

/**
 * 自動突合: pending の予測を実績(RSS見出し・社内記録)と決定論スコアで照合し、
 * hit / partial / miss の判定候補を書き込む。人間は後から上書きできる。
 */
export function autoVerifyForecastOutcomes(evidence: readonly string[]): {
  records: ForecastOutcomeRecord[];
  verifiedCount: number;
} {
  let verifiedCount = 0;
  const next = loadForecastOutcomes().map((r) => {
    if (r.status !== "pending") return r;
    const ev = evaluateForecastOutcome(r.summary, evidence);
    verifiedCount += 1;
    return {
      ...r,
      status: ev.suggestion,
      verifiedAtMs: Date.now(),
      evidenceNote:
        ev.matchedKeywords.length > 0
          ? `一致率${Math.round(ev.matchRatio * 100)}%(${ev.matchedKeywords.slice(0, 5).join("・")})`
          : "実績データに一致キーワードなし",
    };
  });
  save(next);
  return { records: next, verifiedCount };
}

export interface ForecastAccuracyStats {
  total: number;
  pending: number;
  hit: number;
  partial: number;
  miss: number;
  /** 判定済みに対する的中率(hit=1, partial=0.5)。判定なしは null。 */
  hitRatePercent: number | null;
  /** 的中予測の平均実現性(較正の妥当性確認用)。 */
  avgPlausibilityHit: number | null;
  /** 外れ予測の平均実現性。 */
  avgPlausibilityMiss: number | null;
}

export function forecastAccuracyStats(records = loadForecastOutcomes()): ForecastAccuracyStats {
  const by = (s: ForecastOutcomeStatus) => records.filter((r) => r.status === s);
  const hit = by("hit");
  const partial = by("partial");
  const miss = by("miss");
  const judged = hit.length + partial.length + miss.length;
  const avg = (rs: ForecastOutcomeRecord[]) =>
    rs.length === 0 ? null : Math.round(rs.reduce((s, r) => s + r.plausibility, 0) / rs.length);
  return {
    total: records.length,
    pending: by("pending").length,
    hit: hit.length,
    partial: partial.length,
    miss: miss.length,
    hitRatePercent: judged === 0 ? null : Math.round(((hit.length + partial.length * 0.5) / judged) * 100),
    avgPlausibilityHit: avg(hit),
    avgPlausibilityMiss: avg(miss),
  };
}

/**
 * 次回予測の較正フィードバック文(pastDigest へ追記する)。
 * 的中率と傾向を1〜2行で要約し、予測エンジンの学習ノート生成に使わせる。
 */
export function buildAccuracyDigest(records = loadForecastOutcomes()): string {
  const stats = forecastAccuracyStats(records);
  if (stats.hitRatePercent === null) return "";
  const lines = [
    `的中率実績: ${stats.hitRatePercent}%(的中${stats.hit}・部分${stats.partial}・外れ${stats.miss})`,
  ];
  if (stats.avgPlausibilityHit !== null && stats.avgPlausibilityMiss !== null) {
    lines.push(
      stats.avgPlausibilityMiss >= stats.avgPlausibilityHit
        ? `注意: 外れ予測の平均実現性(${stats.avgPlausibilityMiss}%)が的中(${stats.avgPlausibilityHit}%)以上 — 実現性の見積もりを慎重側へ較正すること`
        : `較正は妥当(的中平均${stats.avgPlausibilityHit}% > 外れ平均${stats.avgPlausibilityMiss}%)`,
    );
  }
  return lines.join("\n");
}
