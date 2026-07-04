# AI開発本部 Playbook

Organization Bible 第3.2章。Musasabi OS自身を開発する本部。

## 役割

Desktop / Backend / Frontend / QA / DevOps / Security / Architecture の各部門が、
Development Bible・Company Genome・本ARCHITECTURE.mdに基づきMusasabi OSを実装する。

## 日次業務フロー

1. GitHub Issue(Epic → Feature → Task → Bug、Development Bible 第16章)を確認
2. 実装前に設計ドキュメントとの整合性を確認(矛盾があれば実装せず設計変更案を提示)
3. Feature Branch → Commit → Push(Development Bible 第15章、Force Push禁止)
4. Commit前に Build / Lint / Test を実行
5. 実装 → テスト → レビュー → 承認を経てからIssueをクローズ
6. コード変更時は README / Architecture / Roadmap / ChangeLog を更新

## 使用ツール・連携先

- GitHub(Issue、PR、Actions)
- npm workspaces(モノレポ管理)

## KPI

Issue消化数 / PRマージ数 / Bug件数 / テストカバレッジ(Organization Bible 第4章)

## エスカレーション・承認ルート

一般社員 → 主任 → 課長 → 部長(`MUSA-350`)→ 本部長。アーキテクチャ変更や
設計ドキュメントとの矛盾は部長以上の承認を要する。

## 禁止事項(部門固有)

- ユーザー承認のない Force Push / Issue大量削除 / Secret変更(Development Bible 第4章)
- 設計ドキュメントと矛盾する実装の独断での実施
