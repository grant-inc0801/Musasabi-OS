# 技術指示書: S7-001 Learning Mode Production

---

## 概要

この技術指示書は、Musasabi AIのLearning Modeを営業部門でプライマリ運用モードとして実装するための指針を提供します。このモードでは、AIが承認された業務活動を絶えず観察し、改善提案を行うことを目的としていますが、顧客に対するアクションを自律的に実行することはありません。

### 目的

Learning ModeのProduction版を実装します。このSprintは、後続のAutoCall Modeの基礎となります。

### ビジョン

1. Sales Activity
2. Learning Mode
3. Brain Memory
4. Knowledge Graph
5. Sales Brain
6. Recommendation
7. Human Review

---

## 必要なモジュールの設計

`packages/learning/src/` に以下のモジュールを実装します:

- **LearningModeController.ts**: Learning Modeのメイン制御を担います。
- **SessionManager.ts**: Learning Sessionの開始、休止、再開、停止を管理します。
- **ActivityCollector.ts**: 営業活動データを収集します。
- **LearningTimeline.ts**: 時系列に沿った学習タイムラインを生成します。
- **ImprovementDetector.ts**: 改善点の自動検出を行います。
- **RecommendationPublisher.ts**: 改善点の提案を行います。
- **LearningStatistics.ts**: 学習の統計情報を管理します。

---

## 学習ソース

以下の情報を学習ソースとしてサポートします:

- Zoomの電話会議メタデータ
- 通話記録
- FileMakerのリード更新
- 営業ノート
- カレンダーイベント
- タスクの完了状況
- ユーザーフィードバック

---

## 学習セッション

サポートする操作:

- 開始
- 一時停止
- 再開
- 停止

各セッションに保存される情報:

- オペレーター
- 期間
- 活動
- 学んだ内容
- 提案事項

---

## タイムライン生成

年代順の学習タイムラインを作成し、以下を表示します:

- 通話
- ノート
- ドキュメント
- タスク
- 推薦事項
- フィードバック

---

## 改善検出

以下を自動的に検出し、学習候補を生成します:

- 繰り返し現れる反対意見
- 成功した再反論
- 効果的な話の始め方
- 効果的な話の終わり方
- 共通の顧客質問
- ワークフロープロセス上のボトルネック

---

## 提案エンジン

以下を推奨します:

- スクリプト改善
- フォローアップのタイミング
- リードの優先度
- 反対意見への対応
- ワークフローの最適化

各推奨には以下の情報を含めます:

- 証拠
- 信頼度
- 予測される利益

---

## ダッシュボード

作成するダッシュボード:

- Learning Dashboard

表示項目:

- アクティブセッション
- 今日の学習
- 提案事項
- 改善の機会
- 学習トレンド
- 信頼スコア

---

## アバター統合

Learning Mode中:

1. Musasabiのノートブックのアニメーション
2. タイピング、リーディング、思考動作

提案が承認された場合:

- 喜びのアニメーション

---

## テスト

以下のテストを実装します:

- セッションライフサイクル
- タイムライン生成
- 提案生成
- 学習統計
- ダッシュボードのレンダリング

---

## ドキュメンテーション

以下のドキュメントを作成および更新します:

- `docs/LEARNING_MODE_PRODUCTION.md`
- `README.md`
- `CHANGELOG.md`

---

## 制約

以下は実装しません:

- AutoCall
- 顧客との会話
- 自動CRM更新
- 自動実行

---

## 受け入れ基準

- Learning Modeが継続的に稼働すること
- タイムラインが機能すること
- 提案が生成されること
- ダッシュボードが機能すること
- アバターがLearning Modeを反映すること
- テストが通過すること
- ドキュメントが更新されること

---

## コミット例

```markdown
feat(learning): implement production Learning Mode
```

---