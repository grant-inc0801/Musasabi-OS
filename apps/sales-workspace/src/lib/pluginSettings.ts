import { appLogger } from "./appLogger";

// プラグインの有効/無効状態の永続化(localStorage)。実体の登録はリポジトリ内の
// プラグイン(plugins/)のみで、外部からの取得・動的コード実行は行わない。

const STORAGE_KEY = "musasabi.pluginEnabled";

export function loadPluginEnabledMap(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }
    const result: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    appLogger.warn("failed to load plugin settings; using defaults", { error: String(error) });
    return {};
  }
}

export function savePluginEnabled(id: string, enabled: boolean): void {
  try {
    const map = loadPluginEnabledMap();
    map[id] = enabled;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    appLogger.warn("failed to persist plugin settings", { error: String(error) });
  }
}
