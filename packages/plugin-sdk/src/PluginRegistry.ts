import type { DashboardWidget, MusasabiPlugin, PluginManifest } from "./types";
import { validatePluginManifest } from "./validateManifest";

// プラグインレジストリ(Bible 第4・5章)。登録時にマニフェスト検証と
// 「宣言していない権限の拡張ポイントは提供できない」チェックを行う。
// 有効/無効の永続化はアプリ側(localStorage)が行い、初期状態を注入する。

export interface PluginInfo {
  manifest: PluginManifest;
  enabled: boolean;
}

export class PluginRegistry {
  private readonly plugins = new Map<string, MusasabiPlugin>();
  private readonly enabled = new Map<string, boolean>();

  /**
   * プラグインを登録する。マニフェスト不正・ID重複・権限外の拡張提供は
   * 例外を投げる(Bible 第5章の機械チェック)。既定で有効。
   */
  register(plugin: MusasabiPlugin, initiallyEnabled = true): void {
    const errors = validatePluginManifest(plugin.manifest);
    if (errors.length > 0) {
      throw new Error(`プラグイン登録エラー: ${errors.join(" / ")}`);
    }
    const id = plugin.manifest.id;
    if (this.plugins.has(id)) {
      throw new Error(`プラグインIDが重複しています: ${id}`);
    }
    if (
      plugin.widgets &&
      plugin.widgets.length > 0 &&
      !plugin.manifest.permissions.includes("dashboard_widget")
    ) {
      throw new Error(
        `プラグイン ${id} は dashboard_widget 権限を宣言せずにウィジェットを提供しています。`,
      );
    }
    this.plugins.set(id, plugin);
    this.enabled.set(id, initiallyEnabled);
  }

  /** 登録済みプラグインの一覧(ID昇順)。 */
  list(): PluginInfo[] {
    return [...this.plugins.values()]
      .map((p) => ({ manifest: p.manifest, enabled: this.enabled.get(p.manifest.id) ?? false }))
      .sort((a, b) => a.manifest.id.localeCompare(b.manifest.id));
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  isEnabled(id: string): boolean {
    return this.enabled.get(id) ?? false;
  }

  /** 有効/無効を切り替える。未登録IDは無視する。 */
  setEnabled(id: string, value: boolean): void {
    if (this.plugins.has(id)) {
      this.enabled.set(id, value);
    }
  }

  /** 有効なプラグインが提供するダッシュボードウィジェット(登録順)。 */
  widgets(): Array<DashboardWidget & { pluginId: string }> {
    const result: Array<DashboardWidget & { pluginId: string }> = [];
    for (const plugin of this.plugins.values()) {
      if (!this.isEnabled(plugin.manifest.id) || !plugin.widgets) {
        continue;
      }
      for (const widget of plugin.widgets) {
        result.push({ ...widget, pluginId: plugin.manifest.id });
      }
    }
    return result;
  }
}
