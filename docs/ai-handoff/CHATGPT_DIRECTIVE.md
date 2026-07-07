# ChatGPT Directive

## Directive ID
D-20260706-008

## Title
Phase 3以降の自律実行指示：AI Company Systemから部署別システムまで確認不要で継続

## 決定
現在のUI再現フェーズが完了したら、確認が必要な設計判断・認証情報・実API接続・安全判断がない限り、そのまま次Phaseへ進んでください。

Claude Codeは、作業完了ごとに必ず停止するのではなく、明確な確認要項がない場合は自律的に次の優先タスクへ進んでください。

## 継続ルール

### 停止せず進めてよい場合

以下は確認不要で継続してください。

- MockデータでのUI実装
- 既存設計に沿ったコンポーネント追加
- テスト追加
- README更新
- Windows確認チェックリスト更新
- `CLAUDE_RESPONSE.md` の日本語更新
- 部署・AI社員・タスク・KPIのMock実装
- 既存安全ルール内でのUI改善
- 型定義・状態管理・デザインシステム整備

### 停止して確認する場合

以下の場合のみ停止し、`chatgpt-decision-needed` または `chatgpt-next-directive` Issueを作成してください。

- 実API接続が必要
- 認証情報が必要
- 実電話発信が必要
- AutoCall本番実行を有効化する必要がある
- FileMaker本番DBへ接続または書き込みが必要
- Zoom Phone本番APIへ接続が必要
- ユーザー操作履歴の自動監視が必要
- 主要アーキテクチャを破壊的に変更する必要がある
- セキュリティ・課金・法務判断が必要

## 次Phase優先順位

UI再現フェーズ完了後は、以下の順番で自律実行してください。

## Phase 3：AI Company System

Musasabi OSの核となるAI会社システムを実装してください。

実装対象：

- 会社全体モデル
- 部署モデル
- AI社員モデル
- 役職
- 権限
- KPI
- タスク
- 作業ログ
- 承認待ち
- エラー
- 部署間連携
- 部署間連携ライン用データ
- Company Summary
- Department Summary
- Employee Summary

### 必須型・Mockデータ例

- CompanySummary
- Department
- DepartmentStatus
- DepartmentConnection
- AiEmployee
- EmployeeRole
- DepartmentTask
- DepartmentKpi
- ApprovalItem
- ErrorItem
- WorkLogEntry

## Phase 4：部署別システム

AI Company Systemの上に、部署ごとの機能を構築してください。

### 営業部

- コールシステムMock
- Learning Mode
- Test Mode
- AutoCall Mode（本番実行不可）
- 架電数
- 接続率
- アポ獲得数
- 成約数
- コール状況
- Sales Brain
- スクリプト改善
- テストコール履歴
- 音声コーチMock

### 出版部

- 成果物一覧
- 販売数
- 売上Mock
- Kindle / note 準備中表示
- 執筆ステータス
- 編集ステータス
- 校正ステータス
- 表紙制作ステータス
- 類似作品チェックMock
- AI編集長
- AI著者
- AI校正担当

### AI企画部

- 新機能提案
- Issue案作成Mock
- Claude Code / ChatGPTハンドオフ状態
- プロダクト改善タスク
- AI PMタスク

### 管理部

- 全社サマリー
- AI社員一覧
- 権限管理Mock
- 売上Mock
- 稼働率
- 承認待ち一覧
- エラー一覧

## Phase 5：Assistant Avatar拡張

現時点では実3D/VRMは後続扱いでよいですが、UI上はアバター体験を強化してください。

- 右下常駐
- 吹き出し要約
- 承認待ち要約
- エラー原因・解決案要約
- 部署別提案
- サイズ変更
- 表情差分Mock
- クリックでミニパネル
- チャット欄と連動

VRoid / VRM / three.js実描画はPending Issueとして扱ってください。

## Phase 6：Desktop Assistant基盤

実機やOS権限が必要なものはPending扱いにしつつ、MockでUI・設計を進めてください。

- 常駐アバター
- メイン画面復帰
- ミニパネル
- モード切替
- 作業メモ登録
- Learningへの手動反映
- 提案通知
- 承認通知

OS操作の無断監視は禁止です。

## Phase 7：外部連携Readiness

実接続はしません。準備UIとMockのみ実装してください。

- FileMaker readiness UI
- Zoom Phone readiness UI
- VOICEVOX readiness UI
- whisper.cpp readiness UI
- Office readiness UI
- Calendar readiness UI
- GitHub readiness UI

実認証情報の保存は禁止です。

## Phase 8：AI Self Evolution設計

実行はまだMockに留め、設計とUIを進めてください。

- AI社員が課題を発見
- 改善案を作成
- Issue案を作成
- ChatGPT承認待ち
- Claude Code実装待ち
- テスト結果
- PR状態
- 承認後反映

runaway workflowは絶対に再導入しないでください。

## UI方針

前DirectiveのUI方針を維持してください。

- シルバーグレー基調
- メタリック調
- 近未来
- ガラス風UI
- 部署パネル中心
- ステータス色分け
- 白光の部署間連携ライン
- 下部の部署指定チャット欄
- 右下の3D風ムササビアバター

アプリアイコンは最新の白黒ムササビアイコンを維持してください。

## 安全ルール

Claude Codeは以下を行わないこと。

- 実電話番号への発信
- AutoCall本番実行の有効化
- FileMaker本番DBへの書き込み
- Zoom Phone本番APIへの接続
- 実認証情報の保存
- ユーザー操作の無断監視
- secretsの表示
- force push
- runaway issue-open workflowの再導入

## 完了報告ルール

各Phaseまたは大きなタスクが完了したら、以下を日本語で更新してください。

- `docs/ai-handoff/CLAUDE_RESPONSE.md`
- `docs/ai-handoff/STATUS.md`
- 必要に応じてREADME
- 必要に応じてWindows確認チェックリスト

ただし、確認要項がない場合は停止せず、次のPhaseに進んでください。

## 完了条件

このDirectiveは以下を満たすまで継続してください。

- Phase 3 AI Company SystemのMock実装が完了
- Phase 4 部署別システムの主要Mockが完了
- Phase 5 Assistant Avatar UI拡張が完了
- Phase 6 Desktop Assistant基盤のMock/UIが完了
- Phase 7 外部連携Readiness UIが完了
- Phase 8 AI Self Evolution設計UIが完了
- テストが通る
- 日本語ドキュメントが更新される

## 次のアクション

最新のmainをpullし、前DirectiveのUI再現作業が完了している場合は、本Directiveに従ってPhase 3以降を自律的に進めてください。

確認要項がなければ停止せず、次の優先タスクへ進んでください。
