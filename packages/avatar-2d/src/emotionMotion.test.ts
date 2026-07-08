import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AVATAR_EMOTIONS,
  emotionMotionMap,
  EMOTION_LABEL_JA,
  isAvatarEmotion,
  resolveFallback,
  EmotionStateManager,
  deriveEmotionFromSignals,
  type Scheduler,
  type AvatarEmotion,
} from "./emotionMotion";

/** テスト用の手動タイマー。 */
function makeFakeScheduler() {
  let seq = 1;
  const timers = new Map<number, { fire: () => void; ms: number }>();
  const scheduler: Scheduler = {
    setTimeout(handler, ms) {
      const id = seq++;
      timers.set(id, { fire: handler, ms });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
  };
  return {
    scheduler,
    /** 保留中のタイマーをすべて発火する(1段のみ)。 */
    flush() {
      const pending = [...timers.entries()];
      timers.clear();
      for (const [, t] of pending) t.fire();
    },
    pendingCount: () => timers.size,
  };
}

test("14種のステートが定義されている", () => {
  assert.equal(AVATAR_EMOTIONS.length, 14);
  for (const e of AVATAR_EMOTIONS) {
    assert.ok(emotionMotionMap[e], `${e} のマップが必要`);
    assert.ok(EMOTION_LABEL_JA[e], `${e} のラベルが必要`);
  }
});

test("各ステートは expression/motion/duration/loop/fallback を持つ", () => {
  for (const e of AVATAR_EMOTIONS) {
    const m = emotionMotionMap[e];
    assert.equal(typeof m.expression, "string");
    assert.equal(typeof m.motion, "string");
    assert.ok(m.duration === null || typeof m.duration === "number");
    assert.equal(typeof m.loop, "boolean");
    assert.ok(m.fallback === null || isAvatarEmotion(m.fallback));
  }
});

test("loop ステートは duration=null、非loop は duration>0", () => {
  for (const e of AVATAR_EMOTIONS) {
    const m = emotionMotionMap[e];
    if (m.loop) assert.equal(m.duration, null, `${e} loopはduration null`);
    else assert.ok((m.duration ?? 0) > 0, `${e} 非loopはduration>0`);
  }
});

test("resolveFallback は未指定を idle にする", () => {
  assert.equal(resolveFallback("idle"), "idle"); // fallback null → idle
  assert.equal(resolveFallback("error"), "worried");
  assert.equal(resolveFallback("thinking"), "idle");
});

test("setEmotion で任意ステートへ切り替わる", () => {
  const mgr = new EmotionStateManager();
  assert.equal(mgr.getCurrent(), "idle");
  mgr.setEmotion("working");
  assert.equal(mgr.getCurrent(), "working");
  assert.equal(mgr.getCurrentMotion().motion, "typing_or_processing");
});

test("不正なステートは例外", () => {
  const mgr = new EmotionStateManager();
  assert.throws(() => mgr.setEmotion("dancing" as AvatarEmotion), /Unknown avatar emotion/);
});

test("duration 付きステートは経過後に fallback へ自動復帰する", () => {
  const fake = makeFakeScheduler();
  const mgr = new EmotionStateManager(fake.scheduler);
  mgr.setEmotion("thinking");
  assert.equal(mgr.getCurrent(), "thinking");
  assert.equal(fake.pendingCount(), 1);
  fake.flush(); // thinking(2500ms)経過 → idle
  assert.equal(mgr.getCurrent(), "idle");
});

test("error は worried へ復帰する(多段fallback)", () => {
  const fake = makeFakeScheduler();
  const mgr = new EmotionStateManager(fake.scheduler);
  mgr.setEmotion("error");
  fake.flush(); // error → worried
  assert.equal(mgr.getCurrent(), "worried");
  fake.flush(); // worried(2000ms) → idle
  assert.equal(mgr.getCurrent(), "idle");
});

test("loop ステートは自動復帰せず継続する", () => {
  const fake = makeFakeScheduler();
  const mgr = new EmotionStateManager(fake.scheduler);
  mgr.setEmotion("working");
  assert.equal(fake.pendingCount(), 0); // タイマー無し
  fake.flush();
  assert.equal(mgr.getCurrent(), "working");
});

test("新しい setEmotion は保留中の自動復帰をキャンセルする", () => {
  const fake = makeFakeScheduler();
  const mgr = new EmotionStateManager(fake.scheduler);
  mgr.setEmotion("thinking");
  mgr.setEmotion("working"); // thinkingの復帰タイマーはキャンセル
  assert.equal(fake.pendingCount(), 0);
  fake.flush();
  assert.equal(mgr.getCurrent(), "working");
});

test("reset は idle へ戻す", () => {
  const mgr = new EmotionStateManager();
  mgr.setEmotion("happy");
  mgr.reset();
  assert.equal(mgr.getCurrent(), "idle");
});

test("deriveEmotionFromSignals は優先度に従って感情を選ぶ", () => {
  assert.equal(deriveEmotionFromSignals({ hasError: true, hasApproval: true }), "alert");
  assert.equal(deriveEmotionFromSignals({ hasApproval: true, hasWorking: true }), "approval_wait");
  assert.equal(deriveEmotionFromSignals({ hasWorking: true }), "working");
  assert.equal(deriveEmotionFromSignals({ allDone: true }), "happy");
  assert.equal(deriveEmotionFromSignals({}), "idle");
});

test("onChange は状態変化を通知し、解除できる", () => {
  const mgr = new EmotionStateManager(makeFakeScheduler().scheduler);
  const seen: AvatarEmotion[] = [];
  const off = mgr.onChange((s) => seen.push(s.emotion));
  mgr.setEmotion("listen");
  mgr.setEmotion("happy");
  off();
  mgr.setEmotion("idle");
  assert.deepEqual(seen, ["listen", "happy"]);
});
