# @musasabi/plugin-accounting-widget

経理部門向けのサンプルプラグイン(docs/PLUGIN_SDK_BIBLE.md 第4章の構造例)。

- **目的**: コア(`apps/`, `packages/`)を変更せずに、経理部門向けの
  ダッシュボードウィジェットを追加できることを示すリファレンス実装
- **依存**: `@musasabi/plugin-sdk`(公開APIのみ。コアパッケージへの直接書き込みなし)
- **対象部署**: 経理部門(`dept-accounting`)
- **権限**: `dashboard_widget` のみ
- **データ**: すべてMock(実会計データ・外部接続なし)
