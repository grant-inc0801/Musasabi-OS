import { useMemo, useState } from "react";
import { PluginRegistry, PLUGIN_PERMISSION_LABEL_JA } from "@musasabi/plugin-sdk";
import { accountingWidgetPlugin } from "@musasabi/plugin-accounting-widget";
import { MOCK_DEPARTMENT_SUMMARIES } from "@musasabi/ai-company";
import { loadPluginEnabledMap, savePluginEnabled } from "../../lib/pluginSettings";

// プラグイン管理ページ(Phase β-002 優先順位⑤ / docs/PLUGIN_SDK_BIBLE.md)。
// リポジトリ内のプラグイン(plugins/)を登録・一覧し、有効/無効を切り替える。
// 外部からのプラグイン取得・動的コード実行は行わない(審査プロセスは Bible 第5章)。

// インストール済みプラグイン(リポジトリ内で静的にビルドされたもののみ)。
const INSTALLED_PLUGINS = [accountingWidgetPlugin];

function buildRegistry(): PluginRegistry {
  const registry = new PluginRegistry();
  const enabledMap = loadPluginEnabledMap();
  for (const plugin of INSTALLED_PLUGINS) {
    registry.register(plugin, enabledMap[plugin.manifest.id] ?? true);
  }
  return registry;
}

function departmentName(deptId: string | null): string {
  if (deptId === null) {
    return "全社共通";
  }
  return MOCK_DEPARTMENT_SUMMARIES.find((d) => d.id === deptId)?.name ?? deptId;
}

export function PluginsPage() {
  const registry = useMemo(buildRegistry, []);
  const [, setVersion] = useState(0); // トグル後の再描画用

  function toggle(id: string, enabled: boolean): void {
    registry.setEnabled(id, enabled);
    savePluginEnabled(id, enabled);
    setVersion((v) => v + 1);
  }

  const plugins = registry.list();
  const widgets = registry.widgets();

  return (
    <>
      <section aria-label="プラグイン一覧">
        <h3 style={{ marginTop: 0 }}>インストール済みプラグイン({plugins.length}件)</h3>
        <p style={{ color: "#9aa3ba", fontSize: "0.85rem", maxWidth: "44rem" }}>
          プラグインはリポジトリ内(plugins/)で審査・ビルドされたもののみ読み込みます
          (外部からの取得・動的コード実行はしません。審査プロセスは Plugin SDK Bible 第5章)。
        </p>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["プラグイン", "バージョン", "対象部署", "権限", "説明", "状態"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plugins.map((p) => (
              <tr key={p.manifest.id}>
                <td style={cellStyle}>
                  {p.manifest.name}
                  <br />
                  <span style={{ color: "#7d8598", fontSize: "0.8rem" }}>
                    @musasabi/plugin-{p.manifest.id}
                  </span>
                </td>
                <td style={cellStyle}>{p.manifest.version}</td>
                <td style={cellStyle}>{departmentName(p.manifest.targetDepartment)}</td>
                <td style={cellStyle}>
                  {p.manifest.permissions.map((perm) => PLUGIN_PERMISSION_LABEL_JA[perm]).join(" / ")}
                </td>
                <td style={cellStyle}>{p.manifest.description}</td>
                <td style={cellStyle}>
                  <button type="button" onClick={() => toggle(p.manifest.id, !p.enabled)}>
                    {p.enabled ? "有効(クリックで無効化)" : "無効(クリックで有効化)"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section aria-label="ウィジェットプレビュー">
        <h3 style={{ marginTop: 0 }}>提供中のダッシュボードウィジェット({widgets.length}件)</h3>
        {widgets.length === 0 ? (
          <p style={{ color: "#9aa3ba" }}>有効なウィジェットはありません。</p>
        ) : (
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {widgets.map((w) => (
              <div key={`${w.pluginId}:${w.id}`} className="card" style={{ minWidth: "16rem" }}>
                <strong>{w.title}</strong>
                <ul style={{ paddingLeft: "1.1rem", margin: "0.5rem 0" }}>
                  {w.items.map((item) => (
                    <li key={item.label}>
                      {item.label}: <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
                {w.note && (
                  <p style={{ color: "#9aa3ba", fontSize: "0.8rem", margin: 0 }}>{w.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid rgba(151,168,205,0.16)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
