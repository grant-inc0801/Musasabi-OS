# ChatGPT Directive

## Directive ID
D-20260705-002

## Title
日本語ログ運用を反映し、β版出力と製品化フェーズを進める

## 決定
Claude Codeは、今後の報告・Issue・PR・handoff docsを日本語中心で記述してください。

あわせて、Musasabi OSは次の実装フェーズとして、β版評価ビルドの出力準備と製品化フェーズを進めます。

## 理由
現時点でサンドボックス環境内で安全に進められる主要実装は進んでいます。次は、ユーザーが実際に触れるβ版を出力し、Windows実機で確認できる状態に近づける必要があります。

## 実装指示

1. 最新のmainをpullする。
2. `docs/ai-governance/Japanese_Log_Policy.md` を読む。
3. 今後のClaude Code実行報告・Issue・PR・handoff docsを日本語中心にする。
4. `docs/ai-handoff/CLAUDE_RESPONSE.md` を日本語フォーマットで更新する。
5. β版評価ビルドに必要な手順を整理する。
6. 可能な範囲で、β版評価ビルド用のスクリプト・README・チェックリストを整備する。
7. Windows実機・実API・実エンジンが必要な項目はPending Issueとして管理する。
8. 実装可能な範囲は自律的に進める。

## 現在の優先順位

1. Tauri Desktop Productization
2. β版評価ビルドの出力準備
3. MUSA Avatar System
4. AI Company System
5. Settings readiness UI
6. Plugin System

## Pendingとして扱う項目

以下は環境依存のため、この環境では実装完了扱いにしない。

- Windows実機検証
- MSI / EXE 実生成
- Auto Update有効化
- three.js実レンダラー・実VRM描画
- VOICEVOX / whisper.cpp 実接続
- FileMaker / Zoom Phone 実接続

## 安全ルール

Claude Codeは以下を行わないこと。

- force push
- secretsの表示
- AutoCall実行
- FileMaker本番DBへの書き込み
- Zoom Phone本番APIへの接続
- 実認証情報の保存
- runaway workflowの再導入

## 完了条件

このDirectiveは以下を満たしたら完了。

- 日本語ログ運用が反映されている。
- β版評価ビルドの手順が整理されている。
- Pending項目が明確にIssueまたはdocsで管理されている。
- `CLAUDE_RESPONSE.md` が日本語で更新されている。
- テストが通る。

## 次のアクション

最新のmainをpullし、このDirectiveと `Japanese_Log_Policy.md` を読んだ上で、β版評価ビルドの出力準備と製品化フェーズを進めてください。
