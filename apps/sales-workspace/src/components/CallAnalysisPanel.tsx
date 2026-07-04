import type { CallAnalysisSummary } from "@musasabi/voice-analysis";

const SENTIMENT_LABEL: Record<CallAnalysisSummary["overallSentiment"], string> = {
  positive: "良好",
  neutral: "中立",
  negative: "要注意",
};

export function CallAnalysisPanel({ summary }: { summary: CallAnalysisSummary | null }) {
  return (
    <section aria-label="通話分析">
      <h2>通話分析(Voice Analysis)</h2>
      {summary ? (
        <div>
          <p>総合感情: {SENTIMENT_LABEL[summary.overallSentiment]}</p>
          <p>{summary.summary}</p>
        </div>
      ) : (
        <p>「デモ通話を分析」を実行すると結果がここに表示されます。</p>
      )}
    </section>
  );
}
