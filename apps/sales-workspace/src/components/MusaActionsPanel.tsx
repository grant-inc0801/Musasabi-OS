import { useState } from "react";
import type { CallAnalysisSummary } from "@musasabi/voice-analysis";

const COACHING_MESSAGE = "本日もよろしくお願いします。優先リードから架電しましょう。";

export function MusaActionsPanel({
  onCallAnalysisComplete,
}: {
  onCallAnalysisComplete: (summary: CallAnalysisSummary) => void;
}) {
  const [speechResult, setSpeechResult] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const musasabi = window.musasabi;

  async function handleRunDemoCallAnalysis(): Promise<void> {
    if (!musasabi) return;
    setIsBusy(true);
    try {
      const summary = await musasabi.runDemoCallAnalysis();
      onCallAnalysisComplete(summary);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSpeak(): Promise<void> {
    if (!musasabi) return;
    setIsBusy(true);
    try {
      const result = await musasabi.speakCoachingMessage(COACHING_MESSAGE);
      setSpeechResult(`再生時間: ${result.durationMs}ms / viseme数: ${result.visemeCount}`);
    } finally {
      setIsBusy(false);
    }
  }

  if (!musasabi) {
    return (
      <section aria-label="MUSAアクション">
        <h2>MUSAアクション</h2>
        <p>デスクトップアプリ外で表示されているため、デモアクションは利用できません。</p>
      </section>
    );
  }

  return (
    <section aria-label="MUSAアクション">
      <h2>MUSAアクション</h2>
      <button type="button" onClick={handleRunDemoCallAnalysis} disabled={isBusy}>
        デモ通話を分析
      </button>{" "}
      <button type="button" onClick={handleSpeak} disabled={isBusy}>
        MUSAに一言話してもらう
      </button>
      {speechResult && <p>{speechResult}</p>}
    </section>
  );
}
