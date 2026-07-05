# ChatGPT Directive

## Directive ID
D-20260705-003

## Title
AutoCallシステムを Learning → Test → AutoCall の三段階運用へ修正する

## 決定
Musasabi OSのコール機能は、いきなりAutoCallを実行する設計ではなく、以下の三段階モードとして設計・実装してください。

1. Learning Mode
2. Test Mode
3. AutoCall Mode

現フェーズでは、AutoCall本番実行は有効化しません。まずはTest Modeを安全なロールプレイ・改善モードとして実装し、全AI社員で共通利用できる基盤にします。

## 背景
ユーザーは、AI社員が人間らしい話し方・切り返し・営業トークを習得してからAutoCallへ進む運用を希望しています。

そのため、Test Modeでは指定した連絡先へテスト架電し、実際の会話を通じてトーク内容・話し方・切り返しを確認し、指摘内容を蓄積・修正・改善できる必要があります。

## モード定義

### 1. Learning Mode
目的：人間の営業トーク、過去の架電履歴、成功パターン、切り返し、話し方を学習する。

主な役割：
- 営業トークの学習
- 成功・失敗パターンの蓄積
- 切り返しパターンの収集
- AI社員共通ナレッジへの反映

### 2. Test Mode
目的：本番AutoCall前に、指定連絡先へテスト架電してロールプレイを行う。

必須仕様：
- 連絡先の自由入力欄を設ける
- 「テストコール開始」ボタンを設ける
- 指定連絡先へテスト架電できる設計にする
- 実際にAIと会話し、トーク内容・話し方・切り返しを確認する
- 音声による指導を行い、トーク修正を支援する
- 指摘内容を蓄積する
- 指摘内容を修正・改善し、人間らしい話し方を習得する
- Test Modeの改善内容は全AI社員で統一する

重要：現フェーズでは実架電APIが無い場合、Mock Call Adapterで実装してください。実際の外部架電はPending扱いでよいです。

### 3. AutoCall Mode
目的：Learning ModeとTest Modeで品質確認後に、本番架電を行う。

現フェーズではAutoCall本番実行は禁止です。

AutoCall Modeは以下が揃うまで有効化しないこと。
- 管理者承認
- 法令・運用ルール確認
- 架電先リスト承認
- 稼働時間制限
- 緊急停止ボタン
- 監査ログ
- テストモード合格基準
- 実アカウント連携

## 実装指示

1. AutoCall関連の設計を `Learning Mode → Test Mode → AutoCall Mode` に更新する。
2. Test ModeのUIを追加または設計する。
3. Test Modeに「連絡先自由入力欄」と「テストコール開始ボタン」を追加する。
4. 現フェーズではMock Call Adapterを使い、外部APIへの実架電は行わない。
5. テスト会話ログ、指摘内容、改善案を保存できるモデルを用意する。
6. 指摘内容はAI社員個別ではなく、全AI社員共通の改善ナレッジへ反映できる設計にする。
7. 音声指導はまず設計・UI・ログ蓄積を優先し、実音声エンジン接続はPending扱いにする。
8. AutoCall ModeはUI上で「準備中」または「承認待ち」と表示し、本番開始できないようにする。
9. 関連docsを日本語で更新する。
10. テストを追加・更新する。
11. `docs/ai-handoff/CLAUDE_RESPONSE.md` を日本語で更新する。

## 追加すべきIssue
必要に応じて以下のIssueを作成してください。

- Test Mode UI実装
- Mock Call Adapter実装
- Test Call Sessionモデル実装
- Talk Feedback Memory実装
- 全AI社員共通改善ナレッジ実装
- AutoCall安全ゲート設計
- 実架電API接続Pending

## 安全ルール

Claude Codeは以下を行わないこと。

- 実際の外部架電APIを呼び出さない
- 実電話番号へ発信しない
- AutoCall本番実行を有効化しない
- 認証情報を保存しない
- FileMaker本番DBへ書き込まない
- Zoom Phone本番APIへ接続しない
- force pushしない
- secretsを表示しない

## 現在の優先順位

1. AutoCallモード設計修正
2. Test Mode基盤
3. Mock Call Adapter
4. Test Call Session / Feedback Memory
5. 全AI社員共通改善ナレッジ
6. Tauri Desktop Productization
7. β版評価ビルド出力準備
8. MUSA Avatar System
9. AI Company System

## 完了条件

このDirectiveは以下を満たしたら完了です。

- Learning / Test / AutoCall の三段階モードがdocsに反映されている
- Test ModeのUIまたは設計が追加されている
- 連絡先入力欄とテストコール開始導線がある
- Mock Call Adapterで安全にテストできる
- 指摘内容・改善内容を蓄積できるモデルがある
- 全AI社員共通の改善ナレッジとして扱える
- AutoCall本番実行が無効のまま維持されている
- テストが通る
- `CLAUDE_RESPONSE.md` が日本語で更新されている

## 次のアクション

最新のmainをpullし、このDirectiveを読んだ上で、AutoCallシステムを Learning Mode → Test Mode → AutoCall Mode の三段階設計へ修正してください。
