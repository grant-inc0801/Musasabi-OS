# Staging/Mock デプロイ計画(STAGING-001)

Musasabi OS を **安全な Mock/ステージング環境** へ配備するための計画と手順。
**本番デプロイは行わない**(Production Readiness の人間承認後に別途実施)。

## 前提・安全ルール

- すべての外部連携は **Mock または無効**(FileMaker / Zoom Phone / SNS / 課金 / 銀行 / 顧客データ / 本番API への実接続なし)
- **本番 secrets は使用しない**(リポジトリ・成果物に秘密情報を含めない。CI の秘密情報スキャンで検査)
- Production Readiness は **ゲートで無効のまま**:

  | ゲート | 状態 |
  |---|---|
  | `production-roadmap` `PRODUCTION_APPROVED` | `false`(11項目ロック) |
  | `marketing-pdca` `EXTERNAL_POSTING_ENABLED` | `false`(本番SNS投稿不可) |
  | `ai-model-registry` `PRODUCTION_CONNECTIONS_ENABLED` | `false`(実API接続不可) |
  | `intelligence-layer` `REAL_ENFORCEMENT_ENABLED` | `false`(実強制・実実行不可) |

## ステージング配備パス

### A. Web プレビュー(最速・ローカル/社内確認用)

```bash
npm install
npm run build          # 全パッケージ+フロントエンドをビルド
npm run preview:web    # http://localhost:4173 で dist を配信(vite preview)
```

- 静的ファイル一式は `apps/sales-workspace/dist/`。任意の静的ホスティング
  (社内サーバ等)に置く場合はこのディレクトリをそのまま配置する
- GitHub Actions の Beta Build 成果物 `musasabi-beta-web-<sha>` も同内容

### B. Windows デスクトップ(β/ステージング用インストーラ)

1. GitHub **Actions → Beta Build → Run workflow**(Branch: `main`)を実行
2. 完了後、Artifacts から `musasabi-beta-windows-<sha>` をダウンロード
3. zip 内の NSIS `Musasabi OS_0.1.0_x64-setup.exe`(または MSI)を実行
   - 未署名のため SmartScreen 警告が出る(「詳細情報」→「実行」)
4. 検証は `docs/WINDOWS_VERIFICATION_CHECKLIST.md` に従う

## 検証チェック(配備前に必須)

| チェック | コマンド | 直近結果(2026-07-10) |
|---|---|---|
| ビルド | `npm run build` | ✅ 成功 |
| テスト | `npm test` | ✅ 38パッケージ・544件 pass・fail 0 |
| リント | `npm run lint` | ⚠ 各パッケージに lint スクリプト未定義(`--if-present` で no-op)。導入は後続タスク |
| 秘密情報スキャン | `node scripts/ci/check-secret-patterns.js` | ✅ 検出なし |
| CI | `.github/workflows/ci.yml`(PR時自動) | ✅ green |

## ロールバック手順

### Web プレビュー
1. 直前の正常な `musasabi-beta-web-<sha>` artifact を再配置する(静的ファイル差し替えのみ)

### Windows デスクトップ
1. 問題のあるバージョンをアンインストール(設定 → アプリ)
2. 直前の正常な `musasabi-beta-windows-<sha>` artifact のインストーラを再実行
   (Artifacts の保持期間は14日。必要に応じて該当コミットで Beta Build を再実行して再生成)

### コード(main)
1. 問題のマージコミットを `git revert -m 1 <merge-sha>` で打ち消し、PR → CI green → マージ
2. `main` で Beta Build を再実行し、ロールバック済みインストーラを配布
3. **force push は行わない**(履歴の書き換え禁止)

### ローカルデータ
- ユーザーデータは端末の localStorage のみ(外部送信なし)。
  破損時は 管理画面 → Settings → データ管理 のバックアップ JSON から復元

## 本番デプロイについて(実施しない)

本番デプロイは本計画の対象外。`docs/ai-handoff/PRODUCTION_READINESS_DESIGN.md` の
11項目(認証/シークレット管理/本番DB/監視/バックアップ/環境分離/セキュアデプロイ/
データ移行/負荷試験/セキュリティレビュー/承認ゲート)を満たし、**人間の明示承認**を
得た後に、別の指示で実施する。
