# Musasabi OS

Musasabi OS は、AIが人の代わりに仕事を理解し自律的に実行する Windows AI社員
プラットフォームである。現在の最優先目標は **Epic β-001「営業部運用版完成」** 。

設計ドキュメントは以下の優先順位で参照する(詳細は
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 第0章)。

1. [docs/COMPANY_GENOME.md](docs/COMPANY_GENOME.md) — Mission/Vision/Values/行動原則
2. [docs/DEVELOPMENT_BIBLE.md](docs/DEVELOPMENT_BIBLE.md) — 開発の絶対ルール
3. [docs/ORGANIZATION_BIBLE.md](docs/ORGANIZATION_BIBLE.md) — 組織構造(8本部)
4. [docs/AI_EMPLOYEE_BIBLE.md](docs/AI_EMPLOYEE_BIBLE.md) — AI社員個々の定義
5. [docs/department-playbooks/](docs/department-playbooks/) — 部門別運用書
6. [docs/SECURITY_BIBLE.md](docs/SECURITY_BIBLE.md) — セキュリティルール
7. [docs/PLUGIN_SDK_BIBLE.md](docs/PLUGIN_SDK_BIBLE.md) — プラグイン拡張仕様

システム設計・実装ロードマップへの落とし込みは
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照する。

## 現在のステータス: Epic β-001 優先タスク1〜7 実装済み(実機検証待ち)

このリポジトリは、Issue open をトリガーに `main_app.py` / `spec.md` をAIが
上書き生成し続ける自動ループ(旧`.github/workflows/ai-pipeline.yml`)により、
長期間「完了済み」を名乗るコミットが積まれていましたが実体が無い状態でした
(経緯は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) 第6章)。ワークフローを
無効化し、以下の7項目をモノレポ構成でゼロから実装・単体テスト・相互配線しました。

1. Windows デスクトップアプリ化 (`apps/desktop`) — Electron、トレイ常駐、自動起動
2. MUSA 常駐アバター (`packages/avatar-2d`) — 状態機械 + オーバーレイウィンドウ
3. Sales Workspace β 版仕上げ (`apps/sales-workspace`) — React + Vite UI
4. FileMaker連携 (`packages/integrations/filemaker`) — Real/Mockアダプタ
5. Zoom Phone連携 (`packages/integrations/zoom-phone`) — Real/Mockアダプタ
6. Voice Analysis (`packages/voice-analysis`) — 感情分析・キーワード検知・通話サマリ
7. Voice Engine (`packages/voice-engine`) — TTS/STTプラガブルプロバイダ

**未検証・既知のギャップ**(`apps/desktop/README.md` 参照):
実際のWindows起動・インストーラビルドはこの開発コンテナのegressポリシー上
Electronバイナリを取得できず未実施。実FileMaker/Zoom Phone/VOICEVOX/whisper.cpp
サーバーへの接続も同様に未検証。Voice EngineのSTT出力とVoice Analysisの入力を
繋ぐ話者分離(ダイアライゼーション)は未実装。3Dアバター(`packages/avatar-3d`)は
このEpicのスコープ外(β版完成後の拡張)。

## リポジトリ構成

```
apps/
  desktop/            Desktop Application(Tauri、Windowsインストーラ、トレイ常駐)
  sales-workspace/    Sales Workspace β 版 UI(React + Vite)
packages/
  avatar-2d/          MUSA 常駐アバター(2D オーバーレイ、状態機械)
  avatar-3d/          3D アバター(ロジック層+three.js/VRM実レンダラーはapps側)
  voice-engine/       TTS / STT(発話合成・音声認識)
  voice-analysis/     通話音声解析(感情分析・キーワード抽出・SQLite永続化)
  ai-core/            AI Sales Employee ロジック(リード優先順位付け・日次計画・KPI)
  ai-company/         AI Company System(組織階層・AI社員モデル・Genome・承認フロー)
  call-training/      コール三段階運用(Learning/Test/AutoCall、Mock架電、共通ナレッジ)
  integrations/       外部サービス連携(FileMaker、Zoom Phone)
  connectors/         Phase 3 コネクタ・フレームワーク(GitHub/Excel/カレンダー/Zoom Phone/FileMaker/会計。Mock・本番未承認・承認ゲート)
  ai-pm/              Phase 4 AI PM(改善提案の優先順位付け・実行キュー・レビューゲート・経営サマリー)
  tenancy/            Phase 5 マルチテナント/プラン/機能ゲート(Free/Pro/Enterprise、使用量・上限、Mock課金)
  ops-monitor/        Phase 6 運用監視(SLO評価・インシデント・復旧ランブック)
  evolution/          Phase 7 自己進化(改善提案の自動生成・ドラフトIssue・ナレッジ品質スコア)
  governance/         AI経営ガバナンス(AI経営陣8役職・月次予算/KPI・着地予測・リスク・是正提案・承認ゲート)
  audit/              AI監査・リスクガバナンス(独立監査・異常/ポリシー違反/KPI整合性/承認遵守検知・部門リスクスコア・一時停止提案)
  advanced-modules/   アドバンスドモジュール12種(Musasabi DNA/Company Brain 2.0/COO指令室/意思決定支援/営業コーチング等。Mockパネル+サービススタブ)
  ecosystem/          Phase 8 AIエコシステム(部門/AI社員/ワークフローのテンプレート・内部マーケットプレイス・安定拡張API)
  agi/                Phase 11 Musasabi AGI(自己最適化/ワークフロー/部門・AI社員新設提案・Company Brain進化・戦略立案。承認/監査/憲章下)
  memory/             Brain Memory Engine(未実装、Epic β-001完了後)
  vision/             Vision Engine(未実装、Epic β-001完了後)
  automation/         Automation Engine(未実装、Epic β-001完了後)
  self-improvement/   Self Improvement Engine(未実装、Epic β-001完了後)
  shared/             IPC プロトコル・型定義・共通ユーティリティ
docs/
  COMPANY_GENOME.md       Mission/Vision/Values/行動原則
  DEVELOPMENT_BIBLE.md    開発の絶対ルール
  ORGANIZATION_BIBLE.md   組織構造(8本部)
  AI_EMPLOYEE_BIBLE.md    AI社員個々の定義
  department-playbooks/  部門別運用書
  SECURITY_BIBLE.md       セキュリティルール
  PLUGIN_SDK_BIBLE.md     プラグイン拡張仕様
  ARCHITECTURE.md         システム設計・実装ロードマップ
tests/                横断的な統合・E2Eテスト(現状は各パッケージ内の単体テストのみ)
scripts/              ビルド・リリース・開発補助スクリプト
config/               環境別設定
plugins/              Plugin SDK 準拠のプラグイン
```

## 外部連携コネクタ(Phase 3・D-20260708-004)

外部業務システム連携の「コネクタ・フレームワーク」を `packages/connectors` に用意しています。
ビジネスロジックと連携実装を分離し、**まず Mock アダプタで動作**します。

- 対象: GitHub / Microsoft Office・Excel / カレンダー / Zoom Phone / FileMaker / 会計ソフト
- **すべて Mock モード**。本番接続は**明示承認まで無効**(`productionApproved=false`)
- **読み取りを書き込みより先に実装**。本番書き込みは**承認ゲート(承認者・理由)必須**
- 全操作を**監査ログ**へ記録。**secrets はリポジトリに保存しない**(実接続時に実行環境から注入)
- UI: 管理画面サイドバー「外部連携コネクタ」で一覧・Mock 操作デモ・監査ログを確認可能

実接続(本番アダプタ)は、承認・権限・ログ整備が完了し、ユーザーが明示的に有効化するまで行いません。

## セットアップ

```
npm install
npm run build   # 全パッケージをビルド(依存順に自動でビルドされる)
npm test        # 全パッケージのユニットテスト
```

## β版評価ビルドの起動手順(D-20260706-002)

β版は Mock 構成で安全に操作できる評価ビルドである。**実API接続・実認証情報の保存・
実架電は一切行わない**(FileMaker / Zoom Phone / VOICEVOX / whisper.cpp は Mock
または「準備中」表示。AutoCall 本番実行は無効)。

### 1. Tauri デスクトップとして起動(Windows 推奨)

前提: Node.js 22+、Rust ツールチェイン、WebView2 ランタイム
(<https://tauri.app/start/prerequisites/> 参照)。

```
npm install
npm run dev:desktop     # フロントをビルドして Tauri ウィンドウで起動
```

Windows インストーラ(NSIS `.exe` / MSI `.msi`)の作成:

```
npm run build:desktop    # = npm run package:win(tauri build)
```

成果物は `apps/desktop/src-tauri/target/release/bundle/nsis/*.exe` および
`bundle/msi/*.msi` に出力される。

### 3. GitHub Actions でインストーラを取得(ローカルにRust環境が無い場合)

> 実績: 2026-07-06 の [Beta Build 実行](https://github.com/grant-inc0801/Musasabi-OS/actions/runs/28769588852)
> で Windows インストーラの Artifact 生成に成功している。

1. GitHub リポジトリの **Actions → Beta Build** を開き、**Run workflow**(Branch: main)で
   手動実行する(`workflow_dispatch` のみ。自動トリガーは無い。所要 約6〜10分)
2. 完了後、実行結果ページ下部の **Artifacts** から
   `musasabi-beta-windows-<sha>` をダウンロードする(要GitHubログイン。保持期間14日)
3. zip を展開すると NSIS インストーラ `Musasabi OS_0.1.0_x64-setup.exe` と
   MSI `Musasabi OS_0.1.0_x64_en-US.msi` が入っている。どちらか一方を実行して
   インストールする(未署名のため SmartScreen 警告が出た場合は
   「詳細情報」→「実行」を選択)
4. β版として配布する場合は、artifact の内容を確認したうえで GitHub Releases に
   手動でアップロードする(自動公開・署名は行わない)

### アプリアイコン(ブランド)

正式アプリアイコンは **黒背景 × 白塗りムササビ・シルエット**(右上へ滑空・文字なし・
AI表記なし。Issue AV-ICON-001)。ブランドアセット一式は `assets/brand/` に配置する。

![Musasabi アイコン](assets/brand/musasabi-icon-256.png)

- `assets/brand/musasabi-icon-{1024,512,256,128,64,32}.png` / `musasabi-icon.svg` /
  `musasabi-icon.ico` / `musasabi-icon-master.png`
- デスクトップアプリ用の書き出しは `apps/desktop/src-tauri/icons/`(同一デザイン)
- 再生成: `python3 scripts/generate-brand-assets.py`(依存: Pillow)。デスクトップ用は
  `python3 scripts/generate-icon-from-source.py`
- 詳細は [docs/brand-guideline.md](docs/brand-guideline.md) を参照

### 2. ブラウザで起動(Rust 環境が無い場合の代替)

```
npm install
npm run dev:web         # Vite dev server(http://localhost:5173)
```

### β版で操作できる画面

管理画面は Development Bible 第7章 UI Philosophy(Glass / Minimal / Professional /
Dark対応、Windows Nativeフォント・速度優先)に準拠したガラス調ダークテーマ+
部門ツリー型サイドバー構成。サイドバーには**部門名のみ**を表示し、
部門配下のサブ項目(営業部 → KPI / コールトレーニング / Sales Brain)から各詳細ページへ
遷移する(β版はすべてMock値)。

| 画面 | 内容 |
| --- | --- |
| 営業部 > KPI(既定) | 全体KPI・AI社員別KPI(コール結果)をグラフと表で表示し、件数(架電/アポ/成約)と率(アポ率/成約率)を算出(売上表示なし)。日次計画・推奨アクション・リード一覧も表示 |
| 営業部 > コールトレーニング | Learning / Test / AutoCall の三段階+通話解析デモ。Test Mode は Mock 架電を操作可能、Learning Mode では日々の作業内容を手動登録して学習させられる。AutoCall は「準備中・承認待ち」で本番実行不可 |
| 営業部 > Sales Brain | 学習データソース(Mock/準備中)と全AI社員共通トーク改善ナレッジ |
| 出版部 | 成果物一覧・販売数・売上(Mock)の表示 |
| 開発部・サポート部 | 部門詳細ページ(進捗・作業内容。専用機能は後続フェーズ) |
| AI社員管理 | 接続線つき組織図(所属人数バッジ・クリックで名簿絞り込み)+AI社員名簿+Company Genome |
| 設定 | AI社員・音声(Mock)・既定コールモード、外部サービス接続準備状況(ダミー値のみ) |

### 右下常駐アバターとミニパネル(デスクトップ版)

- メインウィンドウを **閉じる(X)/最小化** すると、管理画面は隠れて
  **デスクトップ右下のMUSAアバターだけが常駐** する。常駐時はウィンドウ自体が
  アバターサイズまで縮小され、アバター以外の透明領域は残らない(D-20260706-006)
- **アバターをクリック** するとミニパネルが開閉する(パネル・入力欄・モード切替は
  クリック時のみ表示)。ミニパネルでは
  - 現在のモード表示と Learning / Test / AutoCall の切替
    (オートコールは「承認待ち」表示のみで本番実行不可)
  - チャット欄からAI社員(MUSA)への指示(応答は決定論的なMock)
  - **アバターサイズの調整**: スライダー(48〜160px)。設定は保存され、
    アバターのみの常駐表示にも反映される(スライダー操作中にウィンドウは動かない)
  - モード切替は縦配置で、選択中のモードに緑ランプが点灯する
  - 「メイン管理画面を開く」ボタンでの復帰
- モード切替時などに **吹き出し** で提案・通知(例:「次はTest Modeでロールプレイ
  確認しましょう」「AutoCallは承認待ちです」)が表示される。クリックで閉じる
- アバターは背景バッジのないキャラクター単体表示。ホバーで出る「⠿ 移動」ハンドルを
  ドラッグすると常駐位置を変更できる
- メイン画面はシステムトレイの「開く」からも復帰できる

MUSAアバターは **three.js による3D表示**(Issue #200 実装済み)。既定では
プリミティブ製の3Dムササビ(呼吸・浮遊アニメーション付き)が表示され、
ミニパネルの「VRMアバターを読み込む(VRoid)」から **VRoid Studio 製の
.vrm ファイル** を読み込むと差し替わる(表情は業務ステータスに連動、
まばたき・呼吸の待機モーション対応)。読み込みはローカルファイルのみで
外部送信はしない。WebGLが使えない環境では従来の絵文字表示へフォールバックする。

Windows 実機での確認手順は
[docs/WINDOWS_VERIFICATION_CHECKLIST.md](docs/WINDOWS_VERIFICATION_CHECKLIST.md) を参照。
GitHub Actions の手動実行(`workflow_dispatch`)による評価ビルドは
`.github/workflows/beta-build.yml` を使用する。
