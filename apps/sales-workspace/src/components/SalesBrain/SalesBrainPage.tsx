import { useState } from "react";
import {
  SharedTalkKnowledge,
  TALK_FEEDBACK_CATEGORY_LABEL_JA,
} from "@musasabi/call-training";
import type { TalkFeedbackCategory } from "@musasabi/call-training";

// Sales Brain / 学習データ画面(D-20260706-002 β版に含める画面6)。
// 全AI社員共通のトーク改善ナレッジ(call-training の SharedTalkKnowledge)と、
// Learning Mode の学習データソースを表示する。現フェーズはすべて Mock データで、
// 実データ接続・永続化は Pending(次フェーズ)。

// β評価用のMockナレッジ。テストモードで蓄積される指摘の代表例を決定論的に投入する。
function buildMockKnowledge(): SharedTalkKnowledge {
  const knowledge = new SharedTalkKnowledge();
  const seed: Array<{ category: TalkFeedbackCategory; comment: string; sessionId: string }> = [
    { category: "tone", comment: "第一声はもう少し明るいトーンで名乗る", sessionId: "mock-session-1" },
    { category: "tone", comment: "早口になりがち。要点の前で一拍おく", sessionId: "mock-session-2" },
    { category: "rebuttal", comment: "「高い」への切り返しは事例→数値の順で", sessionId: "mock-session-1" },
    { category: "rebuttal", comment: "「忙しい」には3分で要点を伝える提案を返す", sessionId: "mock-session-3" },
    { category: "script", comment: "冒頭の会社紹介を1文に短縮する", sessionId: "mock-session-2" },
    { category: "other", comment: "終話時に次回アクションを必ず確認する", sessionId: "mock-session-3" },
  ];
  seed.forEach((s, i) => {
    knowledge.ingestFeedback(
      { id: `mock-fb-${i + 1}`, turnIndex: null, comment: s.comment, category: s.category, timestampMs: i },
      s.sessionId,
    );
  });
  return knowledge;
}

const knowledge = buildMockKnowledge();

// Learning Mode の学習データソース(Mock)。実データ取り込みは次フェーズ。
const LEARNING_SOURCES: Array<{ name: string; status: "mock" | "pending"; note: string }> = [
  { name: "人間の営業トーク(録音・書き起こし)", status: "pending", note: "実音声接続 Pending" },
  { name: "過去の架電履歴(FileMaker)", status: "pending", note: "実DB接続 Pending(Mockアダプタのみ)" },
  { name: "テストモードの会話ログ", status: "mock", note: "Mock架電で蓄積(永続化は次フェーズ)" },
  { name: "テストモードの指摘(トーク修正)", status: "mock", note: "下記の共通ナレッジへ反映" },
  { name: "成功・失敗パターン集", status: "pending", note: "実運用データ待ち" },
];

const CATEGORY_ORDER: TalkFeedbackCategory[] = ["tone", "rebuttal", "script", "other"];

export function SalesBrainPage() {
  const [filter, setFilter] = useState<TalkFeedbackCategory | "all">("all");
  const counts = knowledge.countByCategory();
  const entries = filter === "all" ? knowledge.getEntries() : knowledge.getEntries(filter);

  return (
    <section aria-label="Sales Brain">
      <h2>Sales Brain / 学習データ</h2>
      <p style={{ color: "#f0883e", fontSize: "0.9rem", maxWidth: "44rem" }}>
        現フェーズは Mock データによる表示のみです。実データの取り込み・永続化・実API接続は
        行いません(Pending)。
      </p>

      <h3>学習データソース(Learning Mode)</h3>
      <table style={{ borderCollapse: "collapse", marginBottom: "1.5rem" }}>
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
              <td style={cellStyle}>{s.status === "mock" ? "Mock稼働" : "準備中"}</td>
              <td style={cellStyle}>{s.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>全AI社員共通トーク改善ナレッジ(計{knowledge.size}件)</h3>
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
            <span style={{ color: "#7d8598", fontSize: "0.8rem" }}>(出典: {entry.sourceSessionId})</span>
          </li>
        ))}
      </ul>
      <p style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>
        テストモードで追加した指摘はこのナレッジへ集約される設計です(全AI社員で共通)。
        永続化(ローカルJSON/SQLite)は次フェーズで実装します。
      </p>
    </section>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #2d3650",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
