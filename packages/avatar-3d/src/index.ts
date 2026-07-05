// MUSAアバター正式基盤(three.js + VRM、VRoid Studio 製 VRM 対応)。
// Phase β-002 優先順位②。ここではレンダラー非依存のロジック層(②-1)を公開する。
// three.js + @pixiv/three-vrm による実レンダラー(ThreeVrmRenderer)は②-2で追加する。

export type { VrmExpressionPreset, IdleMotionFrame, VrmRenderer } from "./types";
export { VRM_EXPRESSION_PRESETS } from "./types";
export { expressionForAvatarState } from "./expressionMapping";
export {
  computeIdleMotion,
  DEFAULT_IDLE_MOTION_CONFIG,
  type IdleMotionConfig,
} from "./idleMotion";
export { AvatarManager, type AvatarManagerOptions } from "./AvatarManager";
