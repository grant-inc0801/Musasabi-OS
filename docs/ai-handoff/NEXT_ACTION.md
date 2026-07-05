# 次のアクション

(標準言語は日本語。DECISION_LOG.md の D-20260704-003 を参照)

## ChatGPT 向け
現時点で ChatGPT の設計判断を要する未解決事項はなし。

## Claude Code 向け — Phase β-002「Windows Desktop Productization」
Epic β-001 は完了。DECISION_LOG.md D-20260704-004 に基づき製品化フェーズを進める。
標準構成は **Tauri(デスクトップ)+ VRoid Studio/VRM(アバター)**。

優先順位順に、自律ループ(Issue→ブランチ→実装→テスト→PR→レビュー→マージ)で進める:

1. **Tauri製品版の完成** — msi Installer、Auto Update準備、設定画面整理、ログ管理、
   エラー画面、初回セットアップ
2. **MUSAアバターシステム(VRM)** — VRM対応基盤、VRoid Studio連携、Avatar Manager、
   感情システム、待機モーション、吹き出しUI
3. **AI Company System** — `packages/ai-company` に組織モデルを反映
4. **Settings** — 各種設定画面のみ(実接続なし)
5. **Plugin System** — Plugin基盤

詳細は `docs/ARCHITECTURE.md` 第4.4章。

### Pending(環境依存、実装せず Issue を待機状態で維持)
- Windows実機検証 / VOICEVOX実接続 / whisper.cpp実接続(Issue #183) /
  FileMaker実接続 / Zoom Phone実接続

### 停止条件
設計変更・アーキテクチャ変更・認証情報・外部サービス契約・Windows実機が必要な場合のみ
停止し、GitHub Issue(`chatgpt-decision-needed`)と `CLAUDE_QUESTIONS.md` に日本語で記載。
それ以外は自動で継続する。
