```markdown
# 技術指示書: Company Knowledge Graphの実装

## 概要

本指示書はMusasabi OSの中央知識層であるCompany Knowledge Graphの実装に関する詳細を提供します。Musasabi AIが社員、顧客、企業、通話、文書、会議、プロジェクト、タスクなどの間の関係を理解できるように構築します。

## ビジョン

1. Memory Engine
2. Knowledge Graph
3. AI Employees
4. Sales Brain
5. Company Brain
6. Decision Engine
7. Musasabi Avatar

## 必須モジュール

以下のファイルを `packages/brain/src/knowledge/` ディレクトリに実装します。

- `KnowledgeGraph.ts`
- `GraphRepository.ts`
- `GraphBuilder.ts`
- `GraphSearch.ts`
- `RelationshipEngine.ts`
- `EntityResolver.ts`
- `GraphVisualizer.ts`

## データベース (SQLite)

### テーブルの作成

#### knowledge_nodes

- `id`: プライマリキー
- `node_type`: ノードの種類
- `node_name`: ノードの名前
- `description`: 説明
- `source`: データのソース
- `created_at`: 作成日時
- `updated_at`: 更新日時

#### knowledge_edges

- `id`: プライマリキー
- `source_node_id`: ソースノードID
- `target_node_id`: ターゲットノードID
- `relationship_type`: 関係の種類
- `confidence`: 確信度
- `created_at`: 作成日時

#### knowledge_tags

- `id`: プライマリキー
- `node_id`: ノードID
- `tag`: タグ

## ノードタイプ

サポート対象:

- Company
- Customer
- Store
- Employee
- AI Employee
- Project
- Task
- Document
- Meeting
- Call
- Product
- Service
- Calendar Event
- Opportunity
- Campaign

## 関係タイプ

サポート対象:

- owns
- works_for
- assigned_to
- called
- purchased
- created
- related_to
- depends_on
- belongs_to
- learned_from
- scheduled_with
- reports_to

## 自動グラフ生成

以下のイベントにより自動生成:

- Learning Modeが知識を保存
- FileMakerが顧客をインポート
- Zoom Phoneが通話を生成
- カレンダーがイベントを生成
- ドキュメントがインポートされる

実行する処理:

- ノードの作成
- 関係の作成
- グラフの更新

## グラフ検索機能

サポート項目:

- キーワード
- ノードタイプ
- 関係
- タイムライン
- 接続されたエンティティ
- 最短関係経路

## Company Explorer UI

作成: Company Knowledge Explorer

表示機能:

- グラフビュー
- エンティティリスト
- 関係リスト
- タイムライン
- 検索
- 接続ノード
- AI提案

## AI統合

- Sales Brain → Customer Relationships
- Company Brain → Organization Structure
- Learning Engine → Knowledge Links
- Decision Engine → Context Retrieval
- Avatar → Context Awareness

## テスト項目

実施:

- ノード作成
- 関係作成
- 重複エンティティの統合
- グラフ検索
- グラフ視覚化データ生成
- 関係の移動

## ドキュメントの作成/更新

- 作成: `docs/COMPANY_KNOWLEDGE_GRAPH.md`
- 更新: `README.md`, `CHANGELOG.md`, `docs/BRAIN_MEMORY_ENGINE.md`

## 制約事項

以下は実装しません:

- 外部グラフデータベース
- クラウド同期
- LLM推論
- AutoCall

ローカルナレッジグラフのみを使用します。

## 受け入れ基準

- Knowledge Graphが実装されている
- ノードが自動的に作成される
- 関係が自動的に作成される
- 検索機能が動作する
- グラフエクスプローラーが動作する
- AIモジュールがグラフをクエリできる
- テストがすべて通過する
- ドキュメントが更新されている

## 納品物

- 変更されたファイルのレポート
- テスト結果
- グラフエクスプローラーのスクリーンショット
- 推奨コミット

### 推奨コミット

```
feat(brain): implement Company Knowledge Graph
```
```