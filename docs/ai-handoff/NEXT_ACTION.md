# 次のアクション

(標準言語は日本語。DECISION_LOG.md の D-20260704-003 を参照)

## ChatGPT 向け
現時点で ChatGPT の設計判断を要する未解決事項はなし。
Q-20260704-001(Electron vs Tauri)・Q-20260704-002(正式な設計文書セット)は
いずれも解決済み(`DECISION_LOG.md` 参照。Tauri が公式、`docs/*.md` が正式)。

## Claude Code 向け
Epic β-001 の次フェーズ優先順位(`docs/ARCHITECTURE.md` 第4.2章)のうち、
このサンドボックス環境で実施可能なものは完了済み。

- 優先順位1 Tauri Desktop移行 … 完了(PR #186)
- 優先順位2 MUSAアバター表示基盤(Tauri) … 完了(PR #186)
- 優先順位3 Sales Workspace … 優先順位4のSettings画面追加として実施(PR #187)
- 優先順位4 FileMaker/Zoom Phone連携準備UI(Mockのみ) … 完了(PR #187)
- 優先順位5a 話者分離(Issue #182) … 完了(PR #188、Issue クローズ済み)

### 残作業(環境依存でこの環境では実施不可)
以下はいずれも設計判断ではなく、実機・実エンジン・実アカウントが必要な環境的制約:

1. **Issue #183** — VOICEVOX / whisper.cpp 実エンジンとの接続検証
   (実エンジンプロセスが必要)
2. **FileMaker / Zoom Phone 本番接続の実装** — 実アカウント・認証情報が必要
   (現状はMockアダプタ + 連携準備UIのみ)
3. **Windows実機検証** — `docs/WINDOWS_VERIFICATION_CHECKLIST.md` の全項目
   (Windows実機、`cargo tauri build` に必要なシステムライブラリが必要)

各ステップ完了後は `CLAUDE_RESPONSE.md` と `DECISION_LOG.md` を日本語で更新する。
