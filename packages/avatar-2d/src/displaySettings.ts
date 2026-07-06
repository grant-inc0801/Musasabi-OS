// 右下常駐アバターの表示サイズ設定(D-20260706-006 追加UI修正指示1)。
// 小 / 中 / 大 のプリセットとスライダーによる任意サイズ(px)を扱う。
// 決定論的な純粋ロジックのみ。永続化はアプリ側(localStorage)に任せる。

/** アバターサイズのプリセット。 */
export type AvatarSizePreset = "small" | "medium" | "large";

export const AVATAR_SIZE_PRESETS: readonly AvatarSizePreset[] = ["small", "medium", "large"];

export const AVATAR_SIZE_PRESET_LABEL_JA: Record<AvatarSizePreset, string> = {
  small: "小",
  medium: "中",
  large: "大",
};

/** プリセット → アバター直径(px)。 */
export const AVATAR_SIZE_PRESET_PX: Record<AvatarSizePreset, number> = {
  small: 56,
  medium: 80,
  large: 120,
};

/** スライダーで許可する範囲(px)。 */
export const AVATAR_SIZE_MIN_PX = 48;
export const AVATAR_SIZE_MAX_PX = 160;

/** アバター表示設定。sizePx が実際に使われる値(プリセット選択時はその px 値)。 */
export interface AvatarDisplaySettings {
  sizePx: number;
}

/** 初期値は「中」(D-20260706-006)。 */
export const DEFAULT_AVATAR_DISPLAY_SETTINGS: AvatarDisplaySettings = {
  sizePx: AVATAR_SIZE_PRESET_PX.medium,
};

/** サイズ(px)を許可範囲へ丸める。数値でない入力は既定値(中)に落とす。 */
export function clampAvatarSizePx(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_AVATAR_DISPLAY_SETTINGS.sizePx;
  }
  return Math.min(AVATAR_SIZE_MAX_PX, Math.max(AVATAR_SIZE_MIN_PX, Math.round(value)));
}

/** px 値が一致するプリセットを返す(スライダーで中間値の場合は null)。 */
export function presetForSizePx(sizePx: number): AvatarSizePreset | null {
  for (const preset of AVATAR_SIZE_PRESETS) {
    if (AVATAR_SIZE_PRESET_PX[preset] === sizePx) {
      return preset;
    }
  }
  return null;
}

/** 保存値(unknown)を検証して設定へ復元する。壊れていれば既定値。 */
export function parseAvatarDisplaySettings(value: unknown): AvatarDisplaySettings {
  if (typeof value !== "object" || value === null) {
    return { ...DEFAULT_AVATAR_DISPLAY_SETTINGS };
  }
  const sizePx = (value as { sizePx?: unknown }).sizePx;
  return { sizePx: clampAvatarSizePx(sizePx) };
}
