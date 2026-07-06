import {
  DEFAULT_AVATAR_DISPLAY_SETTINGS,
  parseAvatarDisplaySettings,
} from "@musasabi/avatar-2d";
import type { AvatarDisplaySettings } from "@musasabi/avatar-2d";
import { appLogger } from "./appLogger";

// アバター表示サイズ設定の永続化(D-20260706-006)。localStorage を使い、
// 検証・丸めは @musasabi/avatar-2d の parseAvatarDisplaySettings に任せる。

const STORAGE_KEY = "musasabi.avatarDisplaySettings";

export function loadAvatarSettings(): AvatarDisplaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return { ...DEFAULT_AVATAR_DISPLAY_SETTINGS };
    }
    return parseAvatarDisplaySettings(JSON.parse(raw));
  } catch (error) {
    appLogger.warn("failed to load avatar settings; falling back to defaults", {
      error: String(error),
    });
    return { ...DEFAULT_AVATAR_DISPLAY_SETTINGS };
  }
}

export function saveAvatarSettings(settings: AvatarDisplaySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    appLogger.warn("failed to persist avatar settings", { error: String(error) });
  }
}
