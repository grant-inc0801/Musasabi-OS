```markdown
# 技術指示書: S7-005 AutoCall Preparation Center

## 目的
AutoCall Preparation Centerの実装。Musasabi AIのアウトバウンドコールの準備として、知識、スクリプト、承認、安全ルールを検証する。このスプリントではAutoCallの実行は行わない。準備、検証、シミュレーション、および承認のワークフローに焦点を当てる。

## ビジョン
1. 学習モード
2. セールスブレイン
3. 会話インテリジェンス
4. AutoCall Preparation Center
5. 安全性の検証
6. マネージャーの承認
7. AutoCall モードβ

## 必要モジュール

`packages/autocall/src/preparation/`

- `AutoCallPreparationService.ts`
- `ScriptValidator.ts`
- `SafetyValidator.ts`
- `ApprovalWorkflow.ts`
- `SimulationEngine.ts`
- `ReadinessCalculator.ts`
- `PreparationRepository.ts`

## SQLite テーブル設計

### autocall_profiles

| フィールド名       | 型            |
|------------------|--------------|
| id               | INTEGER PRIMARY KEY |
| profile_name     | TEXT          |
| campaign_name    | TEXT          |
| target_type      | TEXT          |
| script_version   | TEXT          |
| status           | TEXT          |
| readiness_score  | INTEGER       |
| created_at       | DATETIME      |
| updated_at       | DATETIME      |

### autocall_simulations

| フィールド名       | 型            |
|------------------|--------------|
| id               | INTEGER PRIMARY KEY |
| profile_id       | INTEGER       |
| simulation_name  | TEXT          |
| expected_result  | TEXT          |
| confidence       | DECIMAL       |
| risk_level       | TEXT          |
| created_at       | DATETIME      |

### autocall_approvals

| フィールド名       | 型            |
|------------------|--------------|
| id               | INTEGER PRIMARY KEY |
| profile_id       | INTEGER       |
| approver         | TEXT          |
| approval_status  | TEXT          |
| comments         | TEXT          |
| approved_at      | DATETIME      |

**ステータス**
- ドラフト (draft)
- 保留中 (pending)
- 承認済み (approved)
- 却下 (rejected)

## 準備状態の評価

### 計算項目
- スクリプトの質
- セールスブレインの信頼度
- 異議対策の完全さ
- コンプライアンスの確認
- 知識の充実度
- 学習の完成度
- リスクスコア

### 指標
- 準備状態スコア：0〜100

## スクリプト検証

### 検証項目
- 挨拶
- 資格確認
- 異議対策
- クロージング
- 法的免責事項
- コールバックの処理

欠落部分を強調表示。

## 安全性の検証

### 検証項目
- 人の承認があること
- 承認されたキャンペーンであること
- 承認されたスクリプトであること
- 承認された営業時間内であること
- 承認されたコールターゲットであること

必要要件が欠けている場合は拒否。

## シミュレーションモード
- バーチャルコールシミュレーションをサポート
- 期待される会話の流れ、異議、推奨される応答、信頼度、予想成約率を表示
- 実際のコールは行わない

## 承認ワークフロー

- マネージャーは承認、却下、修正依頼が可能
- 承認履歴を保存すること

## ダッシュボード

### 作成内容
AutoCall Preparation Dashboard

### 表示項目
- 準備状態スコア
- スクリプトステータス
- 安全ステータス
- シミュレーション結果
- 保留中の承認
- 承認履歴

## アバター統合

- **準備:** ノートブックアニメーション
- **シミュレーション:** 考えているアニメーション
- **承認済み:** 祝福アニメーション
- **却下:** 懸念のアニメーション

## テスト
以下をテスト形式で実装：
- 準備状態の計算
- スクリプトの検証
- 安全性の検証
- シミュレーションの生成
- 承認ワークフロー
- ダッシュボードのレンダリング

## ドキュメント

- `docs/AUTOCALL_PREPARATION_CENTER.md` を作成
- `README.md` と `CHANGELOG.md` を更新

## 制約

以下は実装しない：
- 実際のアウトバウンドコール
- 音声合成
- 音声認識
- 顧客とのインタラクション
- 自動キャンペーンの実行
- 自動承認

## 受入基準

- Preparation Centerが実装されていること
- 準備状態スコアが計算されていること
- シミュレーションが動作すること
- 承認ワークフローが動作すること
- ダッシュボードが動作すること
- アバターが正しく反応すること
- テストがすべて通過すること
- ドキュメントが更新されていること

## 成果物

- 変更されたファイルのレポート
- テスト結果
- ダッシュボードのスクリーンショット
- 推奨コミット

### 推奨コミット
```
feat(autocall): implement AutoCall Preparation Center
```
```