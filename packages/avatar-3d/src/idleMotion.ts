import type { IdleMotionFrame } from "./types";

// 待機モーション(Phase β-002 優先順位②)。呼吸とまばたきを時刻から決定論的に算出する
// (Development Bible: 決定論的挙動を優先)。実レンダラーは毎フレームこれを呼び、
// VRM のボーン(呼吸=上半身の微小な上下)と blink Expression(まばたき)に適用する。

export interface IdleMotionConfig {
  /** 呼吸1周期の長さ(ミリ秒)。既定: 4000ms(15回/分程度)。 */
  breathPeriodMs: number;
  /** まばたき1周期の長さ(ミリ秒)。既定: 5000ms。 */
  blinkPeriodMs: number;
  /** 1回のまばたきに要する時間(ミリ秒)。既定: 150ms。 */
  blinkDurationMs: number;
}

export const DEFAULT_IDLE_MOTION_CONFIG: IdleMotionConfig = {
  breathPeriodMs: 4000,
  blinkPeriodMs: 5000,
  blinkDurationMs: 150,
};

/**
 * まばたきの閉じ具合(0〜1)を算出する。周期の先頭 `blinkDurationMs` の間だけ、
 * 0→1→0 の三角波で瞬きし、それ以外は 0(開いた状態)。
 */
function computeBlink(timeMs: number, config: IdleMotionConfig): number {
  const phase = ((timeMs % config.blinkPeriodMs) + config.blinkPeriodMs) % config.blinkPeriodMs;
  if (phase >= config.blinkDurationMs) {
    return 0;
  }
  const half = config.blinkDurationMs / 2;
  // 前半で 0→1、後半で 1→0 の三角波。
  return phase < half ? phase / half : 1 - (phase - half) / half;
}

/**
 * 指定時刻の待機モーション1フレームを返す。同じ時刻・設定なら常に同じ結果
 * (純粋関数、テスト容易)。
 */
export function computeIdleMotion(
  timeMs: number,
  config: IdleMotionConfig = DEFAULT_IDLE_MOTION_CONFIG,
): IdleMotionFrame {
  const breathPhase = Math.sin((2 * Math.PI * timeMs) / config.breathPeriodMs);
  const blink = computeBlink(timeMs, config);
  return { breathPhase, blink };
}
