import type { SttProvider, SttSession, TranscriptChunk } from "./types";

const MS_PER_CHUNK = 500;

/**
 * 実際の音声認識は行わず、あらかじめ与えたトランスクリプトを音声チャンク受信に
 * 合わせて段階的に(擬似的にストリーミングで)返す決定的なSTTプロバイダ。
 * ユニットテスト・オフライン開発用(docs/ARCHITECTURE.md Phase 7)。
 */
class MockSttSession implements SttSession {
  private chunksReceived = 0;
  private stopped = false;

  constructor(
    private readonly fullTranscript: string,
    private readonly chunksToComplete: number,
    private readonly onTranscript: (chunk: TranscriptChunk) => void,
  ) {}

  pushAudio(_chunk: Buffer): void {
    if (this.stopped) {
      return;
    }
    this.chunksReceived += 1;
    const progress = Math.min(1, this.chunksReceived / this.chunksToComplete);
    const charCount = Math.round(Array.from(this.fullTranscript).length * progress);
    const text = Array.from(this.fullTranscript).slice(0, charCount).join("");
    this.onTranscript({
      text,
      isFinal: progress >= 1,
      timestampMs: this.chunksReceived * MS_PER_CHUNK,
    });
  }

  stop(): void {
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    this.onTranscript({
      text: this.fullTranscript,
      isFinal: true,
      timestampMs: (this.chunksReceived + 1) * MS_PER_CHUNK,
    });
  }
}

export class MockSttProvider implements SttProvider {
  constructor(
    private readonly fullTranscript: string,
    private readonly chunksToComplete = 5,
  ) {}

  startStreaming(onTranscript: (chunk: TranscriptChunk) => void): SttSession {
    return new MockSttSession(this.fullTranscript, this.chunksToComplete, onTranscript);
  }
}
