# 技術指示書: S7-003 Sales Conversation Intelligence Engine

## 目次

1. [概要](#概要)
2. [ビジョン](#ビジョン)
3. [必要モジュール](#必要モジュール)
4. [データベース設計 (SQLite)](#データベース設計-sqlite)
5. [分析機能](#分析機能)
6. [パターン検出](#パターン検出)
7. [レコメンデーションエンジン](#レコメンデーションエンジン)
8. [ダッシュボード](#ダッシュボード)
9. [Sales Brain統合](#sales-brain統合)
10. [アバター統合](#アバター統合)
11. [テスト](#テスト)
12. [ドキュメント](#ドキュメント)
13. [制約事項](#制約事項)
14. [受け入れ基準](#受け入れ基準)
15. [成果物](#成果物)

---

## 概要

本技術指示書は、S7-003「Sales Conversation Intelligence Engine」の実装に関する詳細を記載しています。このエンジンはセールス会話を分析し、成功したコールを企業知識として再利用するためのものです。本スプリントでは分析にのみ注力します。

## ビジョン

1. Zoom Phone
2. Transcript
3. Conversation Intelligence
4. Sales Brain
5. Learning Engine
6. Company Brain
7. Recommendation

## 必要モジュール

`packages/sales-intelligence/src/`に以下のファイルを実装:

- ConversationEngine.ts
- TranscriptAnalyzer.ts
- ObjectionDetector.ts
- ClosingDetector.ts
- QuestionAnalyzer.ts
- TalkRatioAnalyzer.ts
- SuccessPatternEngine.ts
- ConversationRepository.ts

## データベース設計 (SQLite)

### conversation_analysis テーブル

| フィールド名             | 型          |
| ----------------------- | ----------- |
| id                      | INTEGER     |
| call_session_id         | TEXT        |
| transcript_id           | TEXT        |
| lead_id                 | TEXT        |
| operator                | TEXT        |
| overall_score           | REAL        |
| appointment_probability | REAL        |
| created_at              | DATETIME    |
| updated_at              | DATETIME    |

### conversation_patterns テーブル

| フィールド名   | 型       |
| ------------- | -------- |
| id            | INTEGER  |
| analysis_id   | INTEGER  |
| pattern_type  | TEXT     |
| title         | TEXT     |
| description   | TEXT     |
| confidence    | REAL     |
| created_at    | DATETIME |

### conversation_objections テーブル

| フィールド名   | 型       |
| ------------- | -------- |
| id            | INTEGER  |
| analysis_id   | INTEGER  |
| objection     | TEXT     |
| response      | TEXT     |
| outcome       | TEXT     |
| confidence    | REAL     |

## 分析機能

サポート内容

- 開始品質
- 質問の質
- 聞き取り比率
- 話す比率
- 異議処理
- 終了品質
- 顧客の関心
- 顧客感情 (ルールベース)
- アポイントメントシグナル

## パターン検出

検出内容

- 成功した開始
- 成功した反駁
- 成功した終了
- 失われた機会
- 弱い質問
- 強い質問
- 高い関心
- 低い関心
- 次のフォローアップチャンス

## レコメンデーションエンジン

生成内容

- より良い開始
- より良い質問
- より良い反駁
- より良い終了
- より良いフォローアップ時間

各推奨には以下を含む

- 証拠
- 信頼性
- 予想される改善点

## ダッシュボード

作成内容

- Sales Conversation Dashboard

表示内容

- 全体スコア
- 開始スコア
- 聞き取りスコア
- 話す比率
- 異議
- 終了スコア
- AIの推奨
- ベストモーメント
- 改善ポイント

## Sales Brain統合

承認された成功した会話は、

1. Sales Brainの知識になる
2. 将来のコーチング
3. 将来のAutoCall学習

## アバター統合

- 分析中: Thinkingアニメーション
- 分析完了: Notebookアニメーション
- 高得点: Celebrationアニメーション
- 低得点: Thinking + 推奨バブル

## テスト

実装内容

- トランスクリプト分析
- 異議検出
- 話す比率計算
- 推奨生成
- ダッシュボード描画
- Sales Brainエクスポート

## ドキュメント

作成内容

- docs/SALES_CONVERSATION_INTELLIGENCE.md

更新内容

- README.md
- CHANGELOG.md

## 制約事項

実装禁止項目

- 大規模言語モデルの自律呼び出し
- 顧客会話
- AutoCall実行
- 音声認識
- 音声生成

## 受け入れ基準

- 会話分析が動作する
- スコアが計算される
- 異議が検出される
- 推奨が生成される
- ダッシュボードが機能する
- Sales Brain統合が機能する
- アバターが正しく反応する
- テストが通る
- ドキュメントが更新される

## 成果物

レポート内容

- 変更されたファイル
- テスト結果
- ダッシュボードのスクリーンショット
- 推奨コミット

推奨コミット

```plaintext
feat(sales): implement Sales Conversation Intelligence Engine
```