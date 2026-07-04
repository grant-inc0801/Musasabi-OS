import type { AvatarState } from "@musasabi/avatar-2d";
import { filemaker } from "@musasabi/integrations";
import type { Lead } from "@musasabi/ai-core";
import { generateCallSummary } from "@musasabi/voice-analysis";
import type { CallAnalysisSummary, TranscriptSegment } from "@musasabi/voice-analysis";
import { MockTtsProvider } from "@musasabi/voice-engine";
import type { TtsResult } from "@musasabi/voice-engine";

// Phase 8: 個別に実装済みの各エンジンを実際に配線するオーケストレーション層。
// FileMaker/Zoom Phoneは実サーバーが無いためMockアダプタを使う(docs/ARCHITECTURE.md Phase 8)。

const fileMakerAdapter = new filemaker.MockFileMakerAdapter();
fileMakerAdapter.seed("Leads", [
  { Name: "田中太郎", Company: "株式会社アクメ", Status: "New", PriorityScore: 85 },
  { Name: "佐藤花子", Company: "サンプル商事", Status: "Negotiating", PriorityScore: 70 },
  { Name: "鈴木一郎", Company: "テスト工業", Status: "Interested", PriorityScore: 55 },
]);

export async function getSeededLeads(): Promise<Lead[]> {
  const records = await fileMakerAdapter.find({ layout: "Leads", query: [] });
  return records.map((record) => filemaker.fromFileMakerRecord(record));
}

const SAMPLE_TRANSCRIPT: TranscriptSegment[] = [
  { speaker: "rep", text: "本日はお時間をいただきありがとうございます", timestampMs: 0, durationMs: 4000 },
  { speaker: "customer", text: "少し予算的に高いですね", timestampMs: 4000, durationMs: 3000 },
  { speaker: "rep", text: "他社の事例もご案内しながら検討します", timestampMs: 7000, durationMs: 3000 },
  { speaker: "customer", text: "興味があります、進めてください", timestampMs: 10000, durationMs: 3000 },
];

/**
 * Voice Analysis(Phase 6)の動作をアプリ内で確認するためのデモ。
 * サンプル通話トランスクリプトを解析し、感情に応じたアバター状態を返す。
 */
export function runDemoCallAnalysis(): { summary: CallAnalysisSummary; avatarState: AvatarState } {
  const summary = generateCallSummary("demo-call-001", SAMPLE_TRANSCRIPT);
  const avatarState: AvatarState =
    summary.overallSentiment === "positive"
      ? "goal_achieved"
      : summary.overallSentiment === "negative"
        ? "preparing_call"
        : "working";
  return { summary, avatarState };
}

const ttsProvider = new MockTtsProvider();

/**
 * Voice Engine(Phase 7)のTTS/visemeパイプラインをアプリ内で確認するためのデモ。
 */
export async function synthesizeCoachingMessage(text: string): Promise<TtsResult> {
  return ttsProvider.synthesize(text);
}
