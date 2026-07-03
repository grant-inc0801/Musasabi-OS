```markdown
# 技術指示書: S6-005 AI Employee Skill Engine

## 目的
Musasabi OS での AI Employee Skill Engine の実装を行います。各AI社員が経験を積み、特定のスキルを向上させ、自身のパフォーマンス履歴を構築しながらCompany Brainを通じて会社の知識を共有します。これにより、専門的なAI社員が作成されます。

## ビジョンフロー
1. Learning Engine
2. Memory Engine
3. Knowledge Graph
4. **Skill Engine**
5. AI Employee
6. Decision Engine
7. Avatar

## 必要モジュール
以下のディレクトリにモジュールを実装します:
`packages/brain/src/skills/`
- `SkillEngine.ts`
- `SkillRepository.ts`
- `SkillCalculator.ts`
- `ExperienceEngine.ts`
- `SkillLevelService.ts`
- `RecommendationEngine.ts`
- `SkillHistory.ts`
- `index.ts`

## データベース設定
### SQLite テーブル作成
#### ai_employees
- `id`
- `employee_name`
- `department`
- `role`
- `level`
- `experience`
- `current_status`
- `created_at`
- `updated_at`

#### employee_skills
- `id`
- `employee_id`
- `skill_name`
- `level`
- `experience`
- `confidence`
- `last_updated`

#### employee_skill_history
- `id`
- `employee_id`
- `skill_name`
- `previous_level`
- `new_level`
- `gained_experience`
- `event_source`
- `created_at`

## 初期部門
- サポート
- 営業
- 開発
- カスタマーサポート
- 会計
- 管理
- マーケティング
- 経営

## 初期スキルセット
### 営業
- コールドコール
- 異議処理
- クロージング
- 交渉
- 聞くスキル

### 開発
- アーキテクチャ
- TypeScript
- React
- Rust
- テスト
- ドキュメント作成

### ジェネラル
- 学習
- 記憶
- 意思決定
- コミュニケーション
- 分析

## 経験ルール
以下のアクションで経験値を獲得:
- 完了したタスク
- 承認された学習
- 成功したアポイントメント
- ユーザーフィードバック
- ドキュメントの質
- レビューの質

## レベルシステム
- レベル1から100まで存在
- 必要な経験値は徐々に増加

## スキル推薦
特定のタスクを繰り返し実行する場合、関連スキルの向上を推奨します。
例えば、営業AIが異議処理で多くの成功を収めた場合、異議処理スキルを強化します。

## 従業員ダッシュボード
AI社員プロフィールを作成し、以下を表示:
- 名前
- 部門
- レベル
- 経験
- スキルツリー
- 最近の成長
- 主要スキル
- 現在のタスク
- パフォーマンス履歴

## アバターの統合
専門分野に応じてアバターがわずかに変化:
- 営業: ヘッドセット
- 開発: ラップトップ
- 会計: 電卓
- サポート: ノート
- 経営: スーツアクセサリー

## テスト
以下のテストを実装:
- 経験値の獲得
- レベルアップ
- スキルの成長
- 履歴の作成
- 推奨の生成
- ダッシュボードのレンダリング

## ドキュメント
以下を作成および更新:
- `docs/AI_EMPLOYEE_SKILL_ENGINE.md`
- `README.md`
- `CHANGELOG.md`
- `docs/BRAIN_MEMORY_ENGINE.md`

## 制限事項
実装しない項目:
- 自律的な昇格
- 給与計算
- 外部HRシステム
- AutoCallの実行
- LLM自律計画

## 受入基準
- AI社員の存在
- スキルの追跡
- 経験の蓄積
- レベルの正しい増加
- スキル履歴の保存
- ダッシュボードでの社員成長の表示
- アバターが専門性を反映
- テストの合格
- ドキュメントの更新完了

## 納品物
- 変更されたファイル群の報告
- テスト結果
- AI Employeeダッシュボードのスクリーンショット
- 推奨コミットメッセージ

### 推奨コミット
```
feat(brain): implement AI Employee Skill Engine
```
```