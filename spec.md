# 技術指示書: S6-006 マルチエージェントコラボレーションエンジン

## 1. 概要

### 目的
マルチエージェントコラボレーションエンジンを実装します。Musasabi OSは複数のAIが連携可能なプラットフォームとして機能し、AI社員が共有タスクシステムを介して協働できることが求められます。このスプリントでは、協力タスクの実行、責任の割り当て、エージェント間のメッセージ送信、および共有コンテキストを導入します。

### ビジョン

```
CEO
↓
AI PM
↓
Task
↓
Multi-Agent Coordinator
↓
[Sales AI, Development AI, Accounting AI, Marketing AI, Support AI]
↓
Shared Company Brain
↓
Human Approval
```

## 2. 必要モジュール

以下のモジュールを `packages/brain/src/multi-agent/` に実装します。

- MultiAgentCoordinator.ts
- AgentRegistry.ts
- AgentMessageBus.ts
- AgentTaskDispatcher.ts
- CollaborationEngine.ts
- ContextSharing.ts
- AgentStateManager.ts
- index.ts

## 3. データベース設計

### SQLite

#### ai_agents テーブル

| フィールド名      | データ型 | 説明         |
|------------------|----------|--------------|
| id               | INTEGER  | ID           |
| agent_name       | TEXT     | エージェント名 |
| department       | TEXT     | 部門         |
| role             | TEXT     | 役割         |
| status           | TEXT     | 状態         |
| current_task     | TEXT     | 現在のタスク |
| workload         | INTEGER  | ワークロード |
| created_at       | DATETIME | 作成日時     |
| updated_at       | DATETIME | 更新日時     |

#### agent_tasks テーブル

| フィールド名      | データ型 | 説明         |
|------------------|----------|--------------|
| id               | INTEGER  | ID           |
| task_key         | TEXT     | タスクキー   |
| title            | TEXT     | タイトル     |
| assigned_agent   | TEXT     | 担当エージェント |
| priority         | INTEGER  | 優先度       |
| status           | TEXT     | 状態         |
| created_at       | DATETIME | 作成日時     |
| updated_at       | DATETIME | 更新日時     |

ステータスオプション:
- pending
- assigned
- working
- waiting
- review
- completed
- failed

#### agent_messages テーブル

| フィールド名   | データ型 | 説明         |
|---------------|----------|--------------|
| id            | INTEGER  | ID           |
| sender_agent  | TEXT     | 送信エージェント |
| receiver_agent| TEXT     | 受信エージェント |
| message_type  | TEXT     | メッセージタイプ |
| payload_json  | TEXT     | ペイロードJSON |
| created_at    | DATETIME | 作成日時     |

#### collaboration_sessions テーブル

| フィールド名          | データ型 | 説明          |
|----------------------|----------|---------------|
| id                   | INTEGER  | ID            |
| session_name         | TEXT     | セッション名  |
| objective            | TEXT     | 目的          |
| participating_agents | TEXT     | 参加エージェント |
| status               | TEXT     | 状態          |
| created_at           | DATETIME | 作成日時      |
| updated_at           | DATETIME | 更新日時      |

## 4. デフォルトAI社員

以下のAI社員を作成します:

- AI PM
- Sales AI
- Development AI
- Accounting AI
- Support AI
- Marketing AI
- Executive AI

## 5. エージェントの能力

### Sales AI
- リード分析
- アポイントメント戦略
- セールスコーチング

### Development AI
- コード分析
- ドキュメント化
- テスト

### Accounting AI
- 財務ワークフロー
- 請求書レビュー

### Support AI
- チケット分析
- FAQ生成

### Marketing AI
- キャンペーン計画
- コンテンツ生成

### Executive AI
- KPI分析
- ビジネスレポート
- 意思決定推奨

## 6. コラボレーションフロー

```
Task
↓
Coordinator
↓
Assign Agent
↓
(If another specialty required)
↓
Send collaboration request
↓
Receive response
↓
Continue task
↓
Complete
```

## 7. 共有コンテキスト

### 共有する情報
- 会社の頭脳
- メモリエンジン
- ナレッジグラフ

### 個別に管理する情報
- スキルレベル
- 経験
- タスクキュー
- パフォーマンス履歴

## 8. ダッシュボード

AI組織ダッシュボードを作成し、以下を表示:

- 組織図
- 現在のタスク
- 現在のステータス
- アクティブなコラボレーション
- 保留中のリクエスト
- 完了したタスク
- エージェントのワークロード

## 9. アバター統合

各AI社員に独自のMusasabiアバターを割り当てます。

| エージェント     | アバター           |
|-----------------|--------------------|
| Sales           | 青いヘッドセット  |
| Development     | 黒いフーディ      |
| Accounting      | 緑のバイザー      |
| Marketing       | 紫のノートブック  |
| Support         | オレンジのヘッドセット |
| Executive       | 金のネクタイ      |

## 10. テスト

以下の機能をテスト:

- タスクの割り当て
- コラボレーションリクエスト
- 共有コンテキストの取得
- エージェントメッセージング
- ワークロードバランシング
- 組織ダッシュボード

## 11. ドキュメント

以下のドキュメントを作成・更新:

- `docs/MULTI_AGENT_ENGINE.md`
- 更新: `README.md`
- 更新: `CHANGELOG.md`
- 更新: `docs/AI_EMPLOYEE_SKILL_ENGINE.md`

## 12. 制限事項

以下の機能は実装しないでください:

- 独立した自律的実行
- 外部メッセージング
- クラウド同期
- 自動コール実行
- 自己改変エージェント

## 13. 受け入れ基準

- 複数のAI社員が存在すること
- タスクを割り当てられること
- エージェントが協働すること
- 共有コンテキストが機能すること
- ダッシュボードが組織を表示すること
- アバターの専門化が機能すること
- テストが合格すること
- ドキュメントが更新されること

## 14. デリバラブル

### レポート内容

- 変更されたファイル
- テスト結果
- 組織ダッシュボードのスクリーンショット
- 推奨コミット

### 推奨コミットメッセージ
```
feat(brain): implement Multi-Agent Collaboration Engine
```

--- 

この技術指示書に基づいて、S6-006 マルチエージェントコラボレーションエンジンの実装を進めてください。