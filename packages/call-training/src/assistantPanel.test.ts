import { test } from "node:test";
import * as assert from "node:assert/strict";
import {
  createAssistantPanelState,
  togglePanel,
  switchMode,
  sendChat,
  dismissBubble,
  showBubble,
  MODE_SUGGESTION_JA,
} from "./assistantPanel";

test("initial state is closed with the default mode's suggestion bubble", () => {
  const s = createAssistantPanelState("test");
  assert.equal(s.panelOpen, false);
  assert.equal(s.mode, "test");
  assert.equal(s.bubble, MODE_SUGGESTION_JA.test);
});

test("togglePanel opens and closes the mini panel", () => {
  const s0 = createAssistantPanelState();
  const s1 = togglePanel(s0);
  assert.equal(s1.panelOpen, true);
  assert.equal(togglePanel(s1).panelOpen, false);
});

test("switchMode to autocall shows the approval-pending bubble", () => {
  const s = switchMode(createAssistantPanelState("learning"), "autocall");
  assert.equal(s.mode, "autocall");
  assert.equal(s.bubble, "AutoCallは承認待ちです");
});

test("sendChat appends the user message and a deterministic reply", () => {
  const s = sendChat(createAssistantPanelState(), "テストの練習がしたい", 100);
  assert.equal(s.chat.length, 2);
  assert.equal(s.chat[0].speaker, "user");
  assert.equal(s.chat[1].speaker, "musa");
  assert.match(s.chat[1].text, /テストモード/);
});

test("sendChat about autocall warns that production calls are pending approval", () => {
  const s = sendChat(createAssistantPanelState(), "オートコールを開始して", 100);
  assert.match(s.chat[1].text, /承認待ち/);
});

test("sendChat ignores empty input", () => {
  const s0 = createAssistantPanelState();
  assert.equal(sendChat(s0, "   ", 100), s0);
});

test("bubble can be shown and dismissed", () => {
  const s0 = createAssistantPanelState();
  const s1 = showBubble(s0, "Learning内容をSales Brainへ反映しました");
  assert.equal(s1.bubble, "Learning内容をSales Brainへ反映しました");
  assert.equal(dismissBubble(s1).bubble, null);
});

test("state updates are immutable", () => {
  const s0 = createAssistantPanelState();
  const s1 = sendChat(s0, "こんにちは", 1);
  assert.equal(s0.chat.length, 0);
  assert.equal(s1.chat.length, 2);
});
