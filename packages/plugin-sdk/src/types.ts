// Plugin SDK の型定義(Phase β-002 優先順位⑤ / docs/PLUGIN_SDK_BIBLE.md)。
// サードパーティ・社内他部署がコアを変更せずに機能を追加するための公開API。
// 動的コード実行・外部からのプラグイン取得は行わない(リポジトリ内 plugins/ のみ)。

/**
 * プラグインが要求できる権限(Bible 第2章「拡張できる範囲」に対応)。
 * ここに無い権限(Security Bible 第2章の禁止事項に触れるもの等)は検証で拒否される。
 */
export type PluginPermission =
  | "dashboard_widget" // Workspaceへのダッシュボードウィジェット追加
  | "department_logic" // 部署向けロジック(ai-core相当)の追加
  | "voice_provider" // Voice Engine の TTS/STT プロバイダ追加
  | "avatar_asset" // Avatar の状態・表情アセット拡張
  | "external_integration"; // 外部サービス連携(実接続は別途承認が必要)

export const PLUGIN_PERMISSIONS: readonly PluginPermission[] = [
  "dashboard_widget",
  "department_logic",
  "voice_provider",
  "avatar_asset",
  "external_integration",
];

export const PLUGIN_PERMISSION_LABEL_JA: Record<PluginPermission, string> = {
  dashboard_widget: "ダッシュボードウィジェット",
  department_logic: "部署向けロジック",
  voice_provider: "音声プロバイダ",
  avatar_asset: "アバターアセット",
  external_integration: "外部サービス連携",
};

/** プラグインのマニフェスト(Bible 第4章のプラグイン構造に対応)。 */
export interface PluginManifest {
  /** kebab-case のプラグインID(パッケージ名は `@musasabi/plugin-<id>`)。 */
  id: string;
  /** 表示名。 */
  name: string;
  /** SemVer(Bible 第6章)。 */
  version: string;
  description: string;
  /** 対象部署ID(例: "dept-accounting")。全社共通は null。 */
  targetDepartment: string | null;
  /** 要求する権限。宣言していない拡張ポイントは利用できない。 */
  permissions: PluginPermission[];
}

/** ダッシュボードウィジェット(描画技術非依存。UI側が表示する)。 */
export interface DashboardWidget {
  id: string;
  title: string;
  /** 表示する項目(Mock/決定論データ)。 */
  items: Array<{ label: string; value: string }>;
  /** 注記(例: Mockである旨)。 */
  note?: string;
}

/** プラグイン本体。マニフェストと拡張ポイントの提供物を持つ。 */
export interface MusasabiPlugin {
  manifest: PluginManifest;
  /** dashboard_widget 権限を宣言したプラグインのみ提供できる。 */
  widgets?: DashboardWidget[];
}
