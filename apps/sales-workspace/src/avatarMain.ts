import { AvatarStateMachine, isAvatarState } from "@musasabi/avatar-2d";
import type { AvatarState } from "@musasabi/avatar-2d";
import { AVATAR_EVENTS } from "@musasabi/shared";

// Tauriのアバターオーバーレイウィンドウ(apps/desktop/src-tauri/src/lib.rs が
// avatar.htmlとして生成する)本体。AvatarStateMachineの単一の正本インスタンスは
// このウィンドウが保持し、メインウィンドウ(desktopBridge.ts)からのTauriイベント
// 経由の状態遷移要求を検証・適用する。

// 実アセット(SVG/Live2D等)はAIクリエイティブ本部が用意するまでの仮表示
// (Organization Bible 第3.5章)。Electron版(旧 apps/desktop/src/main.ts)の
// 絵文字プレースホルダーをそのまま踏襲している。
const AVATAR_STATE_EMOJI: Record<AvatarState, string> = {
  idle: "😴",
  working: "💻",
  preparing_call: "🤔",
  follow_up: "📓",
  goal_achieved: "🎉",
};

const stateMachine = new AvatarStateMachine();

function render(state: AvatarState): void {
  const el = document.getElementById("avatar");
  if (el) {
    el.textContent = AVATAR_STATE_EMOJI[state];
  }
}

render(stateMachine.getState());

async function main(): Promise<void> {
  const { emit, listen } = await import("@tauri-apps/api/event");

  await listen<string>(AVATAR_EVENTS.setState, async (event) => {
    const requested = event.payload;
    if (!isAvatarState(requested)) {
      return;
    }
    const nextState = stateMachine.transition(requested);
    render(nextState);
    await emit(AVATAR_EVENTS.stateChanged, nextState);
  });
}

void main();
