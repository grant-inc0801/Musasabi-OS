// MUSAアバター正式基盤(VRM)の型定義(Phase β-002 優先順位②)。
// VRoid Studio で作成した VRM を読み込む前提。ここではレンダラー(three.js +
// @pixiv/three-vrm)に依存しない、フレームワーク非依存の型・インターフェースのみを置く。

/**
 * VRM 1.0 の標準表情プリセット(の感情サブセット)。VRoid Studio 製の VRM は
 * これらの Expression を持つため、感情表現の共通語彙として使う。
 * リップシンク用の aa/ih/ou/ee/oh・まばたきの blink は別途扱う。
 */
export type VrmExpressionPreset =
  | "neutral"
  | "happy"
  | "angry"
  | "sad"
  | "relaxed"
  | "surprised";

export const VRM_EXPRESSION_PRESETS: readonly VrmExpressionPreset[] = [
  "neutral",
  "happy",
  "angry",
  "sad",
  "relaxed",
  "surprised",
];

/**
 * 待機モーションの1フレーム分のパラメータ。呼吸(上下運動)とまばたきを表す。
 * 実レンダラーはこれを VRM のボーン/Expression に適用する。
 */
export interface IdleMotionFrame {
  /** 呼吸の位相。-1(最も吐いた)〜1(最も吸った)。 */
  breathPhase: number;
  /** まばたきの閉じ具合。0(開)〜1(完全に閉)。 */
  blink: number;
}

/**
 * VRM 描画の抽象インターフェース。実装は three.js + @pixiv/three-vrm による
 * `ThreeVrmRenderer`(②-2、WebGL 依存でこの環境では未検証)。テストではモックを使う。
 * AvatarManager はこのインターフェースにのみ依存し、描画技術から切り離す。
 */
export interface VrmRenderer {
  /** VRM モデル(VRoid Studio 製など)を URL から読み込む。 */
  loadModel(url: string): Promise<void>;
  /** 指定の表情プリセットを weight(0〜1)で適用する。 */
  setExpression(preset: VrmExpressionPreset, weight: number): void;
  /** 待機モーション1フレームを適用する。 */
  applyIdleMotion(frame: IdleMotionFrame): void;
  /** リソースを解放する。 */
  dispose(): void;
}
