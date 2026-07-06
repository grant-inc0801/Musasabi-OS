import type { AvatarState } from "@musasabi/avatar-2d";
import { expressionForAvatarState } from "./expressionMapping";
import { computeIdleMotion, DEFAULT_IDLE_MOTION_CONFIG, type IdleMotionConfig } from "./idleMotion";
import type { VrmExpressionPreset, VrmRenderer } from "./types";

// MUSAアバターの統合管理(Phase β-002 優先順位②)。VRM のロード、業務ステータスに
// 応じた表情切り替え、待機モーションの適用を束ねる。描画技術には依存せず、注入された
// VrmRenderer(実体は three.js + @pixiv/three-vrm、テストではモック)にのみ依存する。

export interface AvatarManagerOptions {
  idleMotionConfig?: IdleMotionConfig;
}

export class AvatarManager {
  private readonly renderer: VrmRenderer;
  private readonly idleMotionConfig: IdleMotionConfig;
  private modelLoaded = false;
  private currentState: AvatarState = "idle";

  constructor(renderer: VrmRenderer, options: AvatarManagerOptions = {}) {
    this.renderer = renderer;
    this.idleMotionConfig = options.idleMotionConfig ?? DEFAULT_IDLE_MOTION_CONFIG;
  }

  /** VRM モデル(VRoid Studio 製など)を読み込み、現在のステータスの表情を適用する。 */
  async loadAvatar(url: string): Promise<void> {
    await this.renderer.loadModel(url);
    this.modelLoaded = true;
    // ロード直後に現在のステータスに対応する表情を反映する。
    this.renderer.setExpression(this.currentExpression(), 1);
  }

  get isModelLoaded(): boolean {
    return this.modelLoaded;
  }

  /** 業務ステータスを設定し、対応する VRM 表情を適用する。 */
  setState(state: AvatarState): void {
    this.currentState = state;
    if (this.modelLoaded) {
      this.renderer.setExpression(this.currentExpression(), 1);
    }
  }

  getState(): AvatarState {
    return this.currentState;
  }

  /** 現在のステータスに対応する VRM 表情プリセット。 */
  currentExpression(): VrmExpressionPreset {
    return expressionForAvatarState(this.currentState);
  }

  /**
   * レンダーループから毎フレーム呼ぶ。待機モーション(呼吸・まばたき)を算出して適用する。
   * モデル未ロードの間は何もしない。
   */
  tick(timeMs: number): void {
    if (!this.modelLoaded) {
      return;
    }
    this.renderer.applyIdleMotion(computeIdleMotion(timeMs, this.idleMotionConfig));
  }

  /** リソースを解放する。 */
  dispose(): void {
    this.renderer.dispose();
    this.modelLoaded = false;
  }
}
