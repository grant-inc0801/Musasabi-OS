import { test } from "node:test";
import * as assert from "node:assert/strict";
import { buildVisemesFromAudioQuery } from "./VoicevoxAudioQueryVisemes";
import type { VoicevoxAudioQuery } from "./VoicevoxAudioQueryVisemes";

test("builds a viseme timeline from mora consonant/vowel lengths", () => {
  const query: VoicevoxAudioQuery = {
    prePhonemeLength: 0.1,
    postPhonemeLength: 0.1,
    accent_phrases: [
      {
        moras: [
          { text: "コ", consonant: "k", consonant_length: 0.05, vowel: "o", vowel_length: 0.1 },
          { text: "レ", consonant: "r", consonant_length: 0.03, vowel: "e", vowel_length: 0.1 },
        ],
      },
    ],
  };

  const { visemes, durationMs } = buildVisemesFromAudioQuery(query);

  assert.deepEqual(visemes, [
    { timeMs: 150, shape: "O" },
    { timeMs: 280, shape: "E" },
  ]);
  assert.equal(durationMs, 480);
});

test("inserts a closed viseme for a pause between accent phrases", () => {
  const query: VoicevoxAudioQuery = {
    accent_phrases: [
      {
        moras: [{ text: "ア", vowel: "a", vowel_length: 0.1 }],
        pause_mora: { text: "、", vowel: "pau", vowel_length: 0.2 },
      },
      { moras: [{ text: "イ", vowel: "i", vowel_length: 0.1 }] },
    ],
  };

  const { visemes } = buildVisemesFromAudioQuery(query);

  assert.deepEqual(visemes, [
    { timeMs: 0, shape: "A" },
    { timeMs: 100, shape: "closed" },
    { timeMs: 300, shape: "I" },
  ]);
});

test("maps N and cl (mora-final nasal / geminate) to closed", () => {
  const query: VoicevoxAudioQuery = {
    accent_phrases: [{ moras: [{ text: "ン", vowel: "N", vowel_length: 0.1 }] }],
  };
  const { visemes } = buildVisemesFromAudioQuery(query);
  assert.equal(visemes[0].shape, "closed");
});

test("handles an empty query without throwing", () => {
  const { visemes, durationMs } = buildVisemesFromAudioQuery({ accent_phrases: [] });
  assert.deepEqual(visemes, []);
  assert.equal(durationMs, 0);
});
