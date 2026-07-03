```yaml
# docs/sprints/Sprint-006.yaml

sprint: 6
title: AutoCall Beta Sprint
description: |
  Sprint 6を開始します: AutoCall Betaの準備。
  このスプリントでは、管理されたAIによるアウトバウンドコールを実施するための基盤を構築します。
goals:
  - 管理者が承認した条件下でのみ、AIアシストによるアウトバウンドコールを準備、管理し、最終的に実行できるようにするためのAutoCall Betaの基盤を構築します。
tasks:
  - id: S6-001
    title: AutoCall Beta Sprint Definition
    description: |
      Sprint-006.yamlを作成し、タスクを登録。
    dependencies: []
  - id: S6-002
    title: AutoCall Campaign Manager
    description: |
      対象リスト、作業時間、アポ制限、リトライルール、ステータスを含むキャンペーンを作成。
    dependencies: [S6-001]
  - id: S6-003
    title: AutoCall Queue Engine
    description: |
      リードの優先順位、準備度スコア、アポ確率からコールキューを生成。
    dependencies: [S6-002]
  - id: S6-004
    title: AutoCall Safety Gate
    description: |
      管理者の承認、緊急停止、作業時間、アポ制限、リスクチェックが必要。
    dependencies: [S6-002]
  - id: S6-005
    title: AutoCall Conversation Script Engine
    description: |
      Sales Brain、異議対応ライブラリ、最良のトークパターンから決定論的なコールスクリプトを生成。
    dependencies: [S6-002]
  - id: S6-006
    title: AutoCall Human Handoff
    description: |
      顧客が複雑な質問をしたり、高い関心を示したり、リスクが検出された場合に人間へエスカレーション。
    dependencies: [S6-002, S6-003]
  - id: S6-007
    title: AutoCall Audit Log
    description: |
      計画済みのコール、スキップされたコール、試行済みのコール、ハンドオフ、結果、停止イベントをすべてログに記録。
    dependencies: [S6-002]
  - id: S6-008
    title: AutoCall Beta Dashboard
    description: |
      キャンペーンステータス、キュー、アポカウント、リスクアラート、緊急停止、結果を表示。
    dependencies: [S6-002, S6-003, S6-007]
safety_rules: |
  AutoCallは自動的に開始してはならない。
  AutoCallには以下が必要:
  - 管理者の承認
  - アポ制限
  - 作業時間
  - 緊急停止が有効
  - キャンペーン選択
  - 承認されたリードキュー
  - 完全な監査ログ
acceptance_criteria:
  - Sprint-006.yamlが存在する
  - AI PMがSprint 6を解析可能
  - 最初に実行可能なタスクがS6-002であること
  - 依存関係が尊重されること
  - AutoCallの安全ルールが文書化されていること
  - テストが合格すること
  - README / CHANGELOGが更新されていること
```