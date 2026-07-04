# Musasabi OS Plugin SDK Bible

Version 1.0

Musasabi OSを将来1社から100社・SaaSへ拡張する(Development Bible 第30章)ための
プラグイン機構を定義する。実装は `plugins/` と `packages/shared` の拡張ポイントを通じて行う。

---

## 第1章 目的

サードパーティ・社内他部署が、コアシステム(`apps/`, `packages/`)を変更せずに
機能を追加できるようにする。

---

## 第2章 プラグインが拡張できる範囲

- 新しい部署向けの `ai-core` 相当ロジック(例: 経理部門向けプラグイン)
- Avatar の新しい状態・表情(`packages/avatar-2d`, `avatar-3d` のアセット拡張)
- Voice Engine の新しいTTS/STTプロバイダ
- Sales Workspace / 将来の他部門Workspaceへの新しいダッシュボードウィジェット
- 外部サービス連携(Zoom Phone/FileMaker以外の営業ツール等)

## 第3章 プラグインが拡張できない範囲(Security Bible優先)

- Security Bible 第2章の絶対禁止事項(ファイル削除/Force Push/Issue大量削除/
  Secret変更/APIキー表示)を上書き・回避すること
- Organization Bible の承認フロー(Approval Flow)を迂回すること
- 他部署・他プラグインのMemoryへの無許可アクセス

---

## 第4章 プラグイン構造

```
plugins/
  <plugin-name>/
    package.json      # @musasabi/plugin-<name>
    src/index.ts       # エントリポイント
    README.md          # 目的・依存パッケージ・対象部署
```

- プラグインは `packages/shared` が公開する型・IPCプロトコルにのみ依存する
- コアパッケージ(`packages/ai-company`, `memory` 等)への直接的な書き込みはせず、
  公開APIを通じて連携する

---

## 第5章 審査プロセス

新規プラグインの追加は以下を満たす必要がある。

1. Security Bible 第2・3章に抵触しないことの確認
2. 対象部署のDepartment Playbookとの整合確認
3. AI開発本部(Organization Bible 第3.2章)によるコードレビュー
4. Development Bible 第4章の「実装前に整合性確認」に従う

---

## 第6章 バージョニングと互換性

- プラグインAPIは `packages/shared` のバージョンに従うSemVerで管理する
- 破壊的変更はメジャーバージョンアップ時のみ許可し、事前に影響範囲を明示する

---

## 第7章 将来のSaaS化との関係

Development Bible 第30章の「1社 → 10社 → 100社 → SaaS」拡張において、
Plugin SDKはテナントごとの差分機能を吸収する仕組みとして機能する想定。
具体的なマルチテナント設計は、Automation Engine・Self Improvement Engine
実装後の別フェーズで検討する。
