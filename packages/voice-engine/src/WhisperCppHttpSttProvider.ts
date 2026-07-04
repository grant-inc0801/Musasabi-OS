import type { SttProvider, SttSession, TranscriptChunk } from "./types";

/**
 * whisper.cpp のHTTPサーバーモード(既定 http://localhost:8080)向けSTTプロバイダ。
 *
 * whisper.cppの `/inference` はバッチAPI(音声全体を送って結果を1回で受け取る)であり、
 * 真のストリーミング(逐次interim結果)には対応していない。そのため、このプロバイダは
 * `pushAudio` で受け取ったチャンクを蓄積し、`stop()` 呼び出し時にまとめて送信、
 * 最終結果(isFinal: true)のみを返す。逐次interim結果が必要な場合は、Azure Speech /
 * Google STT等のストリーミング対応APIへの切り替えが別途必要
 * (docs/ARCHITECTURE.md Phase 7)。実エンジンが起動していないこの開発環境では
 * 接続を検証できていない。
 */
class WhisperCppHttpSttSession implements SttSession {
  private readonly chunks: Buffer[] = [];
  private stopped = false;

  constructor(
    private readonly baseUrl: string,
    private readonly onTranscript: (chunk: TranscriptChunk) => void,
    private readonly onError: (error: unknown) => void,
  ) {}

  pushAudio(chunk: Buffer): void {
    if (this.stopped) {
      return;
    }
    this.chunks.push(chunk);
  }

  stop(): void {
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    // stop()はSttSessionインターフェース上同期メソッドのため、flush()の失敗を
    // 呼び出し元に投げ返せない。catchせずvoidで投げ捨てるとuncaught rejectionで
    // プロセス全体が落ちるため、onErrorへ回して握りつぶす。
    this.flush().catch((error) => this.onError(error));
  }

  private async flush(): Promise<void> {
    const audio = Buffer.concat(this.chunks);
    const form = new FormData();
    form.append("file", new Blob([audio]), "audio.wav");

    const res = await fetch(`${this.baseUrl}/inference`, { method: "POST", body: form });
    if (!res.ok) {
      throw new Error(`whisper.cpp inference failed: HTTP ${res.status}`);
    }
    const body = (await res.json()) as { text: string };
    this.onTranscript({ text: body.text, isFinal: true, timestampMs: Date.now() });
  }
}

export class WhisperCppHttpSttProvider implements SttProvider {
  constructor(
    private readonly baseUrl: string = "http://localhost:8080",
    private readonly onError: (error: unknown) => void = (error) =>
      console.error("[WhisperCppHttpSttProvider] transcription failed:", error),
  ) {}

  startStreaming(onTranscript: (chunk: TranscriptChunk) => void): SttSession {
    return new WhisperCppHttpSttSession(this.baseUrl, onTranscript, this.onError);
  }
}
