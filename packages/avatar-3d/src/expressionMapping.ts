import type { AvatarState } from "@musasabi/avatar-2d";
import type { VrmExpressionPreset } from "./types";

// avatar-2d の業務ステータス(AvatarState)を、VRM の感情表情プリセットへ決定論的に
// 変換する(Development Bible: 決定論的挙動を優先)。2Dアバター(絵文字)と3D/VRM
// アバターで同じ状態機械を共有し、表現方法だけを差し替えられるようにするための橋渡し。

const STATE_TO_EXPRESSION: Record<AvatarState, VrmExpressionPreset> = {
  idle: "relaxed", // 待機中はリラックスした表情
  working: "neutral", // 作業中は落ち着いた無表情
  preparing_call: "neutral", // コール準備中(集中)
  follow_up: "relaxed", // フォローアップ(穏やか)
  goal_achieved: "happy", // 目標達成(喜び)
};

/** 業務ステータスに対応する VRM 表情プリセットを返す。 */
export function expressionForAvatarState(state: AvatarState): VrmExpressionPreset {
  return STATE_TO_EXPRESSION[state];
}
