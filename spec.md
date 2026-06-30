```markdown
# 技術指示書: S3-002 Sales Intelligence Engine

## タスク概要
**タスク名**: S3-002 Sales Intelligence Engine  
**詳細**: Sales Intelligence Engineを実装し、Musasabi AIの中心的な学習エンジンを開発します。このエンジンは、営業活動から継続的に学習を行い、コーチング、異議処理、将来的なAutoCallのパフォーマンスを改善します。

---

## ビジョン
1. Zoom Phone
2. Call Transcript
3. Sales Intelligence Engine
4. Company Brain
5. Knowledge
6. MUSA Coach
7. Future AutoCall

---

## 学習モード
- **デフォルトで有効化**: 学習モードはデフォルトで有効です。
- **機能**:
  - トランスクリプトの分析
  - 顧客の反応の分析
  - 異議の検出
  - 成功した反論の検出
  - クロージングの分析
  - コーチングの生成
  - 学習した知識の保存
  - Company Brainの更新

- **制約**: 学習モードは決して電話をかけません。

---

## 必要モジュール
`packages/sales-intelligence/src/`に以下のモジュールを配置します:
- transcriptAnalyzer.js
- objectionDetector.js
- rebuttalAnalyzer.js
- closingAnalyzer.js
- coachingEngine.js
- learningEngine.js
- knowledgeExporter.js
- index.js

---

## データベース設計 (SQLite)
**sales_learning_records テーブル**
- 列: id, transcript_id, lead_id, objection, rebuttal, closing, result, score, created_at

**sales_coaching テーブル**
- 列: id, transcript_id, recommendation, priority, category, created_at

---

## 得点生成
各種スコア（0〜100点）を以下に生成:
- Tone Score
- Reaction Score
- Listening Score
- Question Score
- Closing Score
- Overall Score

---

## 知識管理
1. 成功した会話
2. Knowledge Candidate
3. Company Brain

**Note**: 知識候補は自動的に作成され、公開には人間の承認が必要です。

---

## ダッシュボード
以下の情報を表示:
- 今日の通話
- 学習記録
- 平均スコア
- トップの異議
- トップのクロージングパターン
- 知識候補

---

## MUSAコーチ
各トランスクリプト後に表示:
- 強み
- 弱み
- 改善点
- 推奨スクリプト
- 次回の通話アドバイス

---

## テスト実装
以下を実装:
- トランスクリプト分析
- 異議検出
- 反論抽出
- コーチング生成
- スコア計算
- 知識候補生成

---

## ドキュメント
以下のドキュメントを作成:
- README
- CHANGELOG
- docs/SALES_INTELLIGENCE.md

---

## 制約
**実装しないもの**:
- AutoCall
- 音声生成
- 自律営業
- 顧客へのコール

**主に学習機能のみに限定**。

---

## 受け入れ基準
- 学習モードが動作すること。
- トランスクリプトからのコーチング生成。
- 知識候補が作成されること。
- ダッシュボードに学習の進捗が表示されること。
- テストが通過すること。
- READMEが更新されること。

---

## 推奨コミットメッセージ
```
feat(sales): implement Sales Intelligence Engine
```
```