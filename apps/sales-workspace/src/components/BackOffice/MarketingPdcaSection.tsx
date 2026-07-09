import { useState } from "react";
import {
  MARKETING_POSTS,
  METRIC_KEYS,
  METRIC_LABEL_JA,
  POST_CHANNEL_LABEL_JA,
  POST_APPROVAL_LABEL_JA,
  POST_STATUS_LABEL_JA,
  POST_FREQUENCIES,
  extractKnowledge,
  runPdca,
  summarizeMarketingJa,
  type MarketingPostRecord,
} from "@musasabi/marketing-pdca";

// マーケティング PDCA エンジン(MARKETING_PDCA_AND_MINIMIZED_ICON_DIRECTIVE.md §1)。
// 投稿タイトル単位の数値分析ダッシュボード + PDCA(Plan/Do/Check/Act)+ バージョン履歴 +
// Company Brain ナレッジ化。すべて Mock・決定論。テキストロック時は解析のみ。

function scoreColor(v: number): string {
  return v >= 80 ? "#22C55E" : v >= 60 ? "#F59E0B" : "#94a3b8";
}

function MetricsGrid({ post }: { post: MarketingPostRecord }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(13rem, 1fr))", gap: "0.2rem 0.8rem" }}>
      {METRIC_KEYS.map((k) => {
        const v = post.metrics[k];
        return (
          <div key={k} style={{ fontSize: "0.72rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>{METRIC_LABEL_JA[k]}</span><span>{v}</span></div>
            <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${v}%`, height: "100%", background: k === "riskScore" ? (v >= 30 ? "#EF4444" : "#22C55E") : scoreColor(v) }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MarketingPdcaSection() {
  const [pdcaFor, setPdcaFor] = useState<string | null>(null);
  const knowledge = extractKnowledge();

  return (
    <section aria-label="マーケティングPDCAエンジン">
      <h3>マーケティング PDCA エンジン(Mock)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
        投稿タイトル単位で数値分析・PDCA(計画→実行→評価→改善)・バージョン管理を行います。
        テキストロック時は本文を変更せず解析のみ。実SNS接続・本番投稿は行いません。
      </p>
      <p style={{ color: "var(--accent, #6c8cff)", fontSize: "0.82rem" }}>🐿️ {summarizeMarketingJa()}</p>

      {MARKETING_POSTS.map((p) => {
        const pdca = runPdca(p);
        const open = pdcaFor === p.postTitle;
        return (
          <div key={p.postTitle} className="card" style={{ marginBottom: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong>{p.postTitle}</strong>
              <span className="badge" style={{ fontSize: "0.66rem" }}>{POST_CHANNEL_LABEL_JA[p.targetChannel]}</span>
              <span className="badge" style={{ fontSize: "0.66rem" }}>{POST_APPROVAL_LABEL_JA[p.approvalStatus]}</span>
              <span className="badge" style={{ fontSize: "0.66rem" }}>{POST_STATUS_LABEL_JA[p.currentStatus]}</span>
              {p.textLocked && <span className="badge" style={{ fontSize: "0.66rem" }}>🔒 ロック</span>}
              {p.recurringEnabled && <span className="badge" style={{ fontSize: "0.66rem" }}>繰り返し {POST_FREQUENCIES.find((f) => f.value === p.postingFrequency)?.labelJa}</span>}
              <span style={{ marginLeft: "auto", fontSize: "0.82rem" }}>総合 <b style={{ color: scoreColor(p.metrics.overall) }}>{p.metrics.overall}</b></span>
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: "0.2rem 0" }}>
              担当: {p.assignedAiEmployee} / キャンペーン: {p.campaignName} / v{p.currentVersion} / 作成 {p.createdDate}
            </div>

            {/* 数値分析ダッシュボード */}
            <div style={{ fontSize: "0.72rem", fontWeight: 700, margin: "0.3rem 0 0.2rem" }}>数値分析ダッシュボード</div>
            <MetricsGrid post={p} />

            {/* バージョン履歴 */}
            <div style={{ fontSize: "0.72rem", fontWeight: 700, margin: "0.4rem 0 0.2rem" }}>バージョン履歴</div>
            <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0, fontSize: "0.74rem" }}>
              {p.versions.map((v) => (
                <li key={v.version} style={{ padding: "0.1rem 0" }}>
                  v{v.version}(スコア {v.score}){v.isBest && <span className="badge" style={{ fontSize: "0.62rem", marginLeft: 6 }}>ベスト</span>} — {v.reason}
                  <div style={{ color: "var(--text-muted)" }}>{v.text}</div>
                </li>
              ))}
            </ul>

            <button type="button" className="quick-template" style={{ marginTop: "0.35rem" }} onClick={() => setPdcaFor(open ? null : p.postTitle)}>
              {open ? "PDCAを閉じる" : "PDCAを実行(Mock)"}
            </button>
            {open && (
              <div className="card" style={{ marginTop: "0.35rem", fontSize: "0.76rem" }}>
                <div><strong>Plan</strong>: {pdca.plan.channel} / 目的: {pdca.plan.purpose} / 対象: {pdca.plan.targetCustomer} / 期待行動: {pdca.plan.expectedAction}</div>
                <div><strong>Do</strong>: {pdca.do}</div>
                <div><strong>Check</strong>: スコア {pdca.check.score} / 弱点: {pdca.check.weakPoints.join("・") || "なし"}</div>
                <div><strong>Act</strong>: {pdca.act.suggestions.join(" / ")}</div>
                {pdca.act.nextVersionText && <div style={{ color: "var(--text-muted)" }}>次版案: {pdca.act.nextVersionText}</div>}
                {pdca.act.textLocked && <div style={{ color: "var(--text-muted)" }}>※ テキストロック中のため本文は変更しません。</div>}
              </div>
            )}
          </div>
        );
      })}

      {/* Company Brain ナレッジ化 */}
      <h4 style={{ marginBottom: "0.3rem" }}>Company Brain 保存(高スコア投稿のベストパターン)</h4>
      {knowledge.map((k, i) => (
        <div key={i} className="card" style={{ marginBottom: "0.4rem", fontSize: "0.76rem" }}>
          <div>ベストタイトル: {k.bestTitlePattern}</div>
          <div>ベストCTA: {k.bestCtaPattern} / ベスト時間帯: {k.bestPostingTime}</div>
          <div>ベストハッシュタグ: {k.bestHashtagPattern} / 添付: {k.bestAttachmentPattern}</div>
          <div>成功テンプレート: {k.successfulCampaignTemplate}</div>
        </div>
      ))}
    </section>
  );
}
