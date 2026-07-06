import { useState } from "react";
import { AI_EMPLOYEES, RANK_LABEL_JA } from "@musasabi/ai-company";
import { CALL_MODE_LABEL_JA } from "@musasabi/call-training";
import {
  DEFAULT_EMPLOYEE_SETTINGS,
  loadEmployeeSettings,
  saveEmployeeSettings,
  type EmployeeSettings,
} from "../../lib/employeeSettings";
import { appLogger } from "../../lib/appLogger";

// AI社員・音声・コールモード設定(D-20260706-001 実装指示5)。
// 音声エンジンはMock表示のみで実接続しない。AutoCall は既定モードとして選択不可。

export function EmployeeSettingsPanel() {
  const [settings, setSettings] = useState<EmployeeSettings>(() => loadEmployeeSettings());
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function update<K extends keyof EmployeeSettings>(key: K, value: EmployeeSettings[K]): void {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSavedAt(null);
  }

  function handleSave(): void {
    saveEmployeeSettings(settings);
    setSavedAt(new Date().toLocaleTimeString());
    appLogger.info("employee settings saved", { defaultEmployeeId: settings.defaultEmployeeId });
  }

  function handleReset(): void {
    setSettings({ ...DEFAULT_EMPLOYEE_SETTINGS });
    setSavedAt(null);
  }

  return (
    <section aria-label="AI社員設定" style={{ marginBottom: "1.5rem" }}>
      <h3>AI社員・音声・モード設定</h3>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          既定のAI社員
          <br />
          <select
            value={settings.defaultEmployeeId}
            onChange={(e) => update("defaultEmployeeId", e.target.value)}
          >
            {AI_EMPLOYEES.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.id} {emp.name}({RANK_LABEL_JA[emp.rank]} / {emp.role})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          音声エンジン(Mock。実接続なし)
          <br />
          <select
            value={settings.voiceEngine}
            onChange={(e) =>
              update("voiceEngine", e.target.value === "disabled" ? "disabled" : "voicevox_mock")
            }
          >
            <option value="voicevox_mock">VOICEVOX(Mock)</option>
            <option value="disabled">無効</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          読み上げ速度: {settings.voiceSpeed.toFixed(1)}
          <br />
          <input
            type="range"
            min={0.5}
            max={2.0}
            step={0.1}
            value={settings.voiceSpeed}
            onChange={(e) => update("voiceSpeed", Number(e.target.value))}
          />
        </label>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label>
          コールトレーニングの既定モード
          <br />
          <select
            value={settings.defaultCallMode}
            onChange={(e) =>
              update("defaultCallMode", e.target.value === "learning" ? "learning" : "test")
            }
          >
            <option value="learning">{CALL_MODE_LABEL_JA.learning}</option>
            <option value="test">{CALL_MODE_LABEL_JA.test}</option>
          </select>
        </label>
        <p style={{ color: "#a00", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
          オートコールモードは全安全ゲート充足まで既定モードに設定できません。
        </p>
      </div>

      <button type="button" onClick={handleSave}>
        保存
      </button>{" "}
      <button type="button" onClick={handleReset}>
        既定値に戻す
      </button>
      {savedAt && <span style={{ marginLeft: "0.5rem", color: "#080" }}>保存しました({savedAt})</span>}
    </section>
  );
}
