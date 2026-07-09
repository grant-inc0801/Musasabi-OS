# Production Readiness — 設計ドキュメント(設計のみ・実装は承認後)

本書は `MASTER_ROADMAP_TO_PRODUCTION.md` の **Production Readiness Phase** に対する
**設計** をまとめたものです。**実装は行いません。** 実認証情報・実接続・課金・本番デプロイは
**人間による明示的な承認**が得られるまで一切行いません(`production-roadmap` の
`isProductionReadinessUnlocked` が `PRODUCTION_APPROVED=false` でロック維持)。

- 本書に**実際の秘密情報(APIキー・トークン・パスワード)は含めません**。
- 構成テンプレートはすべて**プレースホルダのみ**で、`.github/workflows` には配置しません
  (=CI/CD で自動実行されない不活性テンプレート)。
- ステータス: 全項目 **locked(承認待ち)**。

## 対象と関連ファイル

| # | 項目 | 設計要旨 | 関連テンプレート |
|---|------|----------|------------------|
| 1 | 認証・認可 | OIDC/OAuth2 + RBAC(admin/operator/viewer)。secrets はマネージャ参照 | `.env.example` |
| 2 | シークレット管理 | シークレットマネージャ集約、アプリは参照名のみ保持 | `.env.example` |
| 3 | 本番データベース | マネージドRDB、最小権限、暗号化、マイグレーション管理 | `ENVIRONMENTS.md` |
| 4 | ロギング・監視 | 構造化ログ+集約、メトリクス/アラート、SLO、PIIマスキング | `ENVIRONMENTS.md` |
| 5 | バックアップ・DR | 定期バックアップ+リストア、RPO/RTO、DRリージョン、復旧演習 | `ENVIRONMENTS.md` |
| 6 | 環境分離 | dev/staging/prod 分離、環境別設定・secrets・アクセス制御 | `ENVIRONMENTS.md` |
| 7 | セキュアデプロイ | 署名付きアーティファクト、承認ゲート、ロールバック | `deploy-pipeline.example.yml` |
| 8 | データ移行 | 前方互換マイグレーション、ドライラン、バックアップ前提、ロールバック | `ENVIRONMENTS.md` |
| 9 | 性能・負荷テスト | 負荷シナリオ、目標スループット/レイテンシ、staging で実施 | — |
| 10 | セキュリティレビュー | 脅威モデリング、依存脆弱性/秘密情報スキャン、レビューチェックリスト | 既存 `scripts/ci/check-secret-patterns.js` |
| 11 | 本番承認ゲート | 申請→レビュー→人間承認→監査記録。憲章遵守 | — |

---

## 1. 認証・認可(Authentication & Authorization)
- 方式: OIDC / OAuth2(認可コード+PKCE)。セッションは短命トークン+リフレッシュ。
- 認可: RBAC。ロール `admin` / `operator` / `viewer` と権限マトリクスを定義。
- secrets(クライアントシークレット等)は**シークレットマネージャ参照**。コードには参照名のみ。
- 監査: 認証イベントを監査ログへ。

## 2. シークレット管理(Secret Management)
- すべての秘密情報は外部シークレットマネージャ(例: Vault / クラウドKMS)に集約。
- アプリは環境変数で**参照名**を受け取り、起動時に取得。値はリポジトリに置かない。
- `.env.example` は**プレースホルダのみ**(`<set-in-secret-manager>`)。
- ローテーション方針・最小権限の付与を定義。

## 3. 本番データベース(Production Database)
- マネージドRDB(例: PostgreSQL 互換)。接続はシークレット経由。
- 最小権限ロール、at-rest / in-transit 暗号化、接続数上限。
- スキーマ/マイグレーションはバージョン管理(前方互換)。

## 4. 本番ロギング・監視(Logging & Monitoring)
- 構造化ログ(JSON)+集約基盤。相関ID付与。
- メトリクス/アラート、SLO とエラーバジェット。
- 個人情報(PII)のマスキング/保持期間の方針。

## 5. バックアップ・災害復旧(Backup & DR)
- 定期自動バックアップ+暗号化保管、リストア手順の文書化。
- 目標: RPO / RTO を定義。DR リージョン。定期の復旧演習。

## 6. 環境分離(dev / staging / prod)
- 3環境を分離。環境別に設定・secrets・アクセス制御を分割。
- 構成テンプレート: `docs/production-readiness/ENVIRONMENTS.md`。

## 7. セキュアデプロイパイプライン(Secure Deployment)
- 署名付きアーティファクト、承認ゲート付きデプロイ、即時ロールバック。
- デプロイ資格情報は最小権限・短命。テンプレート: `deploy-pipeline.example.yml`(不活性)。

## 8. データ移行(Data Migration)
- 前方互換マイグレーション、ドライラン、事前バックアップ、ロールバック計画。
- 実データは**承認後にのみ**取り扱う。

## 9. 性能・負荷テスト(Performance & Load Testing)
- 負荷シナリオ・目標スループット/レイテンシを定義し、**staging** で実施。
- 本番環境には負荷試験を行わない。

## 10. セキュリティレビュー(Security Review)
- 脅威モデリング、依存脆弱性スキャン、秘密情報スキャン(既存
  `scripts/ci/check-secret-patterns.js` を拡張)、レビューチェックリスト。

## 11. 本番承認ゲート(Production Approval Gates)
- リリース承認フロー: 申請 → レビュー → **人間承認** → 監査記録。
- 承認は監査ログに残し、Musasabi 憲章(人間承認・監査保持・本番デプロイ禁止)に従う。

---

## Production Launch Checklist(現状)
- 全テスト成功 ✅ / ドキュメント整備 ✅ / ガバナンス検証 ✅
- セキュリティレビュー完了 ⏳ / バックアップ検証 ⏳ / ロールバック計画準備 ⏳ /
  本番リリース前の人間承認 ⏳(=承認・本番フェーズで実施)

## ルール
Production Readiness が明示的に承認されるまで、本番連携・課金・銀行・機微な認証情報は
一切行わない。本書は設計のみであり、承認までは実装に着手しない。
