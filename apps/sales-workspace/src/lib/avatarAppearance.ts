import { appLogger } from "./appLogger";

// アバター作成(設定画面)の外観設定。localStorage 保存(この端末のみ)。
// 常駐アバターウィンドウは同一オリジンのため storage イベントで変更を検知して反映する。

export interface AvatarAppearance {
  bodyColor: string;
  bellyColor: string;
  eyeColor: string;
}

export const DEFAULT_AVATAR_APPEARANCE: AvatarAppearance = {
  bodyColor: "#8d8d94",
  bellyColor: "#e8e6df",
  eyeColor: "#2a2a30",
};

export const AVATAR_APPEARANCE_KEY = "musasabi.avatarAppearance";
/** VRM差し替えの通知用(値は更新時刻。storage イベントの発火が目的)。 */
export const AVATAR_VRM_UPDATED_KEY = "musasabi.avatarVrmUpdatedAt";

const HEX = /^#[0-9a-f]{6}$/i;

export function loadAvatarAppearance(): AvatarAppearance {
  try {
    const raw = localStorage.getItem(AVATAR_APPEARANCE_KEY);
    if (raw === null) return { ...DEFAULT_AVATAR_APPEARANCE };
    const parsed = JSON.parse(raw) as Partial<AvatarAppearance>;
    return {
      bodyColor: HEX.test(parsed.bodyColor ?? "") ? (parsed.bodyColor as string) : DEFAULT_AVATAR_APPEARANCE.bodyColor,
      bellyColor: HEX.test(parsed.bellyColor ?? "") ? (parsed.bellyColor as string) : DEFAULT_AVATAR_APPEARANCE.bellyColor,
      eyeColor: HEX.test(parsed.eyeColor ?? "") ? (parsed.eyeColor as string) : DEFAULT_AVATAR_APPEARANCE.eyeColor,
    };
  } catch (error) {
    appLogger.warn("failed to load avatar appearance", { error: String(error) });
    return { ...DEFAULT_AVATAR_APPEARANCE };
  }
}

export function saveAvatarAppearance(appearance: AvatarAppearance): void {
  try {
    localStorage.setItem(AVATAR_APPEARANCE_KEY, JSON.stringify(appearance));
  } catch (error) {
    appLogger.warn("failed to save avatar appearance", { error: String(error) });
  }
}

/** VRM を差し替えたことを常駐ウィンドウへ通知する(storage イベント経由)。 */
export function notifyVrmUpdated(): void {
  try {
    localStorage.setItem(AVATAR_VRM_UPDATED_KEY, String(Date.now()));
  } catch (error) {
    appLogger.warn("failed to notify vrm update", { error: String(error) });
  }
}
