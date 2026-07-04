// Voice Engine(TTS/STT)の型定義。Development Bible 第10章を参照。

export type VisemeShape = "closed" | "A" | "I" | "U" | "E" | "O";

export interface Viseme {
  timeMs: number;
  shape: VisemeShape;
}

export interface TtsResult {
  /** 合成音声データ。プロバイダ依存のフォーマット(VOICEVOXはWAV)。 */
  audio: Buffer;
  durationMs: number;
  /** packages/avatar-2d / avatar-3d のリップシンクに使うタイミングデータ。 */
  visemes: Viseme[];
}

export interface TtsProvider {
  synthesize(text: string): Promise<TtsResult>;
}

export interface TranscriptChunk {
  text: string;
  isFinal: boolean;
  timestampMs: number;
}

export interface SttSession {
  pushAudio(chunk: Buffer): void;
  stop(): void;
}

export interface SttProvider {
  startStreaming(onTranscript: (chunk: TranscriptChunk) => void): SttSession;
}
