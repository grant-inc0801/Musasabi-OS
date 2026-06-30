# 技術指示書: Telemarketing Sales MVP

## 概要

このドキュメントでは、Telemarketing Sales MVPの開発に関する技術的指示を提供します。Musasabi AIの導入を意図し、営業チームの日常業務をサポートしながら、会社の知見や営業ノウハウを蓄積します。

## 目標

- 最速かつ使いやすい内部MVPを構築する。
- Telemarketing sales部門がMusasabi AIを活用できるようにする。

## スコープ

以下の機能を持つシンプルなテレマーケティングワークスペースを実装する:

- コールリストインポート基盤
- 顧客/リストリスト
- リード詳細ページ
- コール履歴
- 聞き取りメモ
- ステータス管理
- 次のアクションメモ
- MUSA営業アシスタントパネル
- コールノーツからの知識キャプチャ

## ナビゲーション

追加項目:

- Sales
- Call List
- Lead Detail
- Call History
- Sales Knowledge

## SQLiteテーブル設計

以下のテーブルを作成します:

### sales_leads テーブル

- id
- company_name
- store_name
- phone_number
- postal_code
- address
- industry_major
- industry_minor
- status
- priority
- assigned_to
- created_at
- updated_at

### call_histories テーブル

- id
- lead_id
- call_result
- contact_person
- memo
- next_action
- next_call_date
- created_by
- created_at

### sales_hearing_notes テーブル

- id
- lead_id
- store_name
- company_name
- contact_person
- phone_number
- email
- website_url
- memo_1
- memo_2
- created_at
- updated_at

## リードステータス

以下のステータスを使用:

- new
- calling
- connected
- no_answer
- interested
- not_interested
- callback
- closed
- excluded

## 必要なモジュール

`packages/sales/src/` ディレクトリ内に以下のファイルを作成します:

- salesLeadRepository.js
- salesLeadService.js
- callHistoryRepository.js
- callHistoryService.js
- hearingNoteRepository.js
- hearingNoteService.js
- index.js

## UI要件

### Sales Dashboard

表示内容:
- トータルリード数
- 新規リード数
- コールバックリード数
- 興味を持ったリード数
- 今日のコール数
- 最新のコール履歴

### Call List

表示内容:
- 会社/店舗名
- 電話番号
- 住所
- 業界
- ステータス
- 優先度

操作:
- 詳細を開く
- ステータスを変更
- コール履歴を追加

### Lead Detail

左側の表示:
- 会社/店舗名
- 電話番号
- 郵便番号
- 住所
- 主な業界
- サブ業界

右側の表示:
- 聞き取りメモフィールド
- コール履歴
- 次のアクション
- MUSA営業アシスタントパネル

## MUSA営業アシスタント

ステータスやメモに基づいてシンプルな決定論的な提案を行います。

例:
- ステータスがnewの場合:
  - 提案: まずは店舗名・担当者名・現在の集客課題を確認しましょう。
  
## 知識キャプチャ

コール履歴や聞き取りメモを保存する際に、オプションで知識項目候補を作成します。

例:
- タイトル: Sales Insight: {company_name}

内容:
- コール結果
- 顧客の問題
- 次のアクション
- 有用な営業ノート

## テスト

以下をテスト:
- sales_leadsテーブルの存在
- call_historiesテーブルの存在
- sales_hearing_notesテーブルの存在
- リードの作成
- リード一覧
- ステータス更新
- コール履歴作成
- 聞き取りメモ保存
- ダッシュボード統計
- MUSAの決定論的な営業提案

## ドキュメント更新

更新対象:
- README.md
- CHANGELOG.md

READMEには以下を含める:
- Sales Dashboardの使用方法
- リードを追加する方法
- コール履歴を記録する方法
- 知識がどのように蓄積されるか

## 実施しない項目

以下の項目は実装しない:
- 外部コールシステム統合
- オートダイアリング
- 通話録音
- 音声認識
- クラウド同期
- ユーザーアカウント管理
- CRMインポートの自動化
- 高度なAIスコアリング

## 受け入れ基準

- Salesナビゲーションが存在する
- Sales Dashboardが機能する
- Call Listが機能する
- Lead Detailが機能する
- コール履歴を保存できる
- 聞き取りメモを保存できる
- リードステータスを更新できる
- MUSAの営業提案が表示される
- 営業知識候補が作成される
- npmテストが合格する
- READMEが更新される
- CHANGELOGが更新される

## 納品物

レポート:
- 変更されたファイル
- テスト結果
- エラーの有無
- 推奨コミットメッセージ

コミットをGitHubにプッシュしないこと。

推奨コミットメッセージ:
```
feat(sales): add telemarketing sales MVP
```