# 技術指示書

## タスク: S4-005 Daily Sales Command Center

### 目的

Daily Sales Command Centerを実装します。このダッシュボードはテレマーケティング営業部門における朝の指示板となります。MUSAはチームに以下を伝えるべきです：

- 今日のコール優先順位
- 予想されるアポイントメント
- 現在の進捗状況
- リスク
- ベストな話し方のパターン
- コーチングの焦点
- 次のアクション

---

### ビジョン

```txt
Sales Data → Lead Priority → Appointment Forecast → Sales Brain → MUSA Sales Manager → Daily Sales Command Center
```

---

### 必要なモジュール

プロジェクトディレクトリ構造は以下の通りです。

```plain
packages/sales-command-center/
└── src/
    ├── commandCenterService.js
    ├── dailySummaryService.js
    ├── salesProgressService.js
    ├── riskDetector.js
    ├── focusRecommendationService.js
    └── index.js
```

---

### SQLite データベース

以下の構造でテーブル `daily_sales_command_reports` を作成します。

- `id`: プライマリキー
- `report_date`: レポートの日付
- `expected_calls`: 予想されるコール数
- `expected_appointments`: 予想されるアポイント数
- `current_calls`: 現在のコール数
- `current_appointments`: 現在のアポイント数
- `appointment_rate`: アポイント率
- `risk_summary`: リスク要約
- `focus_recommendation`: 推奨される焦点
- `created_at`: 作成日時
- `updated_at`: 更新日時

---

### ダッシュボードセクション

#### 1. 今日のミッション

表示項目：
- 今日の目標コール数
- 今日の目標アポイント数
- 予想されるアポイント数
- 推奨されるフォーカス

---

#### 2. 優先コールキュー

表示項目：
- ランク
- 会社/店舗名
- 電話番号
- アポイントメントの確率
- 理由
- 推奨されるオープニング
- 予想される反論
- 推奨される反論

---

#### 3. 現在の進捗

表示項目：
- 完了したコール数
- 獲得したアポイント数
- コールバック数
- 興味ありの数
- 無応答の数
- アポイント率

---

#### 4. リスクアラート

検出し表示する：
- コール数が少なすぎる
- アポイント率が低い
- 無応答が多い
- 反論が多い
- コールバックを逃した
- 質の低い文字起こし

---

#### 5. MUSAマネージャーの助言

生成する：
- 次に何をすべきか
- 次に誰がコールするべきか
- どのスクリプトを使用するべきか
- どの反論に備えるべきか
- 今日の改善方法

---

### 自動更新

ダッシュボードは次の場合に更新されるべきです：
- コール履歴が保存されたとき
- リードのステータスが変更されたとき
- アポイントメント予測が変更されたとき
- デイリーキューが変更されたとき
- 文字起こしが保存されたとき
- コーチングの推奨が更新されたとき

---

### テスト

以下を対象にテストを実施：
- 日次レポート生成
- 進捗計算
- リスク検出
- フォーカス推奨
- コマンドセンターダッシュボードデータ
- 自動更新トリガー/イベント
- UIブートストラップ

---

### ドキュメント

以下を更新：
- README.md
- CHANGELOG.md
- docs/DAILY_SALES_COMMAND_CENTER.md

---

### 制限事項

実装しない機能：
- AutoCall
- 音声AI
- 外部API
- LLM推論
- クラウドダッシュボード

決定論的なローカルロジックのみを使用。

---

### 受け入れ基準

- Daily Sales Command Centerが利用可能であること
- 今日のミッションが表示されること
- 優先コールキューが表示されること
- 現在の進捗状況が表示されること
- リスクアラートが表示されること
- MUSAマネージャーの助言が表示されること
- 営業活動の後にダッシュボードが更新されること
- テストが合格すること
- ドキュメントが更新されていること

---

### 納品物

報告内容：
- 変更されたファイル
- テスト結果
- 推奨コミットメッセージ

自動プッシュしないこと。

#### 推奨コミットメッセージ

```
feat(sales): implement daily sales command center
```