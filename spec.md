# 技術指示書

## タスク概要
**タスク: Musasabi OS 引き継ぎ準備と現状整理**  
現在Codexで開発中のプロジェクトをMusasabi OSとして引き継ぎ、今後の自動開発ループに接続できるよう現状を整理する。

## 実施内容

1. **プロジェクト構成の確認**
   - 使用技術: プロジェクトで使用されている技術スタックをリストアップして文書化する。
   - ディレクトリ構成: プロジェクトの現在のディレクトリ構造を把握し、整理する。
   - 実装済み機能: 現在実装されている機能をリスト化する。
   - 未実装機能: 実装予定で未完了の機能を明確にする。
   - エラー箇所: 既知のエラーやバグを特定し、文書化する。
   - 不要ファイル: プロジェクト内で使用されていない不要なファイルを特定する。
   - 重複コード: コードの重複を検出し、削減する。

2. **docsフォルダの作成**
   - プロジェクトルートに`docs`フォルダを作成する。

3. **必要なファイルの作成**
   - `docs`フォルダ内に以下のMarkdownファイルを作成する。
     - `PROJECT_OVERVIEW.md`
     - `CURRENT_CODE_AUDIT.md`
     - `MUSASABI_OS_CONCEPT.md`
     - `INTEGRATION_PLAN.md`
     - `DEVELOPMENT_RULES.md`
     - `ROADMAP.md`
     - `CHANGELOG.md`

4. **CURRENT_CODE_AUDIT.mdの整理**
   - 現在のコード状況を「CURRENT_CODE_AUDIT.md」に記載する。

5. **INTEGRATION_PLAN.mdの整備**
   - 既存プロジェクトをMusasabi OSへ統合するための手順を「INTEGRATION_PLAN.md」に記載する。

6. **ROADMAP.mdの作成**
   - 以下の開発順序で`ROADMAP.md`を整備する。

     **Phase 1**
     - Musasabi OS 基盤
     - ダッシュボード
     - AI部署メニュー
     - AIチャット基盤

     **Phase 2**
     - AI CEO
     - AI PM
     - AI開発部
     - GitHub Issue管理

     **Phase 3**
     - Codex連携
     - AIレビュー
     - Issue自動生成
     - AI社員による機能提案

7. **README.mdの更新**
   - 現在の状況
   - 起動方法
   - 開発ルール
   - 今後のロードマップ

## 注意事項
- 本タスクでは大きな機能実装は行わない。
- 目的は、既存コードを破損せず、Musasabi OSとして引き継ぐ準備を整えることである。

以上が、Musasabi OS引き継ぎ準備に向けた技術指示書になります。各ステップに従い、必要な資料を作成し、プロジェクトを整理してください。