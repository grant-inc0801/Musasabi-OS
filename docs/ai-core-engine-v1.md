# Musasabi AI Core Engine v1

## 結論
4GB〜8GB RAMのWindows端末で動作する、外部メモリ学習型のSLMコアを構築する。モデルの継続再学習ではなく、情報抽出・要約・統合・重複排除・矛盾監査・信頼度更新によって継続的に精度を高める。

## 必須応答ポリシー
すべての応答は以下の順序を標準とする。
1. 結論ファースト
2. プロセス要約
3. 実行可能な具体的指示
4. 逆転の発想による代替提案

## ハードウェア対象
- 最小RAM: 4GB
- 推奨RAM: 8GB
- GPU必須ではない
- 同時推論: 1
- 4GBモード: 0.6B Q4 / context 2048
- 8GBモード: 1.7B Q4 / context 4096

## コア構成
- Inference Adapter: llama.cpp OpenAI互換API
- Response Policy Engine: 応答構造の強制
- Memory Intake: 学習候補抽出
- Memory Store: SQLite
- Memory Consolidator: 要約・統合
- Deduplication Engine: 完全一致・構造一致・意味類似
- Integrity Engine: 矛盾・期限・信頼度・出典監査
- Retrieval Engine: 必要な記憶のみ取得
- Resource Governor: RAM監視と負荷制御
- Audit Log: 更新前後の差分記録

## 学習分類
- NEW
- DUPLICATE
- SUPPLEMENT
- CORRECTION
- SUPERSEDE
- CONFLICT
- UNCERTAIN

## 更新アクション
- ADD
- MERGE
- REPLACE
- ARCHIVE
- REJECT
- HOLD

## 整合性ループ
### リアルタイム
- 完全重複
- 明示訂正
- 重大矛盾

### セッション終了時
- 学習候補抽出
- セッション要約
- 既存メモリ統合

### 日次
- 意味重複統合
- 期限切れ無効化
- 信頼度再計算

### 週次
- プロジェクト全体監査
- 階層要約再構築
- 矛盾再評価

## 応答JSON内部形式
```json
{
  "conclusion": "結論",
  "process_summary": ["処理1", "処理2"],
  "instructions": [
    {"step": 1, "action": "具体的な操作", "expected_result": "期待結果"}
  ],
  "reverse_idea": {
    "proposal": "逆転の発想",
    "benefit": "利点",
    "risk": "注意点"
  },
  "confidence": 0.0,
  "sources": []
}
```

## 最短開発原則
- 同じ内容を複数Issueで実装しない
- 各Issueは担当ディレクトリを分離する
- SLM全件判定を避け、ルール・SQL・ベクトル判定を先に使う
- 初期版ではモデル重みの再学習を行わない
- 曖昧な矛盾のみSLM判定へ送る
- 重要情報は物理削除せず履歴化する

## 完了条件
- 4GBモードでクラッシュしない
- 完全重複削除率99%以上
- 明示訂正反映率98%以上
- 重要情報保持率95%以上
- 誤った自動上書き率1%未満
- 応答ポリシー4項目がすべて出力される
