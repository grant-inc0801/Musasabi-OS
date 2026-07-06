import { appLogger } from "./appLogger";

// AI社員・音声・コールモード設定の保存(D-20260706-001 実装指示5)。
// WebView の localStorage を使う(実 credential は扱わない。UI設定のみ)。
// 将来 Tauri のネイティブストアへ差し替えられるよう、読み書きをこのモジュールに閉じ込める。

export interface EmployeeSettings {
  /** 操作対象の既定AI社員ID(名簿から選択)。 */
  defaultEmployeeId: string;
  /** 音声エンジン(現フェーズはMockのみ。実接続はしない)。 */
  voiceEngine: "voicevox_mock" | "disabled";
  /** 読み上げ速度(0.5〜2.0)。 */
  voiceSpeed: number;
  /** コールトレーニングの既定モード(autocall は選択不可)。 */
  defaultCallMode: "learning" | "test";
}

export const DEFAULT_EMPLOYEE_SETTINGS: EmployeeSettings = {
  defaultEmployeeId: "MUSA-103",
  voiceEngine: "voicevox_mock",
  voiceSpeed: 1.0,
  defaultCallMode: "test",
};

const STORAGE_KEY = "musasabi.employeeSettings";

/** 保存値を検証しつつ読み込む。壊れている場合は既定値へフォールバック。 */
export function loadEmployeeSettings(): EmployeeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return { ...DEFAULT_EMPLOYEE_SETTINGS };
    }
    const parsed: unknown = JSON.parse(raw);
    return sanitize(parsed);
  } catch (error) {
    appLogger.warn("failed to load employee settings; falling back to defaults", {
      error: String(error),
    });
    return { ...DEFAULT_EMPLOYEE_SETTINGS };
  }
}

export function saveEmployeeSettings(settings: EmployeeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    appLogger.warn("failed to persist employee settings", { error: String(error) });
  }
}

function sanitize(value: unknown): EmployeeSettings {
  const d = DEFAULT_EMPLOYEE_SETTINGS;
  if (typeof value !== "object" || value === null) {
    return { ...d };
  }
  const v = value as Partial<Record<keyof EmployeeSettings, unknown>>;
  return {
    defaultEmployeeId:
      typeof v.defaultEmployeeId === "string" && v.defaultEmployeeId.length > 0
        ? v.defaultEmployeeId
        : d.defaultEmployeeId,
    voiceEngine: v.voiceEngine === "disabled" ? "disabled" : "voicevox_mock",
    voiceSpeed:
      typeof v.voiceSpeed === "number" && v.voiceSpeed >= 0.5 && v.voiceSpeed <= 2.0
        ? v.voiceSpeed
        : d.voiceSpeed,
    defaultCallMode: v.defaultCallMode === "learning" ? "learning" : "test",
  };
}
