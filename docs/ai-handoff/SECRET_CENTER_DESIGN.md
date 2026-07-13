# Secret Center 設計(実装済み)

**日付**: 2026-07-13 / **状態**: 実装済み(PR 本番実装第4弾)

## 方針
- 秘密情報(SMTPパスワード等)は **OSの資格情報ストア**に暗号化保管する
  - Windows: 資格情報マネージャー / macOS: Keychain / Linux: Secret Service
  - 実装: Rust `keyring` クレート(サービス名 `musasabi-os`)
- **値はフロントエンド(WebView)へ決して返さない**
  - 公開コマンドは `secret_set` / `secret_exists`(存在確認のみ)/ `secret_delete` の3つ
  - 利用側(例: `send_mail`)は Rust 内部でのみ値を読む
- localStorage・リポジトリ・ログには保存しない。バックアップ(musasabi.*)にも含まれない
  (端末を変えたら再入力 — 仕様として明記)

## 現在の利用者
- メール通知(SMTP): キー `smtp-password`

## 今後の移行候補
- GitHub PAT(現在 localStorage)・SerpAPI キー → Secret Center へ移行(後続タスク)
- SNS 実投稿の認証情報は EXTERNAL_POSTING_ENABLED 承認とセットで設計
