import { charToViseme } from "./CharacterVisemeHeuristic";
import type { TtsProvider, TtsResult, Viseme } from "./types";

const MS_PER_CHARACTER = 120;

/**
 * 音声を実際には合成しない決定的なTTSプロバイダ。無音バッファと文字ベースの
 * viseme近似を返す。ユニットテスト・オフライン開発用(docs/ARCHITECTURE.md Phase 7)。
 */
export class MockTtsProvider implements TtsProvider {
  async synthesize(text: string): Promise<TtsResult> {
    const characters = Array.from(text);
    const visemes: Viseme[] = characters.map((char, index) => ({
      timeMs: index * MS_PER_CHARACTER,
      shape: charToViseme(char),
    }));

    return {
      audio: Buffer.alloc(0),
      durationMs: characters.length * MS_PER_CHARACTER,
      visemes,
    };
  }
}
