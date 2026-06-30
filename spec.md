```markdown
# 技術指示書: S4-002 Smart Lead Prioritization Engine

## 1. タスク目的

**目的**:
Smart Lead Prioritization Engine を実装します。
単純なリードリストを表示する代わりに、MUSA は最も高い予約の可能性を持つリードを判断し、最適なコール順序を生成します。次に「誰に電話するか」の判断は営業担当者が行うのではなく、MUSA が決定します。

---

## 2. ビジョン

- **FileMaker**
- **Lead Information**
- **Sales Brain**
- **Learning Records**
- **Lead Prioritization Engine**
- **Today's Call Queue**

---

## 3. 必要モジュール

ディレクトリ: `packages/lead-priority/`

- **src/**
  - `leadPriorityService.js`
  - `priorityCalculator.js`
  - `scoringRules.js`
  - `recommendationGenerator.js`
  - `queueGenerator.js`
  - `index.js`

---

## 4. データベース構造

### SQLite テーブル設定

1. **lead_priority_history**
   - id
   - lead_id
   - priority_score
   - priority_rank
   - appointment_probability
   - confidence
   - reason
   - created_at

2. **daily_call_queue**
   - id
   - lead_id
   - queue_order
   - recommendation
   - estimated_duration
   - estimated_success_rate
   - created_at

---

## 5. スコア計算

**スコアの元情報**:
- 過去の会話
- 折り返しの履歴
- 未応答のコール数
- 業界
- 事業規模
- 既存の知識
- ベストトークの類似性
- 異議の類似性
- 最後の接触からの時間

**生成するもの**:
- Priority Score: 0〜100

---

## 6. キュー生成

**タイミング**:
- 毎朝生成

**表示**:
- 今日のコールキュー

**並び順**:
- 最高予想予約確率による

**表示項目**:
- 順位
- 会社
- 電話番号
- 理由
- 予想予約率
- 予想異議
- 推奨オープニング
- 次のアクション

---

## 7. MUSA の推奨事項

**例**: 
- この会社に最初に電話をかけてください。

**理由**:
- 最近コールバックをリクエストしました。
- 類似企業の予約率が 78% です。
- オープニングパターン #3 を使用。

---

## 8. ダッシュボード

**表示**:
- 今日のキュー
- 平均確率
- 予想予約数
- 高優先度リード
- 低優先度リード
- スキップされたリード

---

## 9. 自動更新

**タイミング**:
- コール完了後
- トランスクリプト保存後
- リード更新後
- コールバック設定後

**自動再計算**:
- Priority Score
- Appointment Probability
- Queue Order

---

## 10. テスト

**実装項目**:
- 優先度計算
- キュー生成
- 推奨生成
- 自動再計算
- ダッシュボード更新

---

## 11. ドキュメントの更新

- `README.md`
- `CHANGELOG.md`
- `docs/LEAD_PRIORITY.md`

---

## 12. 制限事項

実装してはいけない機能:
- AutoCall
- Voice AI
- 外部API
- LLM reasoning

**使用するロジック**:
- すべて決定論的ロジック

---

## 13. 受け入れ基準

- Priority Scoreの計算完了
- デイリーキューの生成完了
- 推奨事項が表示される
- キューの自動更新
- ダッシュボードの正常動作
- テストがすべて合格
- READMEの更新

---

## 14. 納品物

**レポート内容**:
- 変更ファイル
- テスト結果
- 推奨コミット

自動プッシュは行わない

**推奨コミットメッセージ**:
```
feat(sales): implement smart lead prioritization engine
```
```