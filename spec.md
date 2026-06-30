# 技術指示書

## 概要

この技術指示書は、MUSA（Musasabi AI）の最速の内部MVPバージョンを実装するためのガイドラインを提供します。このプロジェクトでは、MUSAが以下の機能を提供できるようにします：

- MUSA Chat
- ローカル知識
- 知識ベースの応答
- タスクメモ
- 会話履歴
- シンプルなデスクトップナビゲーション

## 実装範囲

### 主要機能の実装

1. MUSA Chat UI
2. 知識登録
3. 知識検索
4. 知識ベースに基づくMUSAの応答
5. タスクメモ管理
6. 会話履歴
7. シンプルなデスクトップナビゲーション

### デスクトップナビゲーション

以下のナビゲーション項目を追加:

- Home
- MUSA Chat
- 知識
- タスク
- 設定

### SQLite テーブル構造

次のテーブルを作成：

- knowledge_items
  - id
  - title
  - category
  - content
  - tags_json
  - created_at
  - updated_at

- tasks
  - id
  - title
  - description
  - status
  - due_date
  - created_at
  - updated_at

- chat_messages
  - id
  - role
  - content
  - source
  - created_at

### モジュール構成

以下のモジュールを作成：

- 知識管理：`packages/knowledge/src/`
  - knowledgeRepository.js
  - knowledgeService.js
  - index.js

- タスク管理：`packages/tasks/src/`
  - taskRepository.js
  - taskService.js
  - index.js

- チャット管理：`packages/chat/src/`
  - chatRepository.js
  - chatService.js
  - musaResponder.js
  - index.js

## MUSA チャット要件

ユーザーがメッセージを送信した場合：

1. ユーザーメッセージを保存
2. ローカルのknowledge_itemsを検索
3. 必要であれば、memory_recordsを検索
4. MUSAの応答を生成
5. アシスタントの応答を保存

## 応答フォーマット

関連する知識が存在する場合：

```
MUSA:

{answer}

参照:

- {knowledge title}
```

関連する知識が存在しない場合：

```
MUSA:

まだ関連する社内ナレッジが見つかりませんでした。
必要であればKnowledgeに情報を追加してください。
```

## オプションのOpenAI連携

`OPENAI_API_KEY` がローカル環境に存在する場合：

- オプションでLLMアシスト付き応答を許可
- APIキーを公開しない
- APIキーをログに記録しない
- エラー時にローカル応答にフォールバック

OpenAIはアプリの起動に必要であってはならない。

## タスク管理

タスクのフィールド：

- title
- description
- status
- due_date
- created_at

ステータス：

- todo
- doing
- done

ユーザーは：

- タスクを作成
- タスクリストを表示
- タスクを完了済みにマーク

## デスクトップUIの受け入れ要件

アプリは次を許可する：

- 知識を追加
- 知識リストを表示
- MUSAとチャット
- ローカル知識に基づくMUSAの応答を見る
- タスクを追加
- タスクリストを見る
- タスクを完了済みにマーク
- 会話履歴を表示

## テスト

以下のテストを追加：

- 知識の作成
- 知識の検索
- タスクの作成
- タスクのステータス更新
- チャットメッセージの保存
- MUSAのフォールバック応答
- MUSAの知識応答
- デスクトップのブートストラップ

## ドキュメント

更新：

- README.md
- CHANGELOG.md

READMEには以下を含める：

- アプリの起動方法
- 知識の追加方法
- MUSAとのチャット方法
- タスクの作成方法
- オプションのOPENAI_API_KEYの設定方法

## 制限事項

以下を実装しない：

- ユーザーアカウント
- クラウド同期
- Supabase
- マルチエージェント
- マーケットプレイス
- プラグインストア
- 複雑な承認
- 高度なワークフロー
- 外部統合

## 受け入れ基準

- アプリが起動する
- ユーザーが知識を追加できる
- ユーザーが知識を閲覧できる
- ユーザーがMUSAとチャットできる
- MUSAがローカル知識を参照できる
- ユーザーがタスクを作成できる
- ユーザーがタスクを完了済みにマークできる
- 会話履歴が保存される
- OPENAI_API_KEYがオプションである
- npmテストが合格する
- READMEが更新される
- CHANGELOGが更新される

## 成果物

報告：

- 変更されたファイル
- テスト結果
- 何らかのエラー
- 提案されたコミットメッセージ

GitHubにプッシュしないこと。

提案されたコミットメッセージ：

`feat(mvp): add internal MUSA chat knowledge and task MVP`