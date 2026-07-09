import { useMemo, useState } from "react";
import {
  MARKETING_POSTS,
  POST_CHANNEL_LABEL_JA,
  POST_APPROVAL_LABEL_JA,
  POST_FREQUENCIES,
  EXTERNAL_POSTING_ENABLED,
  analyzePostDraft,
  scheduleMockPosts,
  type PostChannel,
  type PostFrequency,
} from "@musasabi/ai-secretary";
import { recordMemory } from "../../lib/memoryStorage";

// マーケティング部: SNS投稿ワークフロー(MARKET_RESEARCH_AND_MARKETING_DEPARTMENT_DIRECTIVE.md)。
// ドラフト作成→(任意)素材添付→品質解析→承認→承認後にMock予約/投稿。
// テキストロック・繰り返し投稿・頻度ドロップダウン・添付・承認を表現。
// すべて Mock。実SNS接続・本番投稿は Production Readiness 承認まで無効。

const CHANNELS: PostChannel[] = ["x", "instagram", "note", "youtube", "facebook"];

export function SnsPostingWorkflow() {
  // 対話デモ用ドラフト
  const [channel, setChannel] = useState<PostChannel>("x");
  const [text, setText] = useState("【新登場】AIが日報をコーチング。#Musasabi");
  const [textLocked, setTextLocked] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<PostFrequency>("7d");
  const [attachment, setAttachment] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const analysis = useMemo(() => analyzePostDraft(text, textLocked), [text, textLocked]);
  const scheduled = useMemo(
    () =>
      scheduleMockPosts(
        {
          id: "draft", campaignName: "draft", sourceDepartment: "マーケティング部", targetChannel: channel,
          draftText: text, textLocked, recurringEnabled: recurring, frequency: recurring ? frequency : null,
          attachmentSummary: attachment ?? "", approvalStatus: approved ? "approved" : "in_review",
          analysisSummary: "", recommendedRevision: "", nextAction: "", revisionHistory: [], nextScheduledDate: null,
        },
        4,
      ),
    [channel, text, textLocked, recurring, frequency, attachment, approved],
  );

  function handleApprove(): void {
    setApproved(true);
    setNote("承認しました(Mock)。承認後は予約レコードを生成できます(外部投稿は無効)。");
    recordMemory({ category: "work", actor: "user", action: "SNS投稿を承認(Mock)", detail: text, tags: ["marketing", "sns"] });
  }

  return (
    <section aria-label="SNS投稿ワークフロー">
      <h3>SNS投稿ワークフロー(Mock)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
        ドラフト作成 → 素材添付 → 品質解析 → 承認 → 承認後にMock予約。
        実SNS接続・本番投稿は Production Readiness 承認まで無効です。
      </p>

      {/* 対話デモ: ドラフト作成 */}
      <div className="card" style={{ marginBottom: "0.6rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ fontSize: "0.78rem" }}>投稿先
            <select value={channel} onChange={(e) => setChannel(e.target.value as PostChannel)} style={{ marginLeft: 6 }}>
              {CHANNELS.map((c) => <option key={c} value={c}>{POST_CHANNEL_LABEL_JA[c]}</option>)}
            </select>
          </label>
          <label style={{ fontSize: "0.78rem" }}>
            <input type="checkbox" checked={textLocked} onChange={(e) => setTextLocked(e.target.checked)} /> テキストロック
          </label>
          <label style={{ fontSize: "0.78rem" }}>
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} /> 繰り返し投稿
          </label>
          {recurring && (
            <label style={{ fontSize: "0.78rem" }}>頻度
              <select value={frequency} onChange={(e) => setFrequency(e.target.value as PostFrequency)} style={{ marginLeft: 6 }}>
                {POST_FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.labelJa}</option>)}
              </select>
            </label>
          )}
          <label className="attach-btn" style={{ fontSize: "0.78rem" }}>
            📎 素材添付
            <input type="file" style={{ display: "none" }} onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? null)} />
          </label>
          {attachment && <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>添付: {attachment}(参照のみ)</span>}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={textLocked}
          rows={3}
          style={{ width: "100%", marginTop: "0.4rem", boxSizing: "border-box", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.4rem", fontSize: "0.8rem" }}
          placeholder="投稿本文…"
        />
        <div style={{ fontSize: "0.76rem", marginTop: "0.35rem" }}>
          <div><strong>解析</strong>: {analysis.analysisSummary}</div>
          <div style={{ color: textLocked ? "var(--text-muted)" : "var(--text)" }}>
            <strong>改稿提案</strong>: {textLocked ? "テキストロック中(改稿しません)" : analysis.recommendedRevision}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
          <button type="button" onClick={handleApprove} disabled={approved}>{approved ? "承認済み" : "承認する(Mock)"}</button>
          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", alignSelf: "center" }}>
            外部投稿: {EXTERNAL_POSTING_ENABLED ? "有効" : "無効(承認まで)"}
          </span>
        </div>
        {note && <p style={{ color: "#22C55E", fontSize: "0.78rem", margin: "0.35rem 0 0" }}>✓ {note}</p>}
        {scheduled.length > 0 && (
          <div style={{ marginTop: "0.4rem", fontSize: "0.76rem" }}>
            <strong>予約レコード(Mock)</strong>: {scheduled.map((s) => s.label).join(" / ")}
          </div>
        )}
      </div>

      {/* 既存の投稿レポート一覧(標準フォーマット) */}
      <h4 style={{ marginBottom: "0.3rem" }}>投稿レポート一覧(標準フォーマット)</h4>
      {MARKETING_POSTS.map((p) => (
        <div key={p.id} className="card" style={{ marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <strong>{p.campaignName}</strong>
            <span className="badge" style={{ fontSize: "0.66rem" }}>{POST_CHANNEL_LABEL_JA[p.targetChannel]}</span>
            <span className="badge" style={{ fontSize: "0.66rem" }}>{POST_APPROVAL_LABEL_JA[p.approvalStatus]}</span>
            {p.textLocked && <span className="badge" style={{ fontSize: "0.66rem" }}>🔒 ロック</span>}
            {p.recurringEnabled && <span className="badge" style={{ fontSize: "0.66rem" }}>繰り返し {POST_FREQUENCIES.find((f) => f.value === p.frequency)?.labelJa}</span>}
          </div>
          <div style={{ fontSize: "0.78rem", margin: "0.2rem 0" }}>{p.draftText}</div>
          <dl className="secretary-fields" style={{ margin: 0 }}>
            <div><dt>添付</dt><dd>{p.attachmentSummary}</dd></div>
            <div><dt>解析</dt><dd>{p.analysisSummary}</dd></div>
            <div><dt>改稿提案</dt><dd>{p.recommendedRevision}</dd></div>
            <div><dt>次アクション</dt><dd>{p.nextAction}</dd></div>
            <div><dt>改訂履歴</dt><dd>{p.revisionHistory.join(" → ")}</dd></div>
          </dl>
        </div>
      ))}
    </section>
  );
}
