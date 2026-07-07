import type { MusasabiPlugin, PluginManifest } from "@musasabi/plugin-sdk";

// 経理部門向けサンプルプラグイン(docs/PLUGIN_SDK_BIBLE.md 第4章の構造例)。
// コアを変更せず、plugin-sdk の公開APIのみでダッシュボードウィジェットを追加する。
// データはすべてMock(実会計データ・外部接続なし)。

export const manifest: PluginManifest = {
  id: "accounting-widget",
  name: "経理サマリーウィジェット",
  version: "1.0.0",
  description: "経理部門向けの日次サマリー(請求書・経費精算・仕訳)を表示するサンプル",
  targetDepartment: "dept-accounting",
  permissions: ["dashboard_widget"],
};

export const accountingWidgetPlugin: MusasabiPlugin = {
  manifest,
  widgets: [
    {
      id: "accounting-daily-summary",
      title: "経理サマリー(本日・Mock)",
      items: [
        { label: "請求書 処理待ち", value: "4件" },
        { label: "経費精算 承認待ち", value: "7件" },
        { label: "仕訳 未確認", value: "12件" },
        { label: "支払期限 3日以内", value: "2件" },
      ],
      note: "サンプルプラグインのMock値です(実会計データには接続しません)。",
    },
  ],
};
