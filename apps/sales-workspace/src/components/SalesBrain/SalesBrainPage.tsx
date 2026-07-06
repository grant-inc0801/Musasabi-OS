import { useState } from "react";
import {
  TALK_FEEDBACK_CATEGORY_LABEL_JA,
  knowledgeFromSessions,
  callLogStats,
} from "@musasabi/call-training";
import type { TalkFeedbackCategory, TestCallSession } from "@musasabi/call-training";
import { loadCallLog } from "../../lib/callLogStorage";
import { loadWorkLog } from "../../lib/workLogStorage";

// Sales Brain / 学習データ画面。テストモードで保存された会話ログ・指摘(この端末の
// ローカル履歴)から全AI社員共通のトーク改善ナレッジを構築して表示する。
// 手動学習(Learning Mode の作業ログ)も学習素材として集計する。外部送信はしない。

// Learning Mode の学習データソース。テストモード分はローカル保存で稼働中。
const LEARNING_SOURCES: Array<{ name: string; status: "active" | "pending"; note: string }> = [
  { name: "テストモードの会話ログ", status: "active", note: "この端末に自動保存(外部送信なし)" },
  { name: "テストモードの指摘(トーク修正)", status: "active", note: "下記の共通ナレッジへ反映" },
  { name: "日々の作業内容(手動学習)", status: "active", note: "Learning Mode で登録" },
  { name: "人間の営業トーク(録音・書き起こし)", status: "pending", note: "実音声接続 Pending" },
  { name: "過去の架電履歴(FileMaker)", status: "pending", note: "実DB接続 Pending(Mockアダプタのみ)" },
];

const CATEGORY_ORDER: TalkFeedbackCategory[] = ["tone", "rebuttal", "script", "other"];

export function SalesBrainPage() {
  const [filter, setFilter] = useState<TalkFeedbackCategory | "all">("all");
  // 表示のたびにローカル履歴から再構築する(テストモードの保存内容を即反映)。
  const [sessions] = useState<TestCallSession[]>(() => loadCallLog());
  const knowledge = knowledgeFromSessions(sessions);
  const stats = callLogStats(sessions);
  const workLogCount = loadWorkLog().length;
  const counts = knowledge.countByCategory();
  const entries = filter === "all" ? knowledge.getEntries() : knowledge.getEntries(filter);

  return (
    <>
      <section aria-label="学習データサマリー">
        <h3 style={{ marginTop: 0 }}>学習データサマリー(この端末)</h3>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <StatTile label="テストコール" value={`${stats.sessionCount}件`} />
          <StatTile label="うち完了" value={`${stats.completedCount}件`} />
          <StatTile label="会話ターン" value={`${stats.turnCount}件`} />
          <StatTile label="指摘" value={`${stats.feedbackCount}件`} />
          <StatTile label="手動学習" value={`${workLogCount}件`} />
        </div>
        <h4>学習データソース</h4>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["データソース", "状態", "備考"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEARNING_SOURCES.map((s) => (
              <tr key={s.name}>
                <td style={cellStyle}>{s.name}</td>
                <td style={cellStyle}>{s.status === "active" ? "稼働中(ローカル保存)" : "準備中"}</td>
                <td style={cellStyle}>{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="共通ナレッジ">
        <h3 style={{ marginTop: 0 }}>全AI社員共通トーク改善ナレッジ(計{knowledge.size}件)</h3>
        {knowledge.size === 0 ? (
          <p style={{ color: "#9aa3ba" }}>
            まだ指摘がありません。コールトレーニングのテストモードでテストコールを行い、
            「指摘を追加」すると、ここに全AI社員共通のナレッジとして蓄積されます。
          </p>
        ) : (
          <>
            <div style={{ marginBottom: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button type="button" onClick={() => setFilter("all")} disabled={filter === "all"}>
                すべて({knowledge.size})
              </button>
              {CATEGORY_ORDER.map((c) => (
                <button key={c} type="button" onClick={() => setFilter(c)} disabled={filter === c}>
                  {TALK_FEEDBACK_CATEGORY_LABEL_JA[c]}({counts[c]})
                </button>
              ))}
            </div>
            <ul>
              {entries.map((entry, i) => (
                <li key={i} style={{ margin: "0.3rem 0" }}>
                  <strong>[{TALK_FEEDBACK_CATEGORY_LABEL_JA[entry.category]}]</strong> {entry.comment}
                  <span style={{ color: "#7d8598", fontSize: "0.8rem" }}>
                    (出典: {entry.sourceSessionId})
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        <p style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>
          保存はこの端末内のみ(localStorage)。実DB接続・外部送信はしません。
        </p>
      </section>

      <section aria-label="テストコール履歴">
        <h3 style={{ marginTop: 0 }}>テストコール履歴(最新{Math.min(sessions.length, 20)}件)</h3>
        {sessions.length === 0 ? (
          <p style={{ color: "#9aa3ba" }}>まだテストコールの履歴がありません。</p>
        ) : (
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["日時", "連絡先(ダミー)", "状態", "ターン", "指摘"].map((h) => (
                  <th key={h} style={cellStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 20).map((s) => (
                <tr key={s.id}>
                  <td style={cellStyle}>{new Date(s.startedAtMs).toLocaleString("ja-JP")}</td>
                  <td style={cellStyle}>{s.contact}</td>
                  <td style={cellStyle}>{s.status === "completed" ? "完了" : "進行中"}</td>
                  <td style={cellStyle}>{s.turns.length}</td>
                  <td style={cellStyle}>{s.feedback.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>{label}</div>
      <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid rgba(151,168,205,0.16)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
