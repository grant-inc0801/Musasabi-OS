# Status

**State:** waiting_for_chatgpt
**Updated:** 2026-07-07
**Branch:** `claude/musasabi-epic-beta-001-c6svi5`

## 直近の完了内容(営業リスト管理 — 第13章)
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
