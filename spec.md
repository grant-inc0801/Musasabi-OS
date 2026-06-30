以下にタスク「S4-007 AutoCall Readiness & Human Approval Framework」を実装する際の技術指示書をMarkdown形式で作成しました。

```markdown
# 技術指示書: S4-007 AutoCall Readiness & Human Approval Framework

## 概要

このSprintでは、AutoCall機能の準備と人間による承認フレームワークを実装します。AIによる自動通話は今回実装しません。リードがAutoCallに適しているかを判断し、将来の自動通話機能の実行前に必要なすべての人間承認と安全チェックを満たすことを目的とします。

## ビジョン

```
Sales Brain
↓
Lead Score
↓
Appointment Prediction
↓
Risk Evaluation
↓
Human Approval
↓
AutoCall Queue (Disabled)
```

## 必須モジュール

**ディレクトリ構造:**

- `packages/autocall/`
- `src/`
  - `readinessService.js`
  - `readinessEvaluator.js`
  - `approvalGate.js`
  - `riskAssessmentService.js`
  - `queuePreparationService.js`
  - `campaignManager.js`
  - `index.js`

## データベース: SQLite

### テーブル設計

#### autocall_campaigns
- `id`
- `campaign_name`
- `status`
- `appointment_limit`
- `working_hours_start`
- `working_hours_end`
- `created_at`
- `updated_at`

#### autocall_candidates
- `id`
- `lead_id`
- `readiness_score`
- `risk_score`
- `approval_status`
- `campaign_id`
- `created_at`

#### autocall_audit_logs
- `id`
- `lead_id`
- `event`
- `detail_json`
- `created_at`

## 機能詳細

### Readiness Score
0〜100のスコアを生成し、以下の要素を使用します。
- Appointment Probability
- Lead Score
- Transcript Quality
- Previous Call History
- Callback Status
- Sales Brain Confidence

### Risk Evaluation
リスクを「Low」「Medium」「High」で評価し、以下のパターンを検出します。
- 繰り返しの未応答通話
- 過度な通話頻度
- 欠落した顧客情報
- 不完全なトランスクリプト履歴
- 不十分な学習信頼度

### Human Approval
AutoCallを有効にするための条件:
- 管理者による承認
- キャンペーンの存在
- 設定されたアポイントメント制限
- 設定された営業時間
- 緊急停止が有効

### Campaign Management
管理者がキャンペーンを作成できるようにします。 

**フィールド:**
- Campaign Name
- Appointment Limit
- Working Hours
- Target Industry
- Target Region
- Status

**ステータス:**
- Draft
- Ready
- Running
- Paused
- Completed
- Cancelled

### ユーザーインターフェース (UI)
AutoCall Readinessスクリーンを作成し、以下を表示します。
- Campaigns
- Readiness Score
- Risk Score
- Approval Status
- Candidates
- Appointment Limit
- Emergency Stop Status

### 学習モードの互換性
学習モードはアクティブなままで、AutoCallは無効です。以下のアクション後にReadinessが継続的に再計算されます。
- トランスクリプトの保存
- リードの更新
- アポイントメント予測の更新
- 学習の更新

## テスト

以下のテストを実装します。
- Readinessの計算
- リスクの計算
- 承認の検証
- キャンペーン作成
- アポイントメント制限の検証
- 緊急停止の検証
- Readinessのリフレッシュ

## ドキュメンテーション

以下を更新します。
- `README.md`
- `CHANGELOG.md`
- `docs/AUTOCALL_READINESS.md`

## 制約事項

以下の実装は禁止されています。
- 自動発信通話
- ボイスAI
- 音声合成
- 顧客との会話
- Zoom Phoneの通話実行
- 外部のテレフォニーAPI

## 受け入れ基準

- Readiness Scoreが計算されていること
- Risk Scoreが計算されていること
- 人間承認ワークフローが機能していること
- キャンペーン管理が機能していること
- ダッシュボードにReadinessが表示されていること
- AutoCallが無効のままであること
- テストが合格していること
- ドキュメンテーションが更新されていること

## デリバラブル

**レポート内容:**
- 変更されたファイル
- テスト結果
- 推奨コミットメッセージ

自動プッシュは行わないでください。

**推奨コミットメッセージ:**
```
feat(autocall): implement AutoCall readiness and approval framework
```
```

この技術指示書は、実装者が理解しやすく、必要なすべての情報を含んでいることを目的としています。