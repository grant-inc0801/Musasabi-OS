import { useEffect, useMemo, useRef, useState } from "react";
import {
  AVATAR_EMOTIONS,
  EMOTION_LABEL_JA,
  emotionMotionMap,
  EmotionStateManager,
  type AvatarEmotion,
  type EmotionMotion,
} from "@musasabi/avatar-2d";
import mascot from "../../assets/mascot.png";

// AV-MOTION-001 デバッグUI(Issue #272)。
// 感情ステートを14ボタンで切り替え、ムササビアバターの表情/モーションを
// CSS transform の簡易モーションで確認する。制御ロジック(EmotionStateManager)は
// @musasabi/avatar-2d の純ロジックを使用し、描画層はここに分離している。
// 将来 Three.js / VRM / GLB / Live2D へ差し替え可能。

export function AvatarMotionPage() {
  // duration 付きステートの自動復帰を確認できるよう、実タイマーで動かす。
  const manager = useMemo(() => new EmotionStateManager(), []);
  const [emotion, setEmotion] = useState<AvatarEmotion>(manager.getCurrent());
  const [history, setHistory] = useState<AvatarEmotion[]>(["idle"]);
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => {
    const off = manager.onChange((snap) => {
      setEmotion(snap.emotion);
      setHistory((prev) => [snap.emotion, ...prev].slice(0, 8));
    });
    return () => {
      off();
      manager.dispose();
    };
  }, [manager]);

  const motion: EmotionMotion = emotionMotionMap[emotion];

  return (
    <>
      <section aria-label="アバターモーション概要">
        <h2>アバター 感情モーション(AV-MOTION-001)</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          会話・処理・感情の状態に応じてムササビアバターの表情とモーションを切り替えます。
          duration 付きのステートは終了後に fallback へ自動復帰、ループステートは次の指定まで継続します。
          現在は CSS の簡易モーションで動作(将来 Three.js / VRM / GLB / Live2D へ差し替え可能)。
        </p>
      </section>

      <section aria-label="アバター表示" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div
          className="avatar-motion-stage"
          aria-label={`アバター表示: ${emotion}`}
        >
          <img
            src={mascot}
            alt="ムササビアバター"
            className="avatar-motion-mascot"
            data-motion={motion.motion}
            data-expression={motion.expression}
          />
        </div>

        <div style={{ minWidth: "18rem" }}>
          <h3 style={{ marginTop: 0 }}>現在のステート</h3>
          <dl className="avatar-motion-detail">
            <Row label="感情" value={`${EMOTION_LABEL_JA[emotion]}(${emotion})`} />
            <Row label="表情" value={motion.expression} />
            <Row label="モーション" value={motion.motion} />
            <Row label="継続時間" value={motion.duration === null ? "ループ" : `${motion.duration}ms`} />
            <Row label="ループ" value={motion.loop ? "はい" : "いいえ"} />
            <Row label="フォールバック" value={motion.fallback ?? "idle"} />
          </dl>
          <button type="button" onClick={() => manager.reset()} style={{ marginTop: "0.5rem" }}>
            idle へリセット
          </button>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
            遷移履歴: {history.join(" ← ")}
          </p>
        </div>
      </section>

      <section aria-label="感情ボタン">
        <h3>感情モーション切替(14ステート)</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", maxWidth: "48rem" }}>
          {AVATAR_EMOTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => manager.setEmotion(e)}
              aria-pressed={emotion === e}
              className={emotion === e ? "avatar-motion-btn is-active" : "avatar-motion-btn"}
              title={`${emotionMotionMap[e].expression} / ${emotionMotionMap[e].motion}`}
            >
              {EMOTION_LABEL_JA[e]}
              <span style={{ display: "block", fontSize: "0.7rem", opacity: 0.7 }}>{e}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", margin: "0.15rem 0" }}>
      <dt style={{ color: "var(--text-muted)", minWidth: "6rem" }}>{label}</dt>
      <dd style={{ margin: 0, fontWeight: 600 }}>{value}</dd>
    </div>
  );
}
