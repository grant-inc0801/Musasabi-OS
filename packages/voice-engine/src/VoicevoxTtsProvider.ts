import { buildVisemesFromAudioQuery, type VoicevoxAudioQuery } from "./VoicevoxAudioQueryVisemes";
import type { TtsProvider, TtsResult } from "./types";

/**
 * VOICEVOX Engine(ローカルHTTPサーバー、既定 http://localhost:50021)向けTTSプロバイダ。
 * 実エンジンが起動していないこの開発環境では接続を検証できていない
 * (docs/ARCHITECTURE.md Phase 7)。音素タイミング→viseme変換ロジックは
 * VoicevoxAudioQueryVisemes.ts で純粋関数として切り出し、そちらは単体テスト済み。
 */
export class VoicevoxTtsProvider implements TtsProvider {
  constructor(
    private readonly baseUrl: string = "http://localhost:50021",
    private readonly speakerId: number = 1,
  ) {}

  async synthesize(text: string): Promise<TtsResult> {
    const queryParams = new URLSearchParams({ text, speaker: String(this.speakerId) });
    const queryRes = await fetch(`${this.baseUrl}/audio_query?${queryParams.toString()}`, { method: "POST" });
    if (!queryRes.ok) {
      throw new Error(`VOICEVOX audio_query failed: HTTP ${queryRes.status}`);
    }
    const audioQuery = (await queryRes.json()) as VoicevoxAudioQuery;

    const synthesisRes = await fetch(`${this.baseUrl}/synthesis?speaker=${this.speakerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(audioQuery),
    });
    if (!synthesisRes.ok) {
      throw new Error(`VOICEVOX synthesis failed: HTTP ${synthesisRes.status}`);
    }
    const audio = Buffer.from(await synthesisRes.arrayBuffer());

    const { visemes, durationMs } = buildVisemesFromAudioQuery(audioQuery);
    return { audio, durationMs, visemes };
  }
}
