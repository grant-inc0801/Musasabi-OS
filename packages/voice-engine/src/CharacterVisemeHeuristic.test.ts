import { test } from "node:test";
import * as assert from "node:assert/strict";
import { charToViseme } from "./CharacterVisemeHeuristic";

test("maps hiragana vowel rows to the correct viseme", () => {
  assert.equal(charToViseme("あ"), "A");
  assert.equal(charToViseme("き"), "I");
  assert.equal(charToViseme("す"), "U");
  assert.equal(charToViseme("て"), "E");
  assert.equal(charToViseme("も"), "O");
});

test("maps katakana to the same viseme as its hiragana equivalent", () => {
  assert.equal(charToViseme("ア"), "A");
  assert.equal(charToViseme("キ"), "I");
  assert.equal(charToViseme("ス"), "U");
});

test("maps ん to closed", () => {
  assert.equal(charToViseme("ん"), "closed");
});

test("maps unmapped characters (punctuation, kanji) to closed", () => {
  assert.equal(charToViseme("、"), "closed");
  assert.equal(charToViseme("私"), "closed");
});
