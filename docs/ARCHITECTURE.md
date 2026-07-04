# Musasabi OS アーキテクチャ

このドキュメントは [docs/DEVELOPMENT_BIBLE.md](DEVELOPMENT_BIBLE.md) を最上位設計として、
その内容をシステム設計・ディレクトリ構成・実装ロードマップに落とし込んだものである。
矛盾が生じた場合は Development Bible が優先する。

## 0. 設計ドキュメントの優先順位

Development Bible 第30章に基づき、以下の優先順位で設計ドキュメントを参照する。

1. Company Genome — **未策定**
2. Development Bible — [docs/DEVELOPMENT_BIBLE.md](DEVELOPMENT_BIBLE.md)
3. Organization Bible — **未策定**
4. AI Employee Bible — **未策定**
5. Department Playbooks — **未策定**
6. Security Bible — **未策定**
7. Plugin SDK Bible — **未策定**

現時点で存在するのは Development Bible のみ。新機能を実装する前には、
存在するドキュメントとの整合性を必ず確認し、矛盾する場合は実装せず設計変更案を提示する
(Development Bible 第4章・ユーザー指示)。未策定のドキュメントが必要になった場合は、
先にドキュメント化を提案してから実装に着手する。

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

`packages/ai-company` が Development Bible 第21〜26章の組織モデルを型として提供する。

- `OrganizationUnit` — 会社/本部/部門/部署/チームの階層(第21〜22章)
- `EmployeeRank` — CEO〜研修社員の8階級(第23章)
- `AIEmployee` — Role/Department/Authority/KPI を持つAI社員(第24章)
- `APPROVAL_CHAIN` — 社員→主任→課長→部長→本部長→CEOの承認順(第25章)

Epic β-001 で実装する AI Sales Employee(`packages/ai-core`)は、営業本部・営業部に
所属する `AIEmployee` として扱う。永続化・承認ワークフローの実行・Organization
Dashboard(第29章)は、Epic β-001完了後の次フェーズで実装する。

## 4. Epic β-001 ロードマップ(短期)

Development Bible 第4章の優先順位(Windows Desktop → Sales Workspace → Memory
→ Voice → Vision → Automation → Self Improvement)のうち、Epic β-001「営業部運用版
完成」は次の6項目に対応する Windows Desktop / Sales Workspace / Voice / Avatar を
対象とする。Memory / Vision / Automation / Self Improvement は Epic β-001 完了後、
Bibleの優先順位どおりに着手する。

### Phase 1 — Windows デスクトップアプリ化(`apps/desktop`)
- Electron main/preload(contextIsolation)
- `electron-builder` で NSIS installer
- Windows ログイン時自動起動、トレイ常駐
- 受け入れ基準: `.exe` インストーラが生成され、自動起動・トレイ操作が動作する

### Phase 2 — MUSA 常駐アバター(`packages/avatar-2d`)
- 透過・最前面・枠なしのオーバーレイウィンドウ
- 状態機械: 待機 / 作業中 / コール準備中(考え中) / フォローアップ / 目標達成(祝福)
- IPC 経由で Voice Engine / ai-core のイベントに反応
- 受け入れ基準: テストイベント送信でアバターの状態が切り替わる

### Phase 3 — Voice Engine(`packages/voice-engine`)
- TTS(MUSA の発話)、STT(音声認識)をプラガブルなプロバイダで実装
- 通話音声取得(Zoom Phone 等)は別途 API 連携タスクとして切り出す
- 受け入れ基準: テキスト→音声再生+リップシンク用タイミングデータ出力、
  マイク入力→ストリーミング文字起こし

### Phase 4 — Voice Analysis(`packages/voice-analysis`)
- Voice Engine の文字起こしを受けてリアルタイム感情分析・キーワード検知・通話サマリ生成
- SQLite に保存し Sales Workspace のダッシュボードに連携
- 受け入れ基準: サンプル通話ログから感情タイムラインとサマリが生成される

### Phase 5 — 3D アバター(`packages/avatar-3d`)
- three.js + VRM モデル描画(透過 Electron ウィンドウ内)
- リップシンク・感情に応じたブレンドシェイプ制御
- 受け入れ基準: VRM モデルが発話に同期して口が動き、アイドルモーションが滑らかに再生される

### Phase 6 — Sales Workspace β 仕上げ(`apps/sales-workspace`)
- 日次計画・リード管理・KPI ダッシュボード・推奨アクション
- Voice Analysis・ai-core のデータと連携
- 受け入れ基準: 通話終了後にリード状況・KPI が反映され、アバターも状態遷移する

### Phase 7 — 統合・β リリース
- エンドツーエンドの動作確認、Windows インストーラへの一括パッケージング
- README/docs 更新、テスト整備

## 5. Epic β-001 以降(Bible優先順位に基づく中長期)

- **Memory** — `packages/memory` に Brain Memory Engine を実装し、AI Company System の
  Company Brain(第28章)と接続する
- **Vision** — `packages/vision` に OCR・画面認識・UI認識を実装する
- **Automation** — `packages/automation` に操作記録→学習→再実行→改善のループを実装する
- **Self Improvement** — `packages/self-improvement` にリファクタリング/改善提案エンジンを実装する
- **AI Company System の本格実装** — `packages/ai-company` の永続化、承認ワークフローの実行、
  Organization Dashboard(第29章)を実装し、営業本部以外の本部・部署にもAI社員を展開する

これらは未策定の Organization Bible / AI Employee Bible / Department Playbooks の
整備と合わせて計画する。

## 6. 経緯(Phase 0 remediation)

`.github/workflows/ai-pipeline.yml` は Issue が open されるたびに GPT-4o で
`spec.md`/`main_app.py` を全置換し、次のダミーIssueを自動生成するだけのループだった。
"Epic β-001" 等の「完了」コミットメッセージは300件以上積まれていたが、対応する実装は
一度もリポジトリに存在しなかった。このワークフローは `workflow_dispatch` 専用に変更し
無効化済み。自動生成されたダミーIssue45件はクローズ済み(Development Bible 第16章の
「Issueを閉じる前に実装→テスト→レビュー」は、実装対象が存在しないこの後始末には
適用されない例外的対応)。以後は本ドキュメントと Development Bible を実装の正とする。
