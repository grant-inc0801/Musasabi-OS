import type { Speaker, TranscriptSegment } from "./types";

/**
 * `@musasabi/voice-engine` の `TranscriptChunk` と構造的に互換な最小限の入力型。
 * voice-analysis は voice-engine に直接依存しない(疎結合、Development Bible
 * 第10章)。話者(`speaker`)はチャネル分離など呼び出し側で既知の情報として付与する。
 */
export interface DiarizedTranscriptChunk {
  speaker: Speaker;
  text: string;
  isFinal: boolean;
  /** このチャンクが確定した(認識が完了した)時点の、両チャネル共有の通話タイムライン上の時刻。 */
  timestampMs: number;
}

// packages/voice-engine の MockTtsProvider と同じ概算値(1文字あたりの発話時間)。
// STTプロバイダから実際の発話時間(開始〜終了)は取得できないため、文字数から
// 決定論的に見積もる。
const MS_PER_CHARACTER = 120;

/**
 * チャネルごとに話者が既知の場合の決定論的な話者分離ブリッジ(Issue #182)。
 * Zoom Phoneの発信/着信チャネル分離のように、担当者と顧客の音声が別ストリームで
 * 得られることを前提とし、声紋推定等のLLM/ML的な手法は使わない
 * (Development Bible: 「Deterministic behavior before LLM behavior」)。
 *
 * 各チャネルのSTTストリームから確定(`isFinal: true`)したチャンクだけを1件の
 * `TranscriptSegment` として採用する。両チャネルの `timestampMs` は共有の通話
 * タイムライン上の時刻(=このチャンクの認識が完了した時刻)であるという前提のもと、
 * 発話の終了時刻をそのまま使い、開始時刻は文字数ベースの見積もり時間だけ遡って
 * 算出する。これにより、異なる話者の発話同士も実際の発生順に並べ替えられる
 * (話者ごとに独立してゼロから数える設計だと、両者の最初の発話が常に同時刻(0ms)
 * 扱いになり、実際の発生順を失ってしまう)。
 */
export class DiarizationBridge {
  private readonly segments: TranscriptSegment[] = [];

  push(chunk: DiarizedTranscriptChunk): void {
    if (!chunk.isFinal || chunk.text.length === 0) {
      return;
    }
    const estimatedDurationMs = Array.from(chunk.text).length * MS_PER_CHARACTER;
    const endMs = chunk.timestampMs;
    const startMs = Math.max(0, endMs - estimatedDurationMs);
    this.segments.push({
      speaker: chunk.speaker,
      text: chunk.text,
      timestampMs: startMs,
      durationMs: endMs - startMs,
    });
  }

  /** これまでに確定した発話を、実際に発生した時刻(timestampMs)の昇順で返す。 */
  toTranscriptSegments(): TranscriptSegment[] {
    return [...this.segments].sort((a, b) => a.timestampMs - b.timestampMs);
  }
}
