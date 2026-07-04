# AI営業本部 営業部 Playbook

Organization Bible 第3.3章、Epic β-001「営業部運用版完成」の実運用対象部署。

## 役割

リードの獲得後、コンタクト・提案・クロージングまでを担当し、Sales Workspace
(`apps/sales-workspace`)上でAI Sales Employee(`packages/ai-core`)として稼働する。

## 日次業務フロー

1. 始業時、AI Sales Employeeが日次計画を自動生成(AI Employee Bible 第5章)
   - 今日の優先リード / コールバック / フォローアップ / 推奨キュー
2. 主任が日次計画をレビューし、承認(Approval Flow)
3. 架電・商談を実施。通話は Voice Engine(`packages/voice-engine`)で音声合成/認識、
   Voice Analysis(`packages/voice-analysis`)で感情・キーワードを解析
4. 通話後、リードステータスを更新(新規/連絡済み/コールバック/興味あり/交渉中/
   アポイントメント/失注)
5. 終業時、KPI進捗と学習内容をMemory Engineに記録

## 使用ツール・連携先

- Zoom Phone(通話)
- FileMaker(顧客データ)
- Google Calendar(アポイントメント)
- Slack(社内連携・エスカレーション通知)
- Sales Workspace ダッシュボード(KPI・リード管理)

## KPI

アポ率 / 受注率 / 売上 / 架電数(Organization Bible 第4章)

## エスカレーション・承認ルート

一般社員(Level 3)→ 主任(Level 4)→ 課長(Level 5)→ 部長(Level 6、`MUSA-205`)。
値引き・特別条件などRankの権限を超える判断は上位者の承認を得てから実行する。

## 禁止事項(部門固有)

- 独立した価格交渉・契約締結・成約の最終確定(AI Employee Bible 第9章)
- 承認前の値引き提示
- ユーザー許可のない顧客への自動メール送信
