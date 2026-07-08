// AV-MOTION-001: 感情別自動モーション制御(Issue #272)。
// アバターの「感情ステート → 表情 + モーション + 継続時間 + ループ + フォールバック」を
// 宣言的に定義し、duration 経過後に fallback へ自動復帰する状態機械を提供する。
// 描画層(CSS/Three.js/VRM/GLB/Live2D)からは分離し、この層は純ロジックのみを持つ。

/** 実装対象の感情ステート(14種)。 */
export type AvatarEmotion =
  | "idle"
  | "listen"
  | "thinking"
  | "answer"
  | "happy"
  | "surprised"
  | "worried"
  | "confident"
  | "working"
  | "sleepy"
  | "error"
  | "celebrate"
  | "alert"
  | "approval_wait";

/** 感情ステートの一覧(デバッグUIのボタン順・状態遷移で使用)。 */
export const AVATAR_EMOTIONS: readonly AvatarEmotion[] = [
  "idle",
  "listen",
  "thinking",
  "answer",
  "happy",
  "surprised",
  "worried",
  "confident",
  "working",
  "sleepy",
  "error",
  "celebrate",
  "alert",
  "approval_wait",
];

/** 1つの感情ステートの定義。 */
export interface EmotionMotion {
  /** 表情キー(Expression Controller が解釈)。 */
  expression: string;
  /** モーションキー(Motion Controller が解釈)。 */
  motion: string;
  /** 継続時間(ms)。null はループ(明示遷移まで継続)。 */
  duration: number | null;
  /** ループするか。 */
  loop: boolean;
  /** duration 経過後に自動遷移する先。null は idle。 */
  fallback: AvatarEmotion | null;
}

/** 感情→モーションのマッピング(Issue #272 初期定義)。 */
export const emotionMotionMap: Record<AvatarEmotion, EmotionMotion> = {
  idle: { expression: "neutral", motion: "idle_float", duration: null, loop: true, fallback: null },
  listen: { expression: "attentive", motion: "lean_forward", duration: null, loop: true, fallback: "idle" },
  thinking: { expression: "thinking", motion: "head_tilt", duration: 2500, loop: false, fallback: "idle" },
  answer: { expression: "soft_smile", motion: "gesture_talk", duration: 3000, loop: false, fallback: "idle" },
  happy: { expression: "smile", motion: "jump_light", duration: 1800, loop: false, fallback: "idle" },
  surprised: { expression: "surprised", motion: "quick_pop", duration: 1200, loop: false, fallback: "idle" },
  worried: { expression: "worried", motion: "shrink", duration: 2000, loop: false, fallback: "idle" },
  confident: { expression: "confident", motion: "chest_up", duration: 1800, loop: false, fallback: "idle" },
  working: { expression: "focused", motion: "typing_or_processing", duration: null, loop: true, fallback: "idle" },
  sleepy: { expression: "sleepy", motion: "sway_slow", duration: null, loop: true, fallback: "idle" },
  error: { expression: "worried_error", motion: "shake_small", duration: 1500, loop: false, fallback: "worried" },
  celebrate: { expression: "big_smile", motion: "small_spin_or_banzai", duration: 2200, loop: false, fallback: "idle" },
  alert: { expression: "serious", motion: "attention_pop", duration: 1200, loop: false, fallback: "idle" },
  approval_wait: { expression: "asking", motion: "wait_pose", duration: null, loop: true, fallback: "idle" },
};

/** 感情名が有効なステートか判定する。 */
export function isAvatarEmotion(value: string): value is AvatarEmotion {
  return (AVATAR_EMOTIONS as readonly string[]).includes(value);
}

/** ステートの解決済みフォールバック(未指定は idle)。 */
export function resolveFallback(emotion: AvatarEmotion): AvatarEmotion {
  return emotionMotionMap[emotion].fallback ?? "idle";
}

/** 日本語ラベル(デバッグUI表示用)。 */
export const EMOTION_LABEL_JA: Record<AvatarEmotion, string> = {
  idle: "通常待機",
  listen: "入力待ち",
  thinking: "考え中",
  answer: "回答中",
  happy: "喜び",
  surprised: "驚き",
  worried: "困り",
  confident: "自信あり",
  working: "作業中",
  sleepy: "長時間待機",
  error: "エラー",
  celebrate: "成功強調",
  alert: "注意通知",
  approval_wait: "承認待ち",
};

/**
 * 会社状態のシグナルから常駐アバターの感情ステートを導出する(純関数)。
 * 描画側(ai-company の部署ステータス等)に依存しないよう、真偽シグナルで受け取る。
 * 優先度: エラー > 承認待ち > 作業中 > 全完了 > 待機。
 */
export interface AvatarStateSignals {
  /** エラー中の部署/案件がある。 */
  hasError?: boolean;
  /** 承認待ちがある。 */
  hasApproval?: boolean;
  /** 作業中の部署がある。 */
  hasWorking?: boolean;
  /** すべて完了している。 */
  allDone?: boolean;
}

export function deriveEmotionFromSignals(signals: AvatarStateSignals): AvatarEmotion {
  if (signals.hasError) return "alert";
  if (signals.hasApproval) return "approval_wait";
  if (signals.hasWorking) return "working";
  if (signals.allDone) return "happy";
  return "idle";
}

/** 状態変化の通知内容。 */
export interface EmotionSnapshot {
  emotion: AvatarEmotion;
  motion: EmotionMotion;
}

export type EmotionListener = (snapshot: EmotionSnapshot) => void;

/** テスト用に注入可能なタイマー。 */
export interface Scheduler {
  setTimeout(handler: () => void, ms: number): number;
  clearTimeout(id: number): void;
}

const defaultScheduler: Scheduler = {
  setTimeout: (h, ms) => setTimeout(h, ms) as unknown as number,
  clearTimeout: (id) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>),
};

/**
 * 感情ステート管理。setEmotion で切り替え、duration 付きのステートは
 * 経過後に fallback へ自動復帰する。ループステートは次の明示遷移まで継続する。
 */
export class EmotionStateManager {
  private emotion: AvatarEmotion = "idle";
  private listeners: EmotionListener[] = [];
  private timerId: number | null = null;

  constructor(private readonly scheduler: Scheduler = defaultScheduler) {}

  /** 現在の感情ステートを返す。 */
  getCurrent(): AvatarEmotion {
    return this.emotion;
  }

  /** 現在のモーション定義を返す。 */
  getCurrentMotion(): EmotionMotion {
    return emotionMotionMap[this.emotion];
  }

  /**
   * 感情ステートを設定する。duration 付き(loop=false)のステートは、
   * duration 経過後に fallback へ自動遷移する。
   */
  setEmotion(next: AvatarEmotion): AvatarEmotion {
    if (!isAvatarEmotion(next)) {
      throw new Error(`Unknown avatar emotion: ${next}`);
    }
    this.clearTimer();
    this.emotion = next;
    this.emit();
    const def = emotionMotionMap[next];
    if (!def.loop && def.duration !== null) {
      this.timerId = this.scheduler.setTimeout(() => {
        this.timerId = null;
        this.setEmotion(resolveFallback(next));
      }, def.duration);
    }
    return this.emotion;
  }

  /** idle へ即時復帰する(保留中の自動復帰はキャンセル)。 */
  reset(): AvatarEmotion {
    return this.setEmotion("idle");
  }

  /** 状態変化を購読する。解除関数を返す。 */
  onChange(listener: EmotionListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /** 破棄(タイマー解放)。 */
  dispose(): void {
    this.clearTimer();
    this.listeners = [];
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      this.scheduler.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private emit(): void {
    const snapshot: EmotionSnapshot = { emotion: this.emotion, motion: emotionMotionMap[this.emotion] };
    for (const listener of this.listeners) listener(snapshot);
  }
}
