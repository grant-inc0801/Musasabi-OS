import type { VisemeShape } from "./types";

// 日本語の母音ベースの簡易viseme対応表(ひらがな)。カタカナはひらがなに変換して引く。
// 実際の音素タイミングはVoicevoxTtsProviderが audio_query から取得するため、
// これはMockTtsProvider専用の決定的な近似ヒューリスティックに過ぎない。
const VOWEL_TABLE: Record<string, VisemeShape> = {
  あ: "A", か: "A", さ: "A", た: "A", な: "A", は: "A", ま: "A", や: "A", ら: "A", わ: "A",
  が: "A", ざ: "A", だ: "A", ば: "A", ぱ: "A",
  い: "I", き: "I", し: "I", ち: "I", に: "I", ひ: "I", み: "I", り: "I",
  ぎ: "I", じ: "I", ぢ: "I", び: "I", ぴ: "I",
  う: "U", く: "U", す: "U", つ: "U", ぬ: "U", ふ: "U", む: "U", ゆ: "U", る: "U",
  ぐ: "U", ず: "U", づ: "U", ぶ: "U", ぷ: "U",
  え: "E", け: "E", せ: "E", て: "E", ね: "E", へ: "E", め: "E", れ: "E",
  げ: "E", ぜ: "E", で: "E", べ: "E", ぺ: "E",
  お: "O", こ: "O", そ: "O", と: "O", の: "O", ほ: "O", も: "O", よ: "O", ろ: "O", を: "O",
  ご: "O", ぞ: "O", ど: "O", ぼ: "O", ぽ: "O",
  ん: "closed",
};

function toHiragana(char: string): string {
  const code = char.codePointAt(0);
  if (code === undefined) {
    return char;
  }
  // カタカナ(U+30A1-U+30F6)はひらがなと同じ順序で並んでいるため、固定オフセットで変換できる。
  if (code >= 0x30a1 && code <= 0x30f6) {
    return String.fromCodePoint(code - 0x60);
  }
  return char;
}

export function charToViseme(char: string): VisemeShape {
  return VOWEL_TABLE[toHiragana(char)] ?? "closed";
}
