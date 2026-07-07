import type { PluginManifest, PluginPermission } from "./types";
import { PLUGIN_PERMISSIONS } from "./types";

// プラグインマニフェストの検証(Bible 第5章 審査プロセスの機械チェック部分)。
// 決定論的な純粋関数。エラーは日本語メッセージの配列で返す(空=合格)。

const ID_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

/** マニフェストを検証し、問題点の一覧を返す(空配列なら合格)。 */
export function validatePluginManifest(value: unknown): string[] {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) {
    return ["マニフェストがオブジェクトではありません。"];
  }
  const m = value as Partial<PluginManifest>;

  if (typeof m.id !== "string" || !ID_PATTERN.test(m.id)) {
    errors.push("id は kebab-case の文字列が必要です(例: accounting-widget)。");
  }
  if (typeof m.name !== "string" || m.name.trim().length === 0) {
    errors.push("name(表示名)が必要です。");
  }
  if (typeof m.version !== "string" || !SEMVER_PATTERN.test(m.version)) {
    errors.push("version は SemVer(例: 1.0.0)が必要です(Bible 第6章)。");
  }
  if (typeof m.description !== "string" || m.description.trim().length === 0) {
    errors.push("description(目的の説明)が必要です。");
  }
  if (m.targetDepartment !== null && typeof m.targetDepartment !== "string") {
    errors.push("targetDepartment は部署ID文字列または null が必要です。");
  }
  if (!Array.isArray(m.permissions) || m.permissions.length === 0) {
    errors.push("permissions(要求権限)を1つ以上宣言してください。");
  } else {
    for (const p of m.permissions) {
      if (!PLUGIN_PERMISSIONS.includes(p as PluginPermission)) {
        errors.push(
          `permissions に不明または許可されない権限があります: ${String(p)}` +
            "(Security Bible 第2章の禁止事項に触れる拡張は定義できません)",
        );
      }
    }
  }
  return errors;
}
