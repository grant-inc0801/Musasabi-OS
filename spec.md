# 技術指示書: S4-003 Real-Time Sales Coach

## 概要

この技術指示書は、S4-003 Real-Time Sales Coach 機能の実装に関する詳細なガイダンスを提供します。この機能は、営業担当者がライブ通話中に顧客情報や過去のやり取り、蓄積したSales Brainの知識に基づいて動的なコーチングを受けられることを目的としています。これにより、トレーニング時間の短縮、アポイントメント率の向上、成功する営業行動の標準化を目指します。

---

## ビジョン

1. **Customer** → 
2. **Lead Information** → 
3. **Sales Brain** → 
4. **Company Brain** → 
5. **Learning History** → 
6. **MUSA Real-Time Coach** → 
7. **Sales Representative**

---

## 必要モジュール

プロジェクトディレクトリ構造は以下の通りです。

- **packages/sales-coach/**
- **src/**
  - `coachingService.js`
  - `liveRecommendationEngine.js`
  - `objectionPredictor.js`
  - `rebuttalGenerator.js`
  - `nextActionAdvisor.js`
  - `confidenceCalculator.js`
  - `index.js`

---

## SQLiteテーブル設計

### live_coaching_sessions

| Column        | Type   |
|---------------|--------|
| id            | INTEGER PRIMARY KEY |
| lead_id       | INTEGER |
| operator_id   | INTEGER |
| started_at    | DATETIME |
| ended_at      | DATETIME |
| overall_score | INTEGER |
| result        | TEXT   |

### live_recommendations

| Column             | Type   |
|--------------------|--------|
| id                 | INTEGER PRIMARY KEY |
| session_id         | INTEGER |
| recommendation_type| TEXT   |
| recommendation     | TEXT   |
| confidence         | REAL   |
| displayed_at       | DATETIME |

---

## コーチングパネル

以下の情報を表示します。

- 現在の顧客
- 現在のステータス
- 推奨オープニング
- 予測される反論
- 推奨される反駁
- 推奨質問
- 推奨クロージング
- 次のアクション
- 信頼度

---

## 動的コーチング

以下の状況で推奨事項を更新します。

- リード情報の変更
- 通話履歴の変更
- トランスクリプトの編集
- ヒアリングノートの変更

ページのリフレッシュは不要です。

---

## 反論予測

以下に基づいて反論を予測します。

- 業界
- 会社規模
- 過去の会話
- Sales Brainのパターン
- 類似企業

予想される反論のトップ5を表示します。

---

## 反駁の推奨

以下に基づいて最適な反駁を表示します。

- 成功率
- 類似業界
- アポイントメント履歴
- Sales Brainランキング

---

## ライブKPI

以下の情報を表示します。

- 現在の通話時間
- 今日の通話数
- 今日のアポイントメント数
- 今日のアポイントメント率
- 現在の信頼度

---

## 学習機能

通話終了時に以下を自動的に保存します。

- 表示された推奨事項
- 使用された推奨事項
- 最終結果
- コーチングの効果

これらをSales Brainにフィードバックします。

---

## テスト

以下のテストを実装します。

- コーチングセッションの作成
- 推奨事項の生成
- 反論の予測
- 反駁の推奨
- 自動更新
- 学習記録の作成

---

## ドキュメント

以下を更新します。

- `README.md`
- `CHANGELOG.md`
- `docs/REALTIME_SALES_COACH.md`

---

## 制約事項

実装しない事項：

- 音声解析
- 音声認識
- 自動通話
- 外部API
- 大規模言語モデル(LLM)による推論

既存の会社知識を用いた確定的なロジックのみを使用します。

---

## 受入基準

- ライブコーチングパネルが動作すること
- 推奨事項が自動的に更新されること
- 反論の予測が機能すること
- 反駁が適切に推奨されること
- 学習記録が生成されること
- ダッシュボードが正しく更新されること
- テストがすべて通過すること
- ドキュメントが更新されること

---

## 納品物

レポート：

- 変更ファイル
- テスト結果
- 推奨コミットメッセージ

自動でプッシュしないでください。

推奨コミットメッセージ:

```
feat(sales): implement real-time sales coach
```