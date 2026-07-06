# @musasabi/call-training

コール機能の三段階運用ロジック(Directive D-20260705-003)。

## 三段階モード

1. **Learning Mode(ラーニングモード)** — 人間の営業トーク・過去の架電履歴・成功/失敗パターン・切り返し・話し方を学習し、全AI社員共通のナレッジへ反映する。
2. **Test Mode(テストモード)** — 本番AutoCall前に、指定連絡先へテスト架電してロールプレイを行う。現フェーズは **Mock Call Adapter** で実装し、実際の外部架電は行わない。会話ログ・指摘(トーク修正)を蓄積し、改善する。
3. **AutoCall Mode(オートコールモード)** — 本番架電。**現フェーズでは本番実行を禁止**。以下の安全ゲートがすべて揃うまで有効化しない。

## AutoCall 安全ゲート(全8種)

管理者承認 / 法令・運用ルール確認 / 架電先リスト承認 / 稼働時間制限 / 緊急停止ボタン / 監査ログ / テストモード合格基準 / 実アカウント連携

`canPlaceRealCall(mode, satisfiedGates)` は `mode === "autocall"` かつ全ゲート充足時のみ `true`。現フェーズでは充足しないため常に `false`(実架電は一切しない)。

## 主なAPI

- `MockCallAdapter` — 決定論的なルールベースの Mock 架電アダプタ(LLM・外部API不使用)。
- `startTestCall` / `addHumanTurn` / `endTestCall` / `addFeedback` — テストセッション操作(すべて immutable/決定論)。
- `canEnableAutoCall` / `canPlaceRealCall` — AutoCall 安全判定。
- `SharedTalkKnowledge` — テストモードの指摘を全AI社員共通ナレッジへ集約(現フェーズはインメモリのみ)。

## Pending(次フェーズ以降)

- 実架電API接続(Zoom Phone 等)
- 実音声エンジン接続(音声指導)
- 会話ログ・指摘・共通ナレッジのローカル永続化(JSON/SQLite)
- AutoCall 本番実行(全安全ゲート充足後)
