// MUSA 常駐アバター(2D オーバーレイ)の状態機械。
// Development Bible 第8章 / AI Employee Bible 第8章 のステータス対応に基づく。

export type AvatarState =
  | "idle"
  | "working"
  | "preparing_call"
  | "follow_up"
  | "goal_achieved";

export const AVATAR_STATES: readonly AvatarState[] = [
  "idle",
  "working",
  "preparing_call",
  "follow_up",
  "goal_achieved",
];

export function isAvatarState(value: string): value is AvatarState {
  return (AVATAR_STATES as readonly string[]).includes(value);
}

export type AvatarStateListener = (state: AvatarState) => void;

export class AvatarStateMachine {
  private state: AvatarState = "idle";
  private listeners: AvatarStateListener[] = [];

  getState(): AvatarState {
    return this.state;
  }

  transition(next: AvatarState): AvatarState {
    if (!isAvatarState(next)) {
      throw new Error(`Unknown avatar state: ${next}`);
    }
    this.state = next;
    for (const listener of this.listeners) {
      listener(this.state);
    }
    return this.state;
  }

  onChange(listener: AvatarStateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
export * from "./displaySettings";
export * from "./emotionMotion";
