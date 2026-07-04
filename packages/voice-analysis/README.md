# @musasabi/voice-analysis

通話トランスクリプトから感情分析・キーワード検知・通話サマリを生成する(Phase 6)。
`@musasabi/voice-engine`(Phase 7)の文字起こし結果を将来的に入力として受け取る想定だが、
現段階では `TranscriptSegment[]` を直接受け取るAPIとして独立している。

## モジュール

- `SentimentAnalyzer` — 辞書ベースの決定的感情分析(LLM推論なし、Development Bible:
  Deterministic behavior before LLM behavior)。ポジティブ/ネガティブキーワードの
  出現数の差でスコアリングする
- `KeywordExtractor` — 反論・クロージング等のウォッチリストキーワード検知
- `TalkRatioCalculator` — 担当者/顧客の発話時間比率
- `CallSummaryGenerator` — 上記を統合したテンプレートベースの通話サマリ
- `CallAnalysisRepository` — `node:sqlite`(Node標準機能、追加ネイティブ依存なし、
  Node 22.5+ experimental)による永続化。Electronメインプロセスでのバンドル済み
  Nodeバージョンとの互換性はこの開発環境では未検証

## テスト

`npm run test` で `node --test` によるユニットテストを実行する(感情分類、
キーワード検知、発話比率計算、サマリ生成、SQLite保存/取得の往復)。

詳細は [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) Phase 6、
[docs/department-playbooks/sales.md](../../docs/department-playbooks/sales.md) を参照。
