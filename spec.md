```markdown
# 技術指示書: Learning Engine v2

## 目的
Learning Engine v2の実装により、日々の活動、営業電話、ドキュメント、タスク、会議、ユーザーフィードバックを構造化された学習記録に変換し、Memory Engine、Knowledge Graph、Sales Brain、Company Brainを更新します。本エンジンは、Musasabi AIが内部的に使用される際に改善を促すコアメカニズムです。

## ビジョン
```plaintext
ユーザー活動
↓
学習キャプチャ
↓
学習エンジン
↓
メモリエンジン
↓
ナレッジグラフ
↓
企業ブレイン
↓
AI従業員
```

## 必要なモジュール
- `packages/brain/src/learning/LearningEngine.ts`
- `packages/brain/src/learning/LearningCapture.ts`
- `packages/brain/src/learning/LearningClassifier.ts`
- `packages/brain/src/learning/LearningCandidateRepository.ts`
- `packages/brain/src/learning/LearningApprovalService.ts`
- `packages/brain/src/learning/LearningExporter.ts`
- `packages/brain/src/learning/LearningFeedbackService.ts`
- `packages/brain/src/learning/index.ts`

## データベーススキーマ: SQLite
### テーブル: `learning_candidates`
- フィールド: 
  - `id`
  - `source_type`
  - `source_id`
  - `title`
  - `content`
  - `summary`
  - `category`
  - `confidence`
  - `status`
  - `created_at`
  - `updated_at`
- ステータス: 
  - `candidate`
  - `pending_review`
  - `approved`
  - `rejected`
  - `archived`

### テーブル: `learning_feedback`
- フィールド:
  - `id`
  - `candidate_id`
  - `feedback_type`
  - `feedback_text`
  - `created_by`
  - `created_at`

### テーブル: `learning_exports`
- フィールド:
  - `id`
  - `candidate_id`
  - `export_target`
  - `export_status`
  - `exported_at`

## 学習ソース
サポート:
- `sales_call`
- `transcript`
- `filemaker_lead`
- `zoom_call`
- `document`
- `task`
- `meeting`
- `chat`
- `user_feedback`
- `system_event`

## 学習分類
各学習候補を以下のように分類:
- `sales`
- `customer`
- `operations`
- `workflow`
- `product`
- `employee`
- `policy`
- `technical`
- `company`
- `unknown`

## 学習の流れ
1. ソースイベントをキャプチャ
2. 学習候補を作成
3. 候補の分類
4. 信頼性を算出
5. 候補を保存
6. レビューキューに表示
7. 承認された場合、以下にエクスポート:
   - メモリエンジン
   - ナレッジグラフ
   - 営業脳
   - 企業ブレイン

## 承認ルール
- 学習候補は自動的に企業ブレインを更新してはならない。
- 承認が必要。
- メモリエンジンは生の学習記録を直ちに保存できる。

## ユーザーインターフェース (UI)
- 学習レビュー画面を作成
- 表示内容:
  - 候補リスト
  - ソース
  - カテゴリー
  - 信頼性
  - 要約
  - ステータス
  - 承認
  - 拒否
  - アーカイブ
  - エクスポートターゲット

## AI PM / アバター統合
- 学習候補が作成されるとき:
  - アバターステート: `Learning`
- 候補が承認されるとき:
  - アバターステート: `Happy`
- 多くの候補がペンディングのとき:
  - アバターバブル: `未確認の学習候補があります。`

## テスト
実装:
- 候補の作成
- 分類
- 信頼性の算出
- 承認フロー
- 拒否フロー
- メモリへのエクスポート
- グラフへのエクスポート
- レビューキュー

## ドキュメント
作成:
- `docs/LEARNING_ENGINE_V2.md`
更新:
- `README.md`
- `CHANGELOG.md`
- `docs/BRAIN_MEMORY_ENGINE.md`
- `docs/COMPANY_KNOWLEDGE_GRAPH.md`

## 制約
実装禁止:
- LLM自律学習
- 自動企業ブレイン上書き
- クラウド同期
- AutoCall
- 外部ベクターDB

## 受け入れ基準
- Learning Engine v2が存在する
- 学習候補が作成できる
- 候補を分類できる
- 候補を承認/拒否できる
- 承認された学習をメモリエンジンへエクスポートできる
- 承認された学習をナレッジグラフへエクスポートできる
- 学習レビューUIが機能する
- テストがパスする
- ドキュメントが更新されている

## 納品物
報告:
- 変更されたファイル
- テスト結果
- 学習レビューのスクリーンショット
- 推奨コミット

### 推奨コミット
```plaintext
feat(brain): implement Learning Engine v2
```
```