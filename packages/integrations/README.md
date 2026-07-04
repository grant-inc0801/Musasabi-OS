# @musasabi/integrations

外部サービス連携アダプタの集約パッケージ。各連携は「インターフェース + 実アダプタ + モックアダプタ」の
3点セットで構成し、実クレデンシャルが無い環境でもモックで契約を検証できるようにする
(Security Bible 第4章: Secretはコミットしない)。

## filemaker

- `FileMakerAdapter` — find/create/update のインターフェース
- `RealFileMakerDataApiAdapter` — FileMaker Data API v1 準拠のHTTPクライアント。
  クレデンシャルは呼び出し側が環境変数等から渡す。実サーバー接続はこの開発環境では未検証
- `MockFileMakerAdapter` — インメモリ実装。開発・テスト用
- `LeadFieldMapper` — FileMakerフィールド ⇔ `@musasabi/ai-core` の `Lead` 型の変換
  (フィールド名・ステータス値はDBごとに異なるため設定可能)

## zoom-phone

- `ZoomPhoneAdapter` — listCallLogs のインターフェース
- `RealZoomPhoneAdapter` — Server-to-Server OAuth(account_credentials grant)+
  `/phone/call_logs` 呼び出し。クレデンシャルは呼び出し側が環境変数等から渡す。
  実サーバー接続はこの開発環境では未検証
- `MockZoomPhoneAdapter` — インメモリ実装。開発・テスト用
- `CallLogMapper` — Zoom通話ログ ⇔ `@musasabi/ai-core` の `CallRecord` 変換。
  Zoomのcall result(接続可否)から確実にわかる不応答系のみ`CallOutcome`を自動推定し、
  応答済み通話の商談結果(アポ獲得/成約等)は断定しない
  (営業担当の入力、またはVoice Analysis(Phase 6)による判定を待つ)

## テスト

`npm run test` で `node --test` によるユニットテストを実行する
(フィールド/通話ログマッピングの変換、モックアダプタのfind/create/update・日付範囲フィルタ、
未知ステータス値や商談結果を断定しないための明示的なエラー化・null返却を検証)。
実サーバーへの接続はクレデンシャル提供後に別途検証する。

詳細は [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) Phase 4/5 を参照。
