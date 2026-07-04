# Musasabi OS アーキテクチャ

このドキュメントは [docs/COMPANY_GENOME.md](COMPANY_GENOME.md) と
[docs/DEVELOPMENT_BIBLE.md](DEVELOPMENT_BIBLE.md) を最上位設計として、
その内容をシステム設計・ディレクトリ構成・実装ロードマップに落とし込んだものである。
矛盾が生じた場合は Company Genome → Development Bible の順で優先する。

## 0. 設計ドキュメントの優先順位

Development Bible 第30章に基づき、以下の優先順位で設計ドキュメントを参照する。

1. Company Genome — [docs/COMPANY_GENOME.md](COMPANY_GENOME.md)
2. Development Bible — [docs/DEVELOPMENT_BIBLE.md](DEVELOPMENT_BIBLE.md)
3. Organization Bible — [docs/ORGANIZATION_BIBLE.md](ORGANIZATION_BIBLE.md)
4. AI Employee Bible — [docs/AI_EMPLOYEE_BIBLE.md](AI_EMPLOYEE_BIBLE.md)
5. Department Playbooks — [docs/department-playbooks/](department-playbooks/)
6. Security Bible — [docs/SECURITY_BIBLE.md](SECURITY_BIBLE.md)
7. Plugin SDK Bible — [docs/PLUGIN_SDK_BIBLE.md](PLUGIN_SDK_BIBLE.md)

新機能を実装する前には、上記ドキュメントとの整合性を必ず確認し、矛盾する場合は
実装せず設計変更案を提示する(Development Bible 第4章・ユーザー指示)。

## 0.1 Development Bible との整合性確認(Organization Bible 策定時)

Organization Bible 策定にあたり、Development Bible 第21〜22章の8本部
(経営企画/営業/マーケティング/開発/管理/人事/経理/カスタマーサクセス)と、
新たに指定された8本部(企画/開発/営業/マーケティング/クリエイティブ/管理/
サポート/研究開発)の間に差分が生じた。以下の通り整理し、Organization Bible
(`docs/ORGANIZATION_BIBLE.md` 第1章)を正とする。

| Development Bible 第22章 | Organization Bible | 扱い |
|---|---|---|
| 経営企画本部 | AI企画本部 | 名称統一(同一組織) |
| 営業本部 | AI営業本部 | 名称統一(同一組織) |
| マーケティング本部 | AIマーケティング本部 | 名称統一(同一組織) |
| 開発本部 | AI開発本部 | 名称統一(同一組織) |
| 管理本部 | AI管理本部 | 名称統一(同一組織) |
| 人事本部 | AI管理本部 配下「人事部門」 | 独立本部から管理本部内の部門に統合 |
| 経理本部 | AI管理本部 配下「経理部門」 | 独立本部から管理本部内の部門に統合 |
| カスタマーサクセス本部 | AIサポート本部 | 改称(同一組織) |
| (なし) | AIクリエイティブ本部 | 新設(UI/UX・ブランド・モーションデザイン) |
| (なし) | AI研究開発本部 | 新設(Memory/Vision/Automation/Self Improvement の研究) |

矛盾ではなく Organization Bible による具体化・再編として扱う。Development Bible
本文(第21〜22章)は歴史的経緯として残し、実運用は Organization Bible に従う。

## 1. システム構成

Musasabi OSは以下9つのシステムコンポーネントで構成される。**AI Company System**を
組織全体の中核(全AI社員・全部署が従う共通の階層・役職・承認フロー・KPIの基盤)とし、
他のエンジンはAI Company Systemに所属するAI社員が業務を遂行するための能力として位置づける。

```
Musasabi OS
├ Desktop Application      apps/desktop, packages/avatar-2d, packages/avatar-3d
├ Sales Workspace          apps/sales-workspace, packages/ai-core
├ Brain Memory Engine      packages/memory
├ Voice Engine             packages/voice-engine, packages/voice-analysis
├ Vision Engine            packages/vision
├ Automation Engine        packages/automation
├ Self Improvement Engine  packages/self-improvement
├ AI Company System        packages/ai-company (組織階層・役職・KPI・承認フローの中核)
└ Shared Core              packages/shared
```

AI Company Systemは会社 → 本部 → 部門 → 部署 → チーム → AI社員という階層
(Development Bible 第21〜23章)を定義し、Sales Workspace 上で動く AI Sales Employee
(`packages/ai-core`)は「営業本部・営業部」に所属する `AIEmployee` の一種として
この階層に位置づけられる。Memory・Voice・Vision・Automation の各エンジンが記録する
データは、AI Company System の Company Brain(第28章)を通じて部署・社員ごとに
分離されたメモリ(`packages/memory`)へ格納される。

## 2. ディレクトリ構成

Development Bible 第5章に、`ai-company` を追加した構成。

```
apps/
  desktop/            Desktop Application(Electron、Windowsインストーラ、トレイ常駐)
  sales-workspace/    Sales Workspace β 版 UI(React + Vite)

packages/
  avatar-2d/          MUSA常駐アバター(2Dオーバーレイ、状態機械)
  avatar-3d/          3Dアバター(three.js + VRM、リップシンク)
  voice-engine/       TTS/STT(発話合成・音声認識)
  voice-analysis/     通話音声解析(感情分析・キーワード抽出)
  ai-core/            AI Sales Employee ロジック(旧 ai-sales-core)
  ai-company/         AI Company System(組織階層・役職・KPI・承認フロー)
  memory/             Brain Memory Engine
  vision/             Vision Engine
  automation/          Automation Engine
  self-improvement/    Self Improvement Engine
  shared/              IPCプロトコル・型定義・共通ユーティリティ

docs/                 設計ドキュメント(本ファイル、Development Bible 他)
tests/                横断的な統合・E2Eテスト
scripts/              ビルド・リリース・開発補助スクリプト
config/                環境別設定
plugins/               Plugin SDK 準拠のプラグイン
```

## 3. 組織モデル(AI Company System)

`packages/ai-company` が Organization Bible の組織モデルを型として提供する。

- `OrganizationUnit` — 会社/本部/部門/部署/チームの階層(Organization Bible 第1・3章の
  8本部: AI企画/AI開発/AI営業/AIマーケティング/AIクリエイティブ/AI管理/AIサポート/AI研究開発)
- `EmployeeRank` — CEO〜研修社員の8階級・権限レベル(Organization Bible 第2章)
- `AIEmployee` — Role/Department/Authority/KPI を持つAI社員(Organization Bible 第3章)
- `APPROVAL_CHAIN` — 社員→主任→課長→部長→本部長→CEOの承認順(Organization Bible 第5章)

Epic β-001 で実装する AI Sales Employee(`packages/ai-core`)は、AI営業本部・営業部に
所属する `AIEmployee` として扱う。永続化・承認ワークフローの実行・Organization
Dashboard(Development Bible 第29章)は、Epic β-001完了後の次フェーズで実装する。

## 4. Epic β-001 ロードマップ(短期)

ユーザー指示により優先順位を以下の通り再設定する(旧順位から Sales Workspace を
前倒しし、FileMaker/Zoom Phone連携を新規追加)。

1. Windows Desktop
2. MUSAアバター
3. Sales Workspace
4. FileMaker連携
5. Zoom Phone連携
6. Voice Analysis
7. Voice Engine

3D アバター(`packages/avatar-3d`)はこの7項目には含まれず、β版完成後の
拡張として扱う(第5章「Epic β-001以降」)。

### Phase 1 — Windows デスクトップアプリ化(`apps/desktop`)【実装済み】
- Electron main/preload(contextIsolation) — 実装済み、`tsc` ビルド成功
- `electron-builder` で NSIS installer 設定 — 実装済み(実機ビルド未検証)
- Windows ログイン時自動起動、トレイ常駐 — 実装済み(実機起動未検証)
- 受け入れ基準: `.exe` インストーラが生成され、自動起動・トレイ操作が動作する。
  現在の開発コンテナはegressポリシー上Electronバイナリを取得できず未検証
  (`apps/desktop/README.md` 参照)。Windows実機/CIでの確認が残作業

### Phase 2 — MUSA 常駐アバター(`packages/avatar-2d`)
- 透過・最前面・枠なしのオーバーレイウィンドウ
- 状態機械: 待機 / 作業中 / コール準備中(考え中) / フォローアップ / 目標達成(祝福)
- IPC 経由で Voice Engine / ai-core のイベントに反応
- 受け入れ基準: テストイベント送信でアバターの状態が切り替わる

### Phase 3 — Sales Workspace β 仕上げ(`apps/sales-workspace`)
- 日次計画・リード管理・KPI ダッシュボード・推奨アクション
- ai-core(AI Sales Employee)のデータと連携。Voice Analysis連携はPhase 6完了後に追加
- 受け入れ基準: リード状況・KPIがダッシュボードに表示され、アバターも状態遷移する

### Phase 4 — FileMaker連携(`packages/ai-core` 内アダプタ、または `packages/integrations/filemaker`)
- FileMaker Data API 向けプラガブルなアダプタインターフェースを実装
- 実際の接続には顧客のFileMakerサーバー情報・認証情報が必要(Security Bible 第4章:
  Secretはコミットしない)。この開発環境には実クレデンシャルが無いため、
  ローカルモック/スタブでインターフェースの契約を検証する
- 受け入れ基準: アダプタのインターフェースが確定し、モックデータでリード情報の
  取得・更新が動作する。実サーバー接続はクレデンシャル提供後に検証

### Phase 5 — Zoom Phone連携(`packages/voice-engine` 内アダプタ、または `packages/integrations/zoom-phone`)
- Zoom Phone API(通話イベント・音声ストリーム取得)向けプラガブルなアダプタを実装
- 実クレデンシャル(Server-to-Server OAuth等)が無いため、モックの通話イベントで
  Voice Engine/Voice Analysisへのデータフローを検証する
- 受け入れ基準: モック通話イベントが Voice Engine に流れ、Voice Analysis が
  文字起こし・感情分析を行える

### Phase 6 — Voice Analysis(`packages/voice-analysis`)
- 通話の文字起こしを受けてリアルタイム感情分析・キーワード検知・通話サマリ生成
- SQLite に保存し Sales Workspace のダッシュボードに連携
- 受け入れ基準: サンプル通話ログから感情タイムラインとサマリが生成される

### Phase 7 — Voice Engine(`packages/voice-engine`)
- TTS(MUSA の発話)、STT(音声認識)をプラガブルなプロバイダで実装
- 受け入れ基準: テキスト→音声再生+リップシンク用タイミングデータ出力、
  マイク入力→ストリーミング文字起こし

### Phase 8 — 統合・β リリース
- エンドツーエンドの動作確認、Windows インストーラへの一括パッケージング
- README/docs 更新、テスト整備

## 4.1 自律実装ループの運用ルール

ユーザー指示により、以下のループを各Phaseで自動的に繰り返す。

1. GitHub Issue自動作成(Epic β-001 に対応するFeature Issue)
2. `claude/musasabi-epic-beta-001-c6svi5`(Epicブランチ)から機能ブランチを作成
3. 実装
4. テスト(`tsc` によるビルド確認。ユニットテストは各パッケージに追加)
5. Epicブランチ宛にPR作成(`main`へのPRはこのループでは作成しない)
6. `code-review` スキルによる独立レビュー
7. Epicブランチへマージ、機能ブランチ削除
8. Issueクローズ

`main`ブランチへの統合は、Epic β-001の主要フェーズが完了し次第、
別途ユーザーに確認の上で行う(Security Bible 第1章、可逆性の低い操作は慎重に扱う)。
質問や設計判断が必要な場合のみループを止め、それ以外は自律的に継続する。

## 5. Epic β-001 以降(Bible優先順位に基づく中長期)

- **Memory** — `packages/memory` に Brain Memory Engine を実装し、AI Company System の
  Company Brain(第28章)と接続する
- **Vision** — `packages/vision` に OCR・画面認識・UI認識を実装する
- **Automation** — `packages/automation` に操作記録→学習→再実行→改善のループを実装する
- **Self Improvement** — `packages/self-improvement` にリファクタリング/改善提案エンジンを実装する
- **AI Company System の本格実装** — `packages/ai-company` の永続化、承認ワークフローの実行、
  Organization Dashboard(第29章)を実装し、Organization Bible の8本部すべてにAI社員を展開する

これらは AI Employee Bible・Department Playbooks・Security Bible・Plugin SDK Bible
の整備と合わせて計画する。

## 6. 経緯(Phase 0 remediation)

`.github/workflows/ai-pipeline.yml` は Issue が open されるたびに GPT-4o で
`spec.md`/`main_app.py` を全置換し、次のダミーIssueを自動生成するだけのループだった。
"Epic β-001" 等の「完了」コミットメッセージは300件以上積まれていたが、対応する実装は
一度もリポジトリに存在しなかった。このワークフローは `workflow_dispatch` 専用に変更し
無効化済み。自動生成されたダミーIssue45件はクローズ済み(Development Bible 第16章の
「Issueを閉じる前に実装→テスト→レビュー」は、実装対象が存在しないこの後始末には
適用されない例外的対応)。以後は本ドキュメントと Development Bible を実装の正とする。
