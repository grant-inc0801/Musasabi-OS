// @musasabi/plugin-sdk バレルエクスポート(Phase β-002 優先順位⑤)。
// docs/PLUGIN_SDK_BIBLE.md に基づくプラグイン機構の公開API。

export * from "./types";
export { validatePluginManifest } from "./validateManifest";
export { PluginRegistry, type PluginInfo } from "./PluginRegistry";
