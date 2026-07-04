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

## テスト

`npm run test` で `node --test` によるユニットテストを実行する
(フィールドマッピングの往復変換、モックアダプタのfind/create/update、
未知ステータス値での明示的なエラー化を検証)。実FileMakerサーバーへの接続は
クレデンシャル提供後に別途検証する。

詳細は [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) Phase 4 を参照。
