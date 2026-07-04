import type { Viseme, VisemeShape } from "./types";

// VOICEVOX Engine の /audio_query レスポンス形式(必要な部分のみ)。
export interface VoicevoxMora {
  text: string;
  consonant?: string;
  consonant_length?: number;
  vowel: string;
  vowel_length: number;
}

export interface VoicevoxAccentPhrase {
  moras: VoicevoxMora[];
  pause_mora?: VoicevoxMora | null;
}

export interface VoicevoxAudioQuery {
  accent_phrases: VoicevoxAccentPhrase[];
  prePhonemeLength?: number;
  postPhonemeLength?: number;
}

const VOWEL_TO_VISEME: Record<string, VisemeShape> = {
  a: "A",
  i: "I",
  u: "U",
  e: "E",
  o: "O",
  N: "closed",
  cl: "closed",
  pau: "closed",
};

function vowelToViseme(vowel: string): VisemeShape {
  return VOWEL_TO_VISEME[vowel] ?? "closed";
}

/**
 * VOICEVOXのaudio_queryが持つ音素タイミング(モーラごとの子音長・母音長)から、
 * リップシンク用のvisemeタイムラインを構築する。ネットワーク呼び出しを含まない
 * 純粋関数なので、実VOICEVOXエンジンが無い環境でもテストできる。
 */
export function buildVisemesFromAudioQuery(query: VoicevoxAudioQuery): {
  visemes: Viseme[];
  durationMs: number;
} {
  const visemes: Viseme[] = [];
  let timeSeconds = query.prePhonemeLength ?? 0;

  for (const phrase of query.accent_phrases) {
    for (const mora of phrase.moras) {
      timeSeconds += mora.consonant_length ?? 0;
      visemes.push({ timeMs: Math.round(timeSeconds * 1000), shape: vowelToViseme(mora.vowel) });
      timeSeconds += mora.vowel_length;
    }
    if (phrase.pause_mora) {
      visemes.push({ timeMs: Math.round(timeSeconds * 1000), shape: "closed" });
      timeSeconds += phrase.pause_mora.vowel_length;
    }
  }

  timeSeconds += query.postPhonemeLength ?? 0;
  return { visemes, durationMs: Math.round(timeSeconds * 1000) };
}
