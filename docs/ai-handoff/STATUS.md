# Status

**State:** waiting_for_chatgpt
**Updated:** 2026-07-14
**Branch:** `claude/musasabi-epic-beta-001-c6svi5`

## 直近の完了内容(第25弾: 保管庫文書の編集)
updateVaultDocument(タイトル/タグ編集・タイトル変更時はID改版で再索引)+保管庫ページ
行内編集UI+🏷タグ表示。E2E 7/7・0エラー。

## それ以前の完了内容(第24弾: AI司書の定例整理提案)
AgentSchedule kind "vault_curation" — 定例で整理候補を提案(提案のみ・削除なし)、
候補があれば要対応通知+Brain記録。スケジューラにテンプレ+🧹バッジ。E2E 7/7・0エラー。

## それ以前の完了内容(第23弾: チャットヘルプ+実未読バッジ)
チャット「ヘルプ」でコマンド一覧即答。Mission Control ヘッダー🔔を実未読イベント数に
実データ化(クリックで通知センターへ)。E2E 3/3・0エラー。

## それ以前の完了内容(第22弾: Automation保管庫保存+診断チャット)
Automation再実行の完了時にサマリーを保管庫へ自動保存+実イベント記録。チャット
「接続状況は?」でローカルAI5連携を実診断即答(🟢/🟡/🔴+💡ヒント)。E2E 6/6・0エラー。

## それ以前の完了内容(第21弾: ローカルAI連携の状態診断)
localDiagnostics.ts(LLM/埋め込み/VOICEVOX/whisper/SD を並列診断・接続済/代替/未検出+
有効化ヒント)。設定ページ最上段に診断パネル+再診断。E2E 8/8・0エラー。

## それ以前の完了内容(第20弾: 予測レポート保管庫自動保存+CC取込)
深層予測完了時にレポート全文MDを保管庫へ自動保存(チャット検索で引ける完全循環)。
CC保管庫詳細パネルに資料取込を追加。E2E 5/5・0エラー。

## それ以前の完了内容(第19弾: 的中率の週次推移チャート)
forecastAccuracyTrend(7日ビン×8週・判定ベース)+市場調査部にSVG折れ線
(検証済み#16A34A・判定なし週は線を分断・直近値ラベル・ツールチップ)。E2E 6/6・0エラー。

## それ以前の完了内容(第18弾: チャット「今日何した?」)
todayDigest に isTodayDigestQuery/buildTodayDigestReply を追加し、チャットで
「今日何した?」「本日の動きは?」に当日実データで即答(決定論・誤発火防止)。
E2E 7/7・0エラー。

## それ以前の完了内容(第17弾: 全社レポートへの実データ統合)
reportRealData.ts(保管庫/的中率/実イベント/定例実行の決定論集計+Markdown整形)。
レポートのプレビュー・Markdownエクスポートに実データサマリー統合、JSONに realData。
E2E 8/8・0エラー。

## それ以前の完了内容(第16弾: チャット保管庫検索)
vaultSearch.ts: 「保管庫で◯◯を探して」コマンド → 部分一致(該当箇所引用)+意味検索
フォールバック(vaultチャンク限定)。決定論整形でLLM不要。チャットヒント更新。
E2E 6/6・0エラー。

## それ以前の完了内容(第15弾: 保管庫のAI司書)
vaultCuration.ts: 整理候補の決定論提案(同名旧版/30日超のAI成果物)→候補ごとの承認で
「要約を残して削除」(Brain+実イベント記録)。保管庫ページに承認制UI。E2E 8/8・0エラー。

## それ以前の完了内容(第14弾: ワークスペース「今日の動き」実データ化)
todayDigest.ts(当日0時以降の実イベント/保管庫/的中率/定例実行/Brainを決定論集計+
読み上げ文生成)。ワークスペース最上段に実データダイジェスト+⚠未読要対応
(通知センターへ)+🔊読み上げ。E2E 8/8・0エラー。

## それ以前の完了内容(第13弾: 保管庫のエクスポート/インポート)
exportVaultJson(専用JSON・版付き)+importVaultJson(重複/容量スキップ・エラー時は
既存データ無傷)。保管庫ページにエクスポート/取込UI。別端末へ保管庫を持ち運び可能。
E2E 8/8・0エラー。

## それ以前の完了内容(第12弾: 通知センターの実イベント化)
appEvents.ts(実イベントストア・上限100件)+notifyOs フック(全OSトースト発生源を
権限に関わらず記録・承認待ちは warn)。通知センター上段に実イベントセクション
(未読管理・履歴消去)、下段はMockと明示。E2E 9/9・0エラー。

## それ以前の完了内容(第11弾: Mission Control 実データ司令塔)
Mission Control に「AI自律ループ(実データ)」パネル: 保管庫/予測的中率/定例実行/Brain記録の
実データタイル+直近AI成果物。タイルクリックで該当ページへ遷移。E2E 7/7・0エラー。

## それ以前の完了内容(第10弾: 予測突合の定例自動実行)
AgentSchedule に kind "forecast_verify" 追加。定例スケジュールとして予測×実績の自動突合
(決定論・LLM不使用)が走り、的中率を Brain 記録+OS/Webhook 通知。スケジューラUIに
テンプレート「予測突合」と⚖バッジ。E2E 7/7・0エラー。

## それ以前の完了内容(第9弾: エージェント成果物の保管庫自動保存)
saveAgentDocToVault(source: "agent"・失敗は通知に明記)を実行センター/部署AI会議/
チャット実行/予測承認実行の完了時に配線。実行報告・議事録が保管庫へ自動保存され
RAG索引→チャット等から意味検索で参照可能(自己参照ループ完成)。E2E 6/6・0エラー。

## それ以前の完了内容(第8弾: 予測の的中率トラッキング)
evaluateForecastOutcome(決定論キーワード突合)+forecastTracking.ts(pending自動記録→
RSS+社内記録と自動突合→hit/partial/miss・手動上書き可)+市場調査部ダッシュボード
(的中率/統計タイル/突合根拠)+的中率実績を次回予測の較正へフィードバック。
単体18件・E2E 10/10・0エラー。

## それ以前の完了内容(第7弾: 保管庫の実装化)
vaultStorage.ts(実文書ストア・容量管理40万文字・400文字チャンク化)+保管庫ページ新設
(取込/一覧/削除/容量バー)+brainRag へ索引統合(削除時は索引から自動掃除)+企画部保存と
CC保管庫パネルの実データ化。チャット・エージェント・予測が保管庫の実文書を参照可能に。
E2E 12/12・0エラー。

## それ以前の完了内容(第6弾: AGI深層予測)
runForecastDeep: 主分岐3本→サブ分岐展開(2階層・最大6葉・両層に倫理フィルタ)→批評AIの
自己批評で確率較正→前回予測履歴からの学習ノート→葉レベル選出→提案にMusasabi憲章チェック
(packages/agi)。UIはツリー表示+較正後/生成時併記+学習カード。単体17件・E2E 12/12・0エラー。

## それ以前の完了内容(第5弾: 未来予測機能)
forecast.ts: 市場実データ+社内RAG→3分岐シナリオ(半年後/1年後/実現性%)→倫理フィルタで
除外理由つき排除→実現性最大を選出→「今取り組める提案」生成→市場調査部UIで承認後に
エージェントが構築・実行(承認は監査記録)。単体15件・E2E 8/8・0エラー。

## それ以前の完了内容(第4弾: Secret Center+メール通知)
Rust keyring で OS資格情報ストアへ暗号化保管(secret_set/exists/delete・値はJSへ返さない)。
lettre で send_mail(STARTTLS・パスワードはRust内部で取得・偽SMTPで実送信検証)。
無料コネクタにメール通知UI(第3チャネル)。設計書 SECRET_CENTER_DESIGN.md。E2E 3/3・0エラー。

## それ以前の完了内容(第3弾⑤⑥⑦: ICS+チャット履歴RAG+ローカル画像生成)
⑤icsExport(.ics書き出し・RRULE対応・スケジューラに📅)⑥意味検索にチャット履歴100件を索引追加
⑦imageGen(SD WebUI自動検出・txt2img実生成・PNG保存・マーケ部UI)。E2E 4/4・0エラー。
**本番実装第3弾①〜⑦すべて完了**。

## それ以前の完了内容(第3弾②③: 部署AI会議+モデルルーティング)
runDiscussion(3人格×2ラウンド+AI CEO結論・Brain保存・議事録保存)を実行センターに搭載。
AgentRuntime に reportProvider(計画/報告=高品質・行動/観察=高速)を追加し全実行経路に適用。
単体13件・E2E 10/10・0エラー。残: ⑤ICS ⑥保管庫RAG ⑦SD検出。

## それ以前の完了内容(第3弾①④: 会話メモリ+OSトースト)
chatWithHistory(直近8ターンの文脈保持・単体10件)でチャットが継続会話対応。lib/osNotify.ts
(tauri-plugin-notification/Web Notification)でエージェント完了・承認待ちをOS通知。
E2E 2/2(2通目で文脈伝搬)0エラー。残: ②マルチエージェント協調 ③モデルルーティング
⑤ICSエクスポート ⑥保管庫RAG ⑦SD検出。

## それ以前の完了内容(チャット指示実行=Claude Code方式)
アシスタントチャットが指示実行IFに: 「実行 ◯◯」/▶実行でエージェント実自律実行、承認ノードは
チャット内停止→「承認」で再開、完了で✅最終報告+Brain保存+Webhook通知。テンプレート推定
(週次/新サービス/汎用)。通常質問(LLM+RAG案内)と共存。E2E 6/6・0エラー。

## それ以前の完了内容(本番実装第2弾④⑤⑥: 自動バックアップ+資料読み取り+キャッチアップ)
④lib/autoBackup.ts(毎日自動・Tauri fs実書き込み・データ管理にUI)⑤エージェント資料添付
(summarizeが実ファイル内容を要約)⑥起動5秒後のキャッチアップ実行。E2E 5/5・0エラー。
**本番実装第2弾①〜⑥すべて完了**(①STT ②RSS ③VOICEVOX ④バックアップ ⑤資料 ⑥キャッチアップ)。

## それ以前の完了内容(本番実装第2弾②③: RSS実データ調査+VOICEVOX)
② Rust fetch_rss(GET・1MB上限・rustls)+lib/rssFeeds.ts(RSS2/Atomパース)+市場調査部の
実データソースUI+エージェントresearchにRSS見出し統合(E2E 3/3)。③ Rust local_tts_synthesis+
speakJaBest(VOICEVOX自動検出・未検出はWindows内蔵音声)(E2E 1/1)。0エラー。
次: ④定期自動バックアップ→⑤ファイル読み取りツール→⑥定例キャッチアップ。

## それ以前の完了内容(本番実装第2弾①: 実STT)
Rust local_stt_request(multipart・localhost限定)+lib/stt.ts(whisper自動検出・録音→WAV16k変換→
/inference・OpenAI互換フォールバック)。音声入力ボタン本物化(未検出時はMock表示)。
E2E 3/3(実録音→実HTTP文字起こし)0エラー。次: ②RSS実データ調査→③VOICEVOX→④自動バックアップ→
⑤ファイル読み取りツール→⑥定例キャッチアップ。

## それ以前の完了内容(無課金本番化 B: 無料外部連携・オプトイン)
lib/freeConnectors.ts: Discord/Slack Webhook 実通知(エージェント完了時)+GitHub実データ
(Mission Control に実カード表示)。URL/トークンは端末内のみ・未設定なら外部送信ゼロ。
コネクタページに設定/テストUI。E2E 4/4(実HTTP受信検証)+回帰2本 0エラー。
メール/カレンダーは Secret Center 設計後の後続。**無課金本番化 A1〜B すべて完了**。

## それ以前の完了内容(無課金本番化 A3+A5: 実TTS+実OCR)
lib/voice.ts: SpeechSynthesis(Windows内蔵・オフライン)で日本語読み上げ(チャット返答🔊/
エージェント最終報告)。lib/ocr.ts+Visionページ: tesseract WASM 実OCR(日本語+英語・
エンジン/言語データ同梱・オフライン・Brain記録)。E2E 5/5(実画像認識 信頼度90%)0エラー。
実STTはローカルwhisper導入が必要なため後続。残: B(無料外部連携)。

## それ以前の完了内容(無課金本番化 A2+A4: エージェント定例実行+実ファイル出力)
lib/agentSchedule.ts: 登録目標を期限到来で実自律実行(毎時/毎日/毎週・承認ノードは事前承認
フラグで自動続行+監査記録・完了時Brain保存・直近5件ログ)。スケジューラページに登録/今すぐ実行/
実行ログUI。最終報告・定例報告のMarkdown実ファイル保存。agentTools共用化。E2E 7/7・0エラー。
残: A3+A5(音声+OCR)→B(無料外部連携)。

## それ以前の完了内容(無課金本番化 A1: Company Brain 意味検索+RAG)
packages/brain-rag 新規(Ollama埋め込み nomic-embed-text + ハッシュ埋め込みフォールバック +
コサイン類似ベクトル索引・増分・localStorage保存)。Company Brain に意味検索UI、チャットは
関連社内記録をLLMへ注入(実RAG)、エージェントの research_snapshot を実RAG検索化。
単体5件 pass・E2E 3本 0エラー。残: A2+A4(スケジューラ実実行+実ファイル出力)→A3+A5→B。

## それ以前の完了内容(Ollama接続 HTTP 403 の根治=Rustプロキシ)
実機診断で原因確定(Tauri WebView の Origin ヘッダを Ollama が拒否)。Rust コマンド
local_llm_request(reqwest・Originなし・localhost限定・接続3s/全体120sタイムアウト)を新設し、
llmFetch を invoke ベースへ切替。OLLAMA_ORIGINS 設定不要で接続可能に。独立クレートで実HTTP検証済み。

## それ以前の完了内容(LLM検出の診断表示)
未検出時に頭脳カードへ診断行(接続先URL/接続経路=ネイティブHTTP or ブラウザfetch/失敗理由+確認手順)
を表示。probe() が失敗理由を返すよう拡張(タイムアウト3秒)。単体9件 pass・E2E 2本 0エラー。

## それ以前の完了内容(デスクトップ版Ollama接続のネイティブHTTP化)
Tauri環境では @tauri-apps/plugin-http(Rust経由・CORS制約なし)でOllamaへ接続する llmFetch を追加。
capabilities に 127.0.0.1:11434 / localhost:11434 を許可。OLLAMA_ORIGINS 設定不要で接続可能に。
READMEにトラブルシューティング追記。E2E 2本 0エラー。

## それ以前の完了内容(本物のエージェント転換: ローカルLLM+実行ループ)
`packages/agent-runtime` 新規: 無料ローカルLLM(Ollama互換API・localhost)自動検出+ルールベース
フォールバックの頭脳差し込み、計画→行動→承認→観察→報告の自律ループ(ポリシー検証・人間承認ゲート・
監査ログ・Company Brain 書き込み・maxSteps ガード)。エージェント実行センター(Workflow)新設。
アシスタントチャットもLLM頭脳化(未検出時は決定論応答)。単体8件 pass・E2E 2本(LLMあり/なし)0エラー。

## それ以前の完了内容(UIフィードバック第11弾・チャット欄横長化)
コマンドセンター右下のアシスタントチャットをサイドバー境目(180px)から右端まで横長化
(left:196px/right:20px)。クイック質問を横並びへ・入力/履歴の高さ圧縮。build成功・E2E 0エラー。

## それ以前の完了内容(STAGING-001: Mock/Staging デプロイ準備・Issue #302)
build ✅ / 全テスト544件 pass ✅ / 秘密情報スキャン ✅(lint は各パッケージ未定義=ギャップとして文書化)。
docs/ai-handoff 34ファイルの main 反映確認。docs/STAGING_DEPLOYMENT.md 新規(Web/Windows 配備手順・
ロールバック・本番ゲート4種の状態)。npm run preview:web(vite preview)追加・動作確認。
Production Readiness は4ゲートすべて無効のまま(本番デプロイは行わない)。

## それ以前の完了内容(Musasabi Intelligence Layer・Mock)
指示書 MUSASABI_INTELLIGENCE_LAYER を実装。`packages/intelligence-layer`(新規): AI Policy Engine
(13カテゴリ・優先度6段・validateDecision=実外部変更/課金を遮断)、Knowledge Graph(ノード14種・
MEISHI-TUBE連結・関連検索/根拠追跡)、Workflow Composer(ノード13種・例示フロー=営業→調査→マーケ→
CEO承認→開発→監査・validateWorkflow)、Explainability Center(13項目+スコア5軸・弱い説明検出)。
AI秘書統一カード/AI監査監視6種/CEOサマリー/Company Brain保存を統合。テスト11件 pass。
IntelligenceLayerPage(Knowledge)+CeoDashboardPanelサマリー+秘書カード統合。build成功・E2E 0エラー。
実ポリシー強制・実実行は承認までロック。

## それ以前の完了内容(UIフィードバック第10弾・最小化ウィンドウをアイコン枠と同サイズに)
最小化時の透明ウィンドウがアイコンより大きく(96×122px)、余りがガラス枠として見えていた問題を修正。
desiredWindowSize(アイコンのみ)をアイコン+16px(=80×80、バッジはみ出し分のみ)に縮小し、撤去済み
ドラッグハンドルの高さ確保を全廃。ステータス光彩も余白内(7px)に縮小。Playwright(80×80)でアイコンが
ウィンドウにぴったり収まることを確認・0エラー。

## それ以前の完了内容(マーケティングPDCA + 最小化アイコンUI・Mock)
指示書 MARKETING_PDCA_AND_MINIMIZED_ICON を実装。`packages/marketing-pdca`(新規): 投稿タイトル単位管理・
数値分析12指標・PDCA(Plan/Do/Check/Act)・バージョン管理(ベスト印)・Company Brainナレッジ化・AI秘書統一カード。
テキストロック時は解析のみ。テスト11件 pass。`MarketingPdcaSection`(マーケ部)+ AiSecretaryPanel にマーケカード統合。
最小化アイコン(overlay avatar.html): 枠線/箱枠撤去(border:none)・メタリック下地+光沢/反射のみ・ステータス光彩
(緑/黄/紫/赤)・承認/アラート件数バッジ・ホバーで秘書サマリー。build成功・秘密情報スキャン pass・E2E 0エラー。

## それ以前の完了内容(AI統合センター / AIモデルレジストリ・Mock)
指示書 AI_MODEL_REGISTRY_DIRECTIVE を実装。`packages/ai-model-registry`(新規): 9プロバイダ・能力スコア14軸・
タスク別ルーティング(8)・モデル比較(7項目)・アップグレード評価(CEO承認申請・実採用ロック)・AI秘書通知6種・
Company Brain 利用ナレッジ・Secret Center ルール(APIキー非保持・参照名のみ)。テスト12件 pass。
`AiIntegrationCenterPage`(Integrations に追加)+ AiSecretaryPanel にモデル通知セクション。
build成功・秘密情報スキャン pass・Playwright E2E 0エラー。本番接続は承認までロック。

## それ以前の完了内容(AI秘書 右詳細パネル + 市場調査/マーケティング部門)
指示書 AI_SECRETARY_RIGHT_DETAIL_PANEL / MARKET_RESEARCH_AND_MARKETING_DEPARTMENT を統合実装(Mock)。
`packages/ai-secretary`(新規): 統一カード9カテゴリ・デイリーブリーフィング・フィルタ・6種Mockアクション、
市場調査レポート(標準形式・機会スコア・競合トップ3)、マーケSNS投稿(テキストロック/繰り返し/頻度5種/添付/
承認/決定論解析/Mock予約・本番投稿ロック)。テスト11件 pass。`AiSecretaryPanel`(CC右パネル既定=部署未選択で
AI秘書、選択で部署詳細、閉じると復帰)、`ResearchReportsSection`(市場調査部)、`SnsPostingWorkflow`(マーケ部)。
build成功・秘密情報スキャン pass・Playwright E2E 0エラー。

## それ以前の完了内容(UIフィードバック第9弾・管理画面コンパクト化+重複削除)
管理画面(main.content)の文字/余白/カード/テーブルを詰めてデスクトップ1画面に収まりやすく調整。
サイドバー注記の重なりを修正(.sidebar-nav flex-shrink:0)。重複ページ「AI自己進化」(self_evolution)を削除し
「AI改善提案 / 自己進化」(improvement)へ集約(OperationsPage 導線も更新)。デスクトップ常駐アイコンを完全固定
(右下アンカーを初回確定・以後固定=開閉ドリフト解消)、サイズ64px・75%透過(ホバーで不透明)。build成功・E2E 0エラー。

## それ以前の完了内容(UIフィードバック第8弾・アバター全廃→アイコン)
シリンダー縦2/3(112px)、ミニパネル(overlay avatar.html)をダークガンメタルへ統一、全社ダッシュボード
ボタンを稼働率の直下に配置、キャラクターアバター全廃→musasabiアイコン化(avatarMain.ts は常にアイコン、
移動なし・サイズ固定・ガラス面をアイコン枠で切り取り、ドラッグ/スライダー撤去)、コマンドセンターの
AssistantAvatar撤去、チャット欄を右下フロート化(cc-chat-dock/fab)+部署プルダウン廃止+単一の
Musasabiアシスタント(操作方法・何がどこにあるかを案内、lib/assistantHelp.ts)。build成功・E2E 0エラー。
アバターは全廃(ユーザー確認=B案): アバター作成スタジオ/アバターモーション/Musasabi Android仕様の
ページとナビ、packages/avatar-android、未使用 AssistantAvatar.tsx を削除。build成功・E2E 0エラー。

## それ以前の完了内容(Musasabi Android アバター制作仕様・完全版)
指示書「Musasabi OS アバター制作 指示書(完全版)」に基づき公式アバター Musasabi Android の仕様を実装。
`packages/avatar-android`(新規): モノアイ8感情+発光カラー(HEX)+ライトアニメ、制御パラメータ導出
(色/明るさ/点滅/スキャン)、Emotion State ペイロード、モーション16種、3Dモデル仕様(GLB/FBX/VRM・
約6万ポリゴン・PBR 4K・フルリグ)、カラー参照、Tripo3D フロー、決定論的 buildTripoPrompt/buildTripoRequest。
`AvatarAndroidPage`(新規): 発光モノアイビジョア(scan/blink)8カード+制御メーター+Emotion State JSON+
モーション一覧+3Dモデル仕様表+カラーパレット+Tripo3D フロー(🔒承認待ち)+生成プロンプト+未送信テンプレート。
サイドバー AI Assistant に追加。**実モデル生成(Tripo3D API)は APIキー+人間承認が必要なため未実行**
(TRIPO_GENERATION_LOCKED=true、外部接続・課金なし、APIキーは参照名のみ)。avatar-android テスト12件 pass、
秘密情報スキャン pass、Playwright で 8モノアイ・プロンプト・ロック・0エラー確認。

## それ以前の完了内容(Production Readiness 設計・設計のみ)
指示書 MASTER_ROADMAP_TO_PRODUCTION.md 再送に対し、ユーザー選択「本番準備の設計だけ作成」で Production
Readiness の **設計ドキュメント・構成テンプレート(secretsなし)** を Mock 用意。**実装はしない**(実認証情報・
実接続・課金・本番デプロイは人間承認まで一切なし。全項目ロック維持)。`production-roadmap` の `ReadinessItem`
に `design` を追加し11項目に設計要旨を記述+`PRODUCTION_READINESS_DESIGN_DOC` 定数。新規
`docs/ai-handoff/PRODUCTION_READINESS_DESIGN.md`(11項目設計)と `docs/production-readiness/`
(.env.example=プレースホルダのみ / ENVIRONMENTS.md / deploy-pipeline.example.yml=不活性・workflows外)。
`ProductionRoadmapPage` に設計バッジ+設計テキスト+設計ドキュメント参照を表示(ロック維持)。
production-roadmap テスト12件 pass、秘密情報スキャン pass、Playwright で 11カードの設計表示・0エラー確認。

## それ以前の完了内容(Mission Control Dashboard Phase 1)
指示書に基づき AI企業の司令室ホーム「Mission Control」を実装。`packages/mission-control`(全データを
オブジェクト/配列で管理、後からGitHub等へ差し替え可能)+ `MissionControlPage`(10セクション: HEADER/
AI CEO/AI PM/AI社員一覧/Department Cylinders/Today's Tasks/Approval Center/GitHub Development/
AI Timeline/System Status LED)。既存メタリックUIで統一、数値カウントアップ・時刻毎秒更新・レスポンシブ・
ロスターカードから部署ページへ遷移。サイドバー Dashboard に追加。mission-control テスト7件 pass。
Playwrightで全セクション・0エラーを確認。※前回のUI刷新 Beta Build も成功(installer 3e4ba7b 9.78MB)。

## それ以前の完了内容(Master Roadmap to Production)
指示書 MASTER_ROADMAP_TO_PRODUCTION.md に基づき `packages/production-roadmap` を新設。Mock 完成状況の
追跡(14スコープ・全 done・100%)と Production Readiness フェーズのゲート可視化(11項目・全て承認必須・
既定ロック)を実装。isProductionReadinessUnlocked は Mock完成 かつ 人間承認済みのときのみ解放
(既定 PRODUCTION_APPROVED=false でロック維持)。ProductionRoadmapPage を新設(完成度メーター・開発方針・
Mockスコープ・ロックされた本番項目🔒・リリースチェックリスト・本番ルール警告)。認証/secrets/本番DB 等は
実装せず追跡のみ(stop条件と整合)。production-roadmap テスト11件 pass。Playwrightで確認(0エラー)。

## それ以前の完了内容(Musasabi World)
指示書 MUSASABI_WORLD_DIRECTIVE.md に基づき `packages/musasabi-world`(business-factory 依存)を新設。
1つの事業アイデア/テンプレートから AI 会社ワークスペース(AI CEO体制・役員・事業ユニット・部門マップ・
AI社員名簿・KPI・ワークフロー・Company Brain・Musasabi DNA・Knowledge Vault・レポート・監査・Mock運用
データ)を決定論生成する generateCompany を実装。MusasabiWorldPage を新設(AI会社作成ウィザード→組織
プレビュー→起動確認Mock→生成会社ダッシュボード、初期ユースケース4件ワンクリック、生成会社を
localStorage 永続)。AI CEO アバター要約 summarizeCompanyJa。musasabi-world テスト9件 pass。Playwrightで
ウィザード・生成・永続・要約を確認(0エラー)。実アカウント作成・課金・外部接続・secretsなし。

## それ以前の完了内容(Musasabi Evolution Modules)
指示書 MUSASABI_EVOLUTION_MODULES_DIRECTIVE.md に基づき `packages/evolution-modules` を新設。次世代の
内部オペレーティングモジュール12種(AI Operating Manual/Skill Marketplace/Sandbox/Incident Center/
Meeting Room/Simulation Engine/Recruiting/Upgrade Manager/Health Center/Memory Timeline/
Command Console/Builder Department)を Mock パネル+サービススタブとして実装。各モジュールは Company
Brain・Musasabi DNA・ガバナンス・監査・経営ダッシュボードとの統合ポイントを表示。EvolutionModulesPage
を新設しGLOBAL_NAVから到達。右下アバター吹き出しに進化モジュール状況要約を追加。承認必須・監査ログ・
COO→CEO を明記。evolution-modules テスト8件 pass。Playwrightで12パネル・サービス実行・アバター要約を
確認(0エラー)。外部本番接続・secretsなし。

## それ以前の完了内容(Business Template Catalog)
指示書 BUSINESS_TEMPLATE_CATALOG_DIRECTIVE.md(AI_BUSINESS_FACTORY の拡張)に基づき、選択式の業種
テンプレートカタログを実装。`packages/business-factory` に `BUSINESS_TEMPLATES`(8種: MEISHI-TUBE/
SaaS/営業代行/出版/コールセンター/EC/飲食店/コンサル)と `provisionFromTemplate` を追加。テンプレート
選択で部門・AI社員・KPIダッシュボード・ワークフロー・必要ドキュメント・ダッシュボードカード・
リスク監視・レポートフォーマットを備えた事業ユニットを Mock 生成(監査リエゾン込み・COO→CEO)。
BusinessFactoryPage にカタログ節+生成ユニットの追加カード表示。business-factory テスト11件 pass。
Playwrightでカタログ8カード・SaaS/飲食店生成を確認(0エラー)。外部本番接続・secretsなし。

## それ以前の完了内容(AI Business Factory)
指示書 AI_BUSINESS_FACTORY_DIRECTIVE.md に基づき `packages/business-factory` を新設。標準テンプレート
(AI事業部長+営業/マーケ/開発/運用/CSチーム+財務サポート+AI監査リエゾンの8ロール)で新規事業
ユニットを立ち上げ、部門構造・KPI・ワークフロー・Company Brain・ナレッジ・レポート・リスク監視・
Mock運用データを決定論で自動プロビジョニング。初期ターゲット MEISHI-TUBE(稼働中・売上¥800,000/月)。
BusinessFactoryPage を新設(概要/テンプレ/新規立ち上げ/ユニット一覧/プロビジョニング結果/ガバナンス)。
レポートラインは AI COO→AI CEO・憲章遵守。business-factory テスト6件 pass。Playwrightで確認(0エラー)。
外部本番接続・secretsなし。

## それ以前の完了(CEO Dashboard 二層UI D-20260709-003)
指示書 CEO_DASHBOARD_TWO_LAYER_UI_DIRECTIVE.md に基づき二層UIを実装。Layer A(経営ダッシュボード)
に ceo-dashboard パッケージの経営メーター・アラート優先度・タイムライン・CEO提案ボックス
(承認→Issue Mock)・AI社員ランキングを追加。Layer B(部門クリック)に担当AI社員・ブロック項目・
承認待ち・監査メモ・提案→Issueを追加。アバター吹き出しにダッシュボード状態要約を追加。
ceo-dashboard テスト7件 pass。Playwrightで両層を実画面確認(0エラー)。

## それ以前の完了(部署パネル 円柱型進捗メーターUI)
部署パネルUI仕様書に基づき、Command Center の部署パネルを円柱型進捗メーターへ変更。
DepartmentCylinder(下から上へ充填・ステータス色連動・上部アイコン/部署名/状態・下部%・
100/50/0目盛り・ホバー拡大・クリックで詳細)を新設し DepartmentCard を差し替え。
グリッドは自動2段折返し(1段最大7)。Playwrightで円柱9本・充填・クリック詳細を確認(0エラー)。

## それ以前の完了(Musasabi Next Core Modules D-20260709-002)
指示書 MUSASABI_NEXT_CORE_MODULES.md に基づき `packages/next-core-modules` を新設。コアモジュール
12種(AI Constitution/Mission Control/Situation Room/Digital Twin/Relationship Graph/Memory/
Customer Brain/QA/Security Center/Cost Optimizer/Competitor/Innovation Lab)を Mock パネル/
サービスとして実装。NextCoreModulesPage 新設。右下アバター吹き出しに主要モジュール状態要約を追加
(完了条件のアバター要約を充足)。next-core-modules テスト6件 pass。Playwrightで確認(0エラー)。
外部本番接続・secretsなし。

## それ以前の完了(Phase 8 エコシステム + Phase 11 AGI)
指示書 PHASE8_AI_ECOSYSTEM.md と PHASE11_MUSASABI_AGI.md を実装。Phase8 ecosystem(部門/AI社員/
ワークフローのテンプレート・内部マーケットプレイス・安定拡張API)、Phase11 agi(AGI提案・
承認ゲート・Musasabi憲章・憲章チェック・AI CEO戦略立案)。EcosystemPage/AgiPage を新設。
ecosystem 7件・agi 6件 pass。Playwrightで実画面確認(0エラー)。重要変更は承認必須・監査ログ保持・
自律的本番デプロイなし・外部本番依存なし。

## それ以前の完了(Advanced Modules Roadmap)
指示書 ADVANCED_MODULES_ROADMAP.md に基づき `packages/advanced-modules` を新設。次世代12モジュール
(Musasabi DNA/Company Brain 2.0/COO指令室/ナレッジ品質/意思決定支援/営業コーチング/出版スタジオ/
開発レビュー/役員秘書/戦略室/事業シミュレータ/学習ラボ)を Mock パネル+サービススタブとして実装。
AdvancedModulesPage を新設しGLOBAL_NAVから到達。advanced-modules テスト7件 pass。Playwrightで
12パネル・スタブ実行を確認(0エラー)。外部本番接続・secretsなし。

## それ以前の完了(AI組織構造 + 監査ログ)
指示書 AI_ORGANIZATION_STRUCTURE.md 準拠。既存組織モデルを拡張し、governance に orgStructure
(役員→本部・組織図・指揮系統・独立監査)、audit に auditLog(追記型・所見からエスカレーション/
一時停止提案/レビュー/是正を導出)を追加。OrgStructurePage 新設+AuditPageに監査ログ追加。
AI役員/AI監査/月次予算KPI/未達リスク予測/監査ログを統合。governance 15件・audit 11件 pass。
Playwrightで組織図・指揮系統・監査ログを実画面確認(0エラー)。

## それ以前の完了(AI Audit and Risk Governance)
指示書 AI_AUDIT_AND_RISK_GOVERNANCE.md に基づき `packages/audit` を新設。独立監査機能が
異常/ポリシー違反/KPI整合性/承認遵守/運用リスクを検知し、部門リスクスコア・ポリシー遵守率・
日次/週次/月次監査レポート・是正推奨・高リスクの一時停止提案(人間承認前提・直接変更なし)を提供。
AuditPage を新設しGLOBAL_NAVから到達。audit テスト6件 pass。Playwrightで実画面確認(0エラー)。

## それ以前の完了(AI Executive Governance)
指示書 AI_EXECUTIVE_GOVERNANCE.md に基づき `packages/governance` を新設。AI経営陣8役職の
月次予算・KPI・着地予測・リスク評価・是正アクション(遅延時の再優先/再配分/CEOエスカレーション)・
ガバナンス承認ゲート(戦略/組織/価格変更は人間承認必須)・経営ダッシュボードを実装。
GovernancePage を新設しGLOBAL_NAVから到達。governance テスト10件 pass。Playwrightで実画面確認(0エラー)。
実予算執行・実戦略変更なし。

## それ以前の完了(Phase 4〜7 D-20260708-005〜008)
指示書 Phase 4〜7 を一括実装。4パッケージ+4UIページを追加(すべてMock・承認ゲート付き)。
Phase4 ai-pm(改善提案優先順位・実行キュー・経営サマリー)、Phase5 tenancy(プラン/機能ゲート/
使用量)、Phase6 ops-monitor(SLO/インシデント/ランブック)、Phase7 evolution(改善提案自動生成/
ドラフトIssue/ナレッジ品質)。4パッケージ計27件 pass。Playwrightで4ページを実画面確認(0エラー)。
実接続・実Issue作成・実課金・secrets保存なし。

## それ以前の完了(Phase 3 コネクタ基盤 D-20260708-004)
Directive D-20260708-004(外部業務システム連携)に基づき `packages/connectors` を新設。
6コネクタ(GitHub/Excel/カレンダー/Zoom Phone/FileMaker/会計)を Mock・本番未承認で定義し、
承認ゲート(mock=simulated、production=承認必須、本番write=承認者/理由必須)+ Mock アダプタ
+ 監査ログを実装。ConnectorsPage(一覧・Mock操作デモ・監査ログ)を新設しGLOBAL_NAVから到達。
connectors テスト13件 pass。Playwrightで実画面確認(0エラー)。README/CLAUDE_RESPONSE更新済み。
実接続・実書き込み・secrets保存なし。

## それ以前の完了(AV-MOTION-001 常駐アバターへの適用)
新規Directive/Issueが無いため(CHATGPT_DIRECTIVE.mdはD-20260708-001のまま、AV-ICON #227/#228は
実装済み)、非停止ルールに従い #272 の感情モーションを右下常駐アバターへ適用。
`deriveEmotionFromSignals`(部署状態→感情)を追加し、AssistantAvatarが error/承認待ち/作業中/
完了を検知してモーション(attention_pop/wait_pose/typing/jump/idle)を切替。
avatar-2d テスト23件 pass。Playwrightで実画面確認(0エラー)。

## それ以前の完了(Issue #272 AV-MOTION-001 感情別モーション制御)
アバターに14ステートの感情別自動モーション制御を実装。emotionMotionMap+
EmotionStateManager(duration経過→fallback自動復帰、ループ継続、テスト可能な
Scheduler注入)を avatar-2d に追加。デバッグUI(AvatarMotionPage・14ボタン+
CSSモーション)を新設しGLOBAL_NAVから到達。制御層と描画層を分離し将来3D差し替え可。
avatar-2d テスト22件 pass。Playwrightで自動復帰・14ボタンを確認(0エラー)。

## それ以前の完了(アバター刷新 + 架電リスト最大5000件)
ユーザー添付のムササビ・マスコット画像を右下常駐アバター(mascot.png)へ差し替え
(背景除去→透過PNG)。架電リスト検索(SerpAPI)をページング対応にし、1市区町村
あたり最大5000件まで取得可能に(SERPAPI_MAX_RESULTS=5000)。call-list テスト21件 pass。
Playwrightで新アバター描画を確認(0エラー)。

## それ以前の完了(D-20260708-001 (2) 部門ダッシュボード整備)
Directive §4/§13.3 に対応し、全9部門の統一プロファイル(目的・担当AI社員・稼働状態・
進行中/完了/保留タスク・次の推奨アクション・関連ドキュメント・保管庫連携状態)を
`departmentProfiles.ts` に定義し、部門ダッシュボードページを新設(GLOBAL_NAVから到達)。
全 workspace テスト336件 pass。すべてMock・外部接続なし・force pushなし。

## それ以前の完了(D-20260708-001 営業/出版/敏腕編集長AI/アバター)
最新Directive D-20260708-001 の優先項目を強化。営業部門(本日の営業活動:
架電予定・アポ目標/獲得・改善対象トーク・反論と切り返し・資料依頼・次アクション)、
出版部門(企画中〜note販売準備中の作品パイプライン)、敏腕編集長AI(原稿改善/構成/
キャラ/酷似回避/ターゲット/販売導線の指摘+役割7項目)、アバター吹き出しに営業/出版
進捗を反映。全 workspace テスト329件 pass。すべてMock・外部接続なし・force pushなし。

## それ以前の完了(D-020 Onboarding & Help / D-017〜020 完遂)
アプリ内ヘルプ(機能ガイド10・用語集7・FAQ3・初回セットアップ再表示)を新設。
サイドバー「ヘルプ」から到達。全 workspace テスト316件 pass。
**D-017〜D-020(延長解釈: レポート/通知/スケジューラ/ヘルプ)を完遂・main統合・
Beta Build。**

## それ以前の完了(D-019 Scheduler & Routines)
スケジューラ/定例業務ページを新設。定例業務7件(頻度・次回予定・自動化フラグ)+
頻度絞り込み+保存済み自動化ルーチン(実データ)。サイドバーから到達。
全 workspace テスト314件 pass。次は D-020 Onboarding & Help(延長解釈の最終)。

## それ以前の完了(D-018 Notifications & Alerts)
通知センターを新設。承認待ち/開発エラー/容量注意/未対応サポートをレベル別色で
一元表示し、個別/一括既読+既読永続化(再起動後維持)。サイドバーから到達。
全 workspace テスト311件 pass。次は D-019 Scheduler & Routines を予定。

## それ以前の完了(D-017 Reporting & Analytics)
全社レポート(運営・部署KPI・WF・コラボを集約)を生成し、Markdownプレビュー+
Markdown/JSONエクスポートを提供するレポートページを新設。サイドバーから到達。
全 workspace テスト308件 pass。
※D-017〜020 は本文未提供のため延長解釈で実装(D-017=レポート、D-018=通知、
D-019=スケジューラ、D-020=ヘルプ を予定)。次は D-018 Notifications & Alerts。

## それ以前の完了(D-016 AI Company Operation / D-011〜016 完遂)
会社運営ビューを新設。承認キュー(部署/ワークフロー/コラボの承認待ちを一元化)+
運営サマリー+運営メニュー。サイドバーから到達。全 workspace テスト306件 pass。
**D-011〜D-016 をすべて実装・main統合・Beta Build 完了。**

## それ以前の完了(D-015 AI Self Evolution)
buildEvolutionInsights(頻出アクション/自動化候補/稼働主体/短期長期内訳)を追加し、
AI自己進化ページを新設(自動化候補→Automation導線、長期昇格、頻出/主体)。
サイドバーから到達。全 workspace テスト303件 pass。
次は D-016 AI Company Operation を実施予定(D-011〜016 の最終)。

## それ以前の完了(D-014 Desktop Assistant & Workspace)
デスクトップアシスタントのワークスペースを新設。本日のダイジェスト(承認待ち/
進行中WF/未対応サポート/開発エラー/連携中の横断集約)+件数タイル+クイック
アクション+最近の業務ログ。サイドバー先頭から到達。全 workspace テスト300件 pass。
次は D-015 AI Self Evolution を実施予定。

## それ以前の完了(D-013 Company Brain & Collaboration Engine)
部署間の引き継ぎ・提案・承認依頼(6件)と全社共有ナレッジ(5件)を可視化する
コラボレーションページを新設(概要タイル・種別絞り込み・採用部署表示)。
サイドバーから到達。全 workspace テスト297件 pass。
次は D-014 Desktop Assistant & Workspace を実施予定。

## それ以前の完了(D-012 AI Company Workflow: 部署横断ワークフロー)
4種の部署横断ワークフロー(新サービス商品化/架電キャンペーン/出版/問い合わせ対応)を
モデル化し、進捗バー・現在ステップ・状態ランプで可視化するワークフローページを新設。
サイドバーから到達、ステップから従来ページへ遷移。全 workspace テスト294件 pass。
次は D-013 Company Brain & Collaboration Engine を実施予定。

## それ以前の完了(D-011 Core Departments Completion: 全社ダッシュボード)
全部署のKPIを一元表示する全社ダッシュボードを新設(buildCompanyDashboard で
各部署の集計関数を横断。営業部は実データ反映)。サイドバー/Command Centerから到達、
各カードから従来ページへ遷移。全 workspace テスト290件 pass・fail 0。
次は D-012 AI Company Workflow を実施予定。

## それ以前の完了(AV-ICON-001 ブランドアイコン整備)
D-011未発行のため、承認不要Open Issue AV-ICON-001を実施。既存の黒背景×白ムササビ
アイコン(デザインは充足)から assets/brand/ に書き出し一式(1024〜32 PNG+SVG+ICO
+master)を生成、brand-guideline.md 作成、README掲載。全 workspace テスト286件 pass。

## それ以前の完了(人事部・マーケティング部のExcel出力)
人事部(稼働・評価+採用計画)とマーケティング部(キャンペーン+SNS計画)に
Excel出力を追加し、管理部門3部署のエクスポートを統一。全 workspace テスト
286件 pass・fail 0。

## それ以前の完了(経理部の仕訳・収支Excel出力)
経理部ページに「Excel出力(.xlsx)」を追加(buildXlsx 再利用・仕訳一覧+収支
サマリー・ローカル保存)。全 workspace テスト286件 pass・fail 0。

## それ以前の完了(Company Brain 期間フィルタ+JSONエクスポート)
Memory履歴に期間フィルタ(全期間/今日/直近7日)と、絞り込み反映のJSONエクスポート
(ローカル保存)を追加。全 workspace テスト286件 pass・fail 0。

## それ以前の完了(UIフィードバック第7弾)
ミニパネル/ミニアバターをメイン画面の最小化/クローズ時のみ表示(Rust+JS)。
ミニパネルのベースカラーをメタリックシルバーに統一。市場調査部を■/▽/・
フォーマットに統一。部署アイコンを部署名の左に配置してパネルを低背化。
送信ボタン等アクセントもメタリックに。全 workspace テスト286件 pass・fail 0。

## それ以前の完了(UIフィードバック第6弾)
部署パネルに部署ごとの丸アイコン(ステータス色リング)。パネル枠をメタル調+
斜めに流れる光に。ミニアバターの透明マージン追加で耳・尻尾の見切れ解消。
チャット欄を複数行textareaに拡大+テンプレ右側縦並び+添付/音声/送信を下部配置。
全 workspace テスト285件 pass・fail 0。

## それ以前の完了(UIフィードバック第5弾)
ミニパネル(常駐ウィンドウ)のアバターを管理画面と同じ公式マスコット画像に統一
(VRM保存時のみ3D)。コマンドセンターの連携ラインを、両端が作業中/エラー対応の
連携だけ光が流れるアニメーションで点灯し、非連携は消灯。全 workspace テスト
285件 pass・fail 0。

## それ以前の完了(サポートチケット永続化)
問い合わせステータス変更を musasabi.supportTickets へ永続化(再起動後も維持・
KPI反映・バックアップ対象)。全 workspace テスト284件 pass・fail 0。

## それ以前の完了(アバター吹き出しサマリー拡張)
吹き出しにサポート部(未対応/対応中件数)と開発部(エラー対応案件)の要約を追加。
全 workspace テスト283件 pass・fail 0。

## それ以前の完了(開発部ページ充実)
開発案件ボードMock(5件・状態ランプ・CC開発部エラーと同期)+開発済み自動化
ツール一覧(Automation保存分の実データ)+Automation/架電リスト制作課への導線+
AI社員6名。汎用ページ参照ゼロに。全 workspace テスト281件 pass・fail 0。

## それ以前の完了(サポート部ページ充実)
問い合わせ管理Mock(チケット6件・ステータス4区分・プルダウン変更→KPI即時更新+
Memory記録)、FAQ 5件、AI社員5名の専用ページを新設。汎用ページから差し替え。
全 workspace テスト277件 pass・fail 0。

## それ以前の完了(営業部KPI実データ化)
KPIページ最上部に実データKPI(架電数/完了率/アポ獲得/成約/未架電/アポ率/成約率)。
テストコール履歴+営業リスト連動で Command Center 営業部パネルと同一値。
データ無し時はMock表示の明示のみ。全 workspace テスト273件 pass・fail 0。

## それ以前の完了(Command Center チャット強化)
部署指定チャットに部署Mock応答(進捗/課題/タスク別・エラー部署は原因と対処)を
追加。履歴は musasabi.deptChatHistory へ永続化(最大50件・再起動後も復元・
バックアップ対象)。部署詳細パネルに「直近の指示(チャット)」を表示。
全 workspace テスト273件 pass・fail 0。

## それ以前の完了(管理部門ページ: マーケティング部/経理部/人事部)
マーケティング部(KPI・キャンペーン効果測定・SNS投稿計画)、経理部(月次サマリー・
仕訳/経費一覧)、人事部(稼働/評価・採用計画)の従来ページを新設。サイドバーと
Command Center「詳細を見る」の両方から遷移可能になり、9部署すべてが従来ページへ
到達可能に。全 workspace テスト266件 pass・fail 0。

## それ以前の完了(コア部署の完成: 企画部/市場調査部ページ+出版部クリーン運営統合)
企画部ページ(資料作成業務・資料状況6区分・保管庫保存Mock・保管庫状態+保管資料
一覧)と市場調査部ページ(KPI7・AI最新情報・技術評価・組み合わせ研究・連携/CEO
提案・AI社員)を従来画面として新設。出版部ページにクリーン運営9項目+AI社員5名を
統合。サイドバーと Command Center「詳細を見る」の両方から遷移可能。
全 workspace テスト262件 pass・fail 0。

## それ以前の完了(D-20260706-010: 保管庫・容量管理・企画部資料フロー)
保管庫パネル+詳細(データ一覧/検索・絞り込み/プレビュー・DL Mock/アーカイブ・
削除候補Mock)。容量管理(使用率・正常/注意/危険・大容量/重複/アーカイブ/削除候補・
部署別/種別容量・保存ルール)。企画部に資料作成業務+保管庫保存Mockフロー。
アバター吹き出しに保管庫要約(+吹き出しがパネル操作を妨げるバグ修正)。
全 workspace テスト262件 pass・fail 0。

## それ以前の完了(D-20260706-009: 市場調査部+出版部クリーン運営)
市場調査部を部署一覧へ追加(KPI・AI最新情報・新サービス・技術評価・組み合わせ
候補・開発部/企画部/CEO提案フロー・採用状況・AI社員5名をMock表示)。連携ライン
(→開発部/企画部/出版部)追加。出版部詳細に規約チェック9項目+AI社員5名。
アバター吹き出しに両部署の要約。チャットプルダウン対応。
全 workspace テスト257件 pass・fail 0。同日: データバックアップ/復元(PR #242)。

## それ以前の完了(Command Center 実データ連動+営業リストExcel出力)
営業部パネル/詳細を実データ(テストコール履歴・営業リスト・Memory業務記録)と
接続(データ無し時はMock表示を明示)。営業リストにExcel出力(絞り込み反映・8列)。
全 workspace テスト252件 pass・fail 0。

## それ以前の完了(D-20260706-007: Musasabi Command Center)
シルバーグレー近未来UIを標準画面として実装。最小サイドバー+8部署パネル
(ステータス色ランプ・発光枠)+白発光の部署間連携ライン+右詳細パネル
(営業部コールシステムMock)+下部の部署指定チャット(音声Mock)+右下マスコット
アバターと状況要約吹き出し。全 workspace テスト251件 pass・fail 0。
完了後は Next Directive 待ち。

## それ以前の完了(営業リスト管理 — 第13章)
架電リスト制作課からの取り込み(電話番号で重複排除・進捗保持)、ステータス管理
(未架電/架電済/アポ獲得/成約/対象外)+集計+絞り込み、「テストコールへ」の
連絡先引き継ぎ。全 workspace テスト247件 pass・fail 0。

## それ以前の完了(ミニパネル2階層メニュー)
大項目(コールシステム/業務支援)押下で小項目が開閉し緑ランプ点灯。
業務支援 = Learning(作業学習)/Development(メイン画面の操作を記録→名前を
付けて自動化保存)/Support(保存済み一覧から選択→ランプ点灯→メイン画面で実行)。
ウィンドウ間は storage イベントの遠隔コマンドで連携。テスト241件 pass。

## それ以前の完了(UIフィードバック第4弾)
①パネル開時の膜拡大バグ修正(実寸フィット)②VRM取り込みを設定へ移行
③設定に「アバター作成」(3Dプレビュー・カラー・感情モーション6種・保存で常駐へ反映)
④市区町村空欄なら都道府県全域検索 ⑤Excel保存先ダイアログ(tauri-plugin-dialog/fs)
⑥媒体検索(店舗名/電話番号一致でデリバリー媒体を照合し同一リストへ統合)。
全 workspace テスト241件 pass・fail 0。

## それ以前の完了(UIフィードバック第3弾)
①サイドバー部署ボタンのアコーディオン化 ②アバター/ミニパネルの輪郭フィット
(drop-shadow・外側シャドウ除去)③管理画面をシルバーグレーのメタリック調へ刷新
④アプリアイコンの精度改善(スプライン化+シルエット再設計)。
全 workspace テスト235件 pass・fail 0。

## それ以前の完了(架電リスト制作課の SerpAPI 実データ接続)
ユーザー承認+キー提供により実データ対応。SerpAPI(google_maps)プロバイダ+
Tauri HTTPプラグイン(接続先は serpapi.com のみに制限)。キーは実行時入力・
メモリ保持のみ(保存・記録・コミットなし)。未入力時はMockのまま。
全 workspace テスト235件 pass・fail 0。実キーでの実通信は Windows 実機で要確認。

## それ以前の完了(開発部「架電リスト制作課」新設)
ユーザー指示により開発部に架電リスト制作課を追加。都道府県プルダウン+市区町村の
複数自由入力→検索(現在はMock。実Google Maps APIは承認後)→件数集計→
Excel(.xlsx)出力(依存なしXLSXビルダー・8項目)。検索・出力は Memory へ記録。
全 workspace テスト230件 pass・fail 0。

## それ以前の完了(Self Improvement 短期→長期メモリ昇格 — 第18章)
繰り返された短期メモリ(同一行動2回以上)を長期ナレッジへ決定的に昇格する
`packages/self-improvement` を実装し、Company Brain に手動昇格UIを追加
(二重昇格防止つき)。全 workspace テスト224件 pass・fail 0。
**これで Development Bible 第3章の優先順位1〜7がすべて着手済み。**

## それ以前の完了(Automation 手動オプトイン操作記録→再実行 — 第12章)
承認済みの手動オプトイン方針で Automation を実装。「記録を開始」中のみアプリ内
ページ遷移を記録し、ルーチンとして保存・再実行(再実行回数を追跡)。記録・再実行は
Memory へ監査記録。他アプリ・OS操作の記録なし・外部送信なし。
全 workspace テスト220件 pass・fail 0。

## それ以前の完了(Vision 手動オプトイン画面解析 — 第11章)
ユーザー承認(手動オプトイン方式)を得て Vision を実装。「この画面を解析する」
ボタン押下時のみ自アプリ画面をUI認識・ボタン検出・テキスト抽出(常時監視なし・
ローカル処理のみ・外部送信なし)。実行は Memory へ記録。実画面キャプチャ・実OCRは
未実装(承認後)。全 workspace テスト213件 pass・fail 0。

## それ以前の完了(議事録の自動生成 — Voice 第10章)
テストコール終了時に議事録(要約・感情・キーワード・トーク比率・決定事項・宿題)を
決定的に自動生成して表示。`packages/voice-analysis` に MinutesGenerator を追加
(LLM推論・外部送信なし)。議事録作成は Memory(業務)へ記録。
全 workspace テスト207件 pass・fail 0。

## それ以前の完了(Memory Engine + AutoCall安全ゲート管理)
ユーザー指示(ノンストップ実行)により、Development Bible 第9章の Brain Memory
Engine(`packages/memory`+Company Brain ページ+行動の自動記録)と、AutoCall
安全ゲート管理(gateState。`real_account_link` はロックで充足不可のため本番架電は
構造的に不可)を実装。ゲート変更は Memory に監査記録。
全 workspace テスト202件 pass・fail 0。詳細は CLAUDE_RESPONSE.md(2026-07-07)。

## それ以前の完了(⑤ Plugin System)
Phase β-002 の最終項目「⑤ Plugin System」を Plugin SDK Bible 準拠で実装完了。
`packages/plugin-sdk`(マニフェスト検証・レジストリ・権限モデル)+
`plugins/accounting-widget`(サンプル)+ プラグイン管理UI。外部取得・動的実行なし。
同日: 3Dアバター実レンダラー(#200)、UI Philosophy 適用、ガラス面限定修正も統合済み。
全 workspace テスト189件 pass・fail 0。**これで β-002 の①〜⑤が全て完了**。

## それ以前の完了(テストコール履歴の永続化・Sales Brain実データ化)
ユーザー指示により次フェーズ(会話ログ・指摘のローカル永続化)を実装完了。

- `@musasabi/call-training` に persistence(JSON直列化/検証)+ TestCallRepository
  (node:sqlite)を追加。テストコールを localStorage へ自動保存し、Sales Brain は
  保存履歴から共通ナレッジ・履歴一覧・集計を表示(実DB接続・外部送信なし)
- 同日: β版UIフィードバック反映(PR #220/#221 — グラフKPI・部門ツリーナビ・
  スライダーバグ修正・組織図改善・ブランドアイコン統一)
- 全 workspace テスト181件 pass・fail 0。E2E(実施→反映→再読込後保持)確認済み

## それ以前の完了(D-20260706-006)
Directive D-20260706-006(β版UI追加修正)を実装完了。

- アバター常駐修正: 常駐時はウィンドウをアバターサイズへ縮小し透明画面を残さない。
  パネル/吹き出しはアバタークリック時のみ(右下アンカー維持でリサイズ)
- アバターサイズ調整: 小/中/大+スライダー、localStorage 保存、常駐表示にも反映
- サイドバーをミニ経営ダッシュボード化: 全体サマリー+部門カード(進捗/作業/売上/状態)
- 営業部ページ(コール中心)・出版部ページ(成果物/販売数/売上)を新設
- Learning Mode の日々の作業内容の手動学習(workLog、ローカル保存のみ)
- 全 workspace テスト175件 pass・fail 0。Tauri ネイティブ挙動は実機確認待ち(§11)
- 詳細は `docs/ai-handoff/CLAUDE_RESPONSE.md`(2026-07-06 D-20260706-006 エントリ)

## それ以前の完了(main統合・Windowsβ版インストーラ生成)
ChatGPT指示により epic → main 統合(PR #215)と Beta Build 実行を完了。

- main へ39コミットを統合(マージコミット `3e06408`、CI green)
- Beta Build run #1 success: `Musasabi OS_0.1.0_x64-setup.exe` / `_x64_en-US.msi` を生成し
  Artifact `musasabi-beta-windows-3e06408…`(4.76MB、14日保持)として保存
- README にダウンロード手順を実績ベースで更新
- **未検証**: Windows実機でのインストール・起動・操作(チェックリスト §2〜§10)
- GitHub Releases は未公開(人間確認後に手動アップロードする方針)

## それ以前の完了(D-20260706-004)
Directive D-20260706-004(管理画面UIとデスクトップ右下アバター常駐)を実装完了。

- 管理画面をダークテーマ+サイドバー構成へ刷新(AI社員ステータス・モード状態カード付き)
- アバターウィンドウを右下配置にし、メインの最小化/Xで本体を隠して右下アバターのみ常駐
- アバタークリックでミニパネル(モード表示/Learning・Test・AutoCall切替/チャット/
  提案表示/メイン画面を開く)、吹き出しで提案・通知を表示
- 状態管理は `@musasabi/call-training` の assistantPanel(決定論)としてテスト8件追加
- AutoCall は表示切替のみで本番実行不可を維持(実架電・実API接続なし)
- Playwright でダークテーマ画面とミニパネルの実表示を確認。Tauri ネイティブ挙動
  (右下配置・最小化→常駐)は Windows 実機確認が必要(チェックリスト §10)
- 全 workspace テスト160件 pass・fail 0
- 詳細は `docs/ai-handoff/CLAUDE_RESPONSE.md`(2026-07-06 D-20260706-004 エントリ)

## それ以前の完了
- D-20260706-003: Windowsβ版ビルド導線(beta-build windowsジョブ・仮アイコン・README)
- D-20260706-002: β版評価ビルド(5画面統合・Sales Brain・起動導線・README/チェックリスト)
- D-20260706-001: AI Company System完成・β統合(AI社員モデル/Genome/名簿/コール統合)
- D-20260705-003: `packages/call-training`(三段階コール運用・Mock架電・共通ナレッジ基盤)

## 現在の待機状態
運用ルールに従い、次のタスクを推測せず待機する。ChatGPT による新しい
`docs/ai-handoff/CHATGPT_DIRECTIVE.md` の反映を待つ。

## Pending(次 Directive 想定)
- Test Mode の会話ログ・指摘・改善案のローカル永続化(JSON/SQLite、実DB接続なし)
  — D-20260705-004 想定
- 実架電API接続(Zoom Phone 等)・実音声エンジン接続(音声指導)
- AutoCall 本番実行(全安全ゲート充足後。現フェーズは禁止)
- ⑤ Plugin System(未着手)

## 遵守中の制約
- AutoCall 本番実行なし・実架電なし・実音声接続なし(Mockのみ)
- 実認証情報を保存しない(MockCredentialStore はインメモリ・ダミー値のみ)
- 実 FileMaker/Zoom Phone/VOICEVOX/whisper.cpp API へ接続しない
- Electron を本番デスクトップ基盤にしない(Tauri が正式基盤)
- main へ直接 push しない・force push しない・secrets 値を出力しない
