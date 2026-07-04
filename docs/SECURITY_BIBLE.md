# Musasabi OS Security Bible

Version 1.0

Company Genome 第9章(Security Philosophy)、Development Bible 第14章を実務レベルに
具体化したドキュメント。すべての実装・運用はこれに従う。

---

## 第1章 基本原則

- ユーザーの明示的許可なしに、以下を実行しない: メール送信 / 削除 / 支払い / 外部送信
- 最小権限の原則: AI社員は自身のRank/Authority Level(Organization Bible 第2章)を
  超える操作を行わない
- 不可逆操作は可逆操作より慎重に扱う(Company Genome 第5章 Decision Principles)

---

## 第2章 禁止事項(絶対)

勝手に行ってはならない操作(Development Bible 第4章)。

- ファイル削除
- Force Push
- Issue大量削除
- Secretの変更
- APIキーの画面/ログ/コミットへの表示

これらが必要な場合も、必ず事前にユーザーへ確認する。

---

## 第3章 認証・認可

- GitHub/外部サービスとの連携は、セッションに付与された権限の範囲内でのみ行う
- 403等の権限エラーが発生した場合、権限を推測で拡大解釈せず、正しい設定変更箇所を
  ユーザーに案内する(Phase 0のGitHub Issue権限対応を先例とする)
- 承認フロー(Organization Bible 第5章)を経ない権限昇格は行わない

---

## 第4章 Secret管理

- APIキー・トークン・パスワードはコード・ドキュメント・コミットメッセージに含めない
- `.env` 等のSecretファイルは `.gitignore` で除外する(既に `config/` は
  「Secretはコミットしない」と明記済み)
- Secretを含む可能性のあるファイルをステージングする前に内容を確認する

---

## 第5章 データ保護

- 顧客データ(FileMaker、通話録音、Voice Analysis結果)は部署内アクセスに限定する
- 個人Memory(AI Employee Bible 第3章)は所属部署外への生データ共有を行わない
- 通話録音・音声解析データの保持期間・削除ポリシーは実装時に別途定める

---

## 第6章 監査ログ

- すべての承認・実行・拒否はMemory Engine(`packages/memory`)に記録し、
  後から誰が・いつ・何を承認したか追跡可能にする
- Issueクローズ・Force Push等の重大操作は、実行前にユーザーへの確認を経た記録を残す

---

## 第7章 インシデント対応

- セキュリティ上の問題(意図しない権限昇格、Secret漏洩の疑い等)を検知した場合、
  即座に作業を中断しユーザーへ報告する
- 自己判断で「なかったこと」にする、ログを削除する等の隠蔽は行わない

---

## 第8章 サードパーティ連携

- Zoom Phone / FileMaker / Google Calendar / Slack 等の外部サービス連携は、
  必要最小限のスコープでのみAPIキーを要求する
- Plugin SDK(Plugin SDK Bible)経由のプラグインは、Security Bibleの制約
  (第2章の絶対禁止事項)を上書きできない

---

## 第9章 実装との対応

- `packages/ai-company` の `AIEmployee.authorityLevel` が権限判定の基礎となる
- 承認フロー実行の実装は Epic β-001 完了後、AI Company System 本格実装フェーズで行う
  (`docs/ARCHITECTURE.md` 第5章)
