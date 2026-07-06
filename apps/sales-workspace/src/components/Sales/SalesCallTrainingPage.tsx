import { useState } from "react";
import type { CallAnalysisSummary } from "@musasabi/voice-analysis";
import { CallTrainingPage } from "../CallTraining/CallTrainingPage";
import { MusaActionsPanel } from "../MusaActionsPanel";
import { CallAnalysisPanel } from "../CallAnalysisPanel";

// 営業部 > コールトレーニング ページ(ユーザーFB)。
// 三段階コールシステム(Learning/Test/AutoCall)と通話分析デモをまとめる。

export function SalesCallTrainingPage() {
  const [callAnalysis, setCallAnalysis] = useState<CallAnalysisSummary | null>(null);
  return (
    <>
      <CallTrainingPage />
      <MusaActionsPanel onCallAnalysisComplete={setCallAnalysis} />
      <CallAnalysisPanel summary={callAnalysis} />
    </>
  );
}
