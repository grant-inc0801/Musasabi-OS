# Musasabi OS Organization Bible

Version 1.0

Company Genome・Development Bible に基づき、Musasabi OSという「AI企業」の
組織構造を定義する。実装は `packages/ai-company` がこの構造を型として表現する。

---

## 第1章 全体組織図

```
会社(Musasabi OS)
├ CEO AI
├ AI企画本部
├ AI開発本部
├ AI営業本部
├ AIマーケティング本部
├ AIクリエイティブ本部
├ AI管理本部
├ AIサポート本部
└ AI研究開発本部
```

Development Bible 第21〜22章の8本部(経営企画/営業/マーケティング/開発/管理/
人事/経理/カスタマーサクセス)は、本章の8本部に整理し直す(第9章「Development
Bibleとの整合確認」を参照)。人事・経理はAI管理本部配下の部門として統合し、
新たにAIクリエイティブ本部・AI研究開発本部を設置、カスタマーサクセス本部は
AIサポート本部に改称する。

---

## 第2章 役職ランクと権限レベル

Development Bible 第23章の8階級に、権限レベル(数値)を対応付ける。

| Rank(役職) | Level | 説明 |
|---|---|---|
| CEO | (単一) | 会社に1体のみ存在。全社の最終意思決定者 |
| 役員(Executive) | 8 | 複数本部にまたがる意思決定、CEOの直属補佐 |
| 本部長(Headquarters Manager) | 7 | 本部内の全部門を統括 |
| 部長(Department Manager) | 6 | 部署を統括、本部長へ報告 |
| 課長(Section Chief) | 5 | チームを統括、部長へ報告 |
| 主任(Supervisor) | 4 | チーム内の実務リード、課長へ報告 |
| 一般社員(Staff) | 3 | 個別の業務を実行 |
| 研修社員(Trainee) | 2 | 監督下で業務を学習、単独実行権限なし |

権限レベルは `packages/ai-company` の `AIEmployee.authorityLevel` に対応する。

---

## 第3章 本部別詳細

各本部の「部門」は Development Bible 第22章の部署群を土台に、部門/部署の2階層に
再編したもの。「代表AI社員例」は Development Bible 第24章の記法(ID / Role /
Department / Level)に従う。

### 3.1 AI企画本部

- **役割**: 全社戦略・Sprint計画・Company Genome/各種Bibleの維持
- **部門**: 経営企画部門(全社戦略、Sprintロードマップ) / PMO部門(進捗管理、リスク管理)
- **代表AI社員例**: `MUSA-001 CEO秘書 / AI企画本部 / Level 8`
- **KPI**: 戦略達成率、Sprint計画遵守率、Bible整備率
- **連携方法**: 各本部長からの月次報告を集約しCEOへ提出。設計変更提案は
  Development Bible第4章の設計変更プロセスを通す

### 3.2 AI開発本部

- **部門**: Desktop部門(Electron/Avatar) / Backend部門(Voice/Memory/Automation等の
  エンジン) / Frontend部門(Sales Workspace等のUI) / QA部門 / DevOps部門 /
  Security部門 / Architecture部門
- **代表AI社員例**: `MUSA-301 Desktop開発社員 / AI開発本部 Desktop部門 / Level 3`,
  `MUSA-350 開発部長 / AI開発本部 / Level 6`
- **KPI**: Issue消化数、PRマージ数、Bug件数、テストカバレッジ
- **連携方法**: GitHub Issue(Epic→Feature→Task→Bug)を通じて依頼を受け、
  実装→テスト→レビュー→承認の順で進める(Development Bible 第16章・第27章)

### 3.3 AI営業本部

- **部門**: 営業部 / インサイドセールス部門 / フィールドセールス部門 /
  営業企画部門 / 営業管理部門 / 営業教育部門 / 営業分析部門 / 営業支援部門
- **代表AI社員例**: `MUSA-101 営業社員 / AI営業本部 営業部 / Level 3`,
  `MUSA-205 営業部長 / AI営業本部 / Level 6`
- **KPI**: アポ率、受注率、売上、架電数
- **連携方法**: Sales Workspace(`apps/sales-workspace`)上でリード・KPIを
  可視化し、`packages/ai-core` が日次計画・推奨アクションを提示、
  一般社員→主任→課長→部長の承認フローで実行可否を判断する
- **Epic β-001**: 本本部はEpic β-001「営業部運用版完成」で最初に実運用投入される

### 3.4 AIマーケティング本部

- **部門**: SNS部門 / 広告部門 / SEO部門 / LP制作部門 / 動画部門 / ブランド部門 / 広報部門
- **KPI**: リード獲得数、CV率、CPA、エンゲージメント率
- **連携方法**: 営業本部へリードを引き渡し、引き渡し後のフォローはインサイド
  セールス部門が担当する

### 3.5 AIクリエイティブ本部

- **部門**: UI/UXデザイン部門(Avatar/Desktop/Workspaceのデザイン) /
  ブランドデザイン部門 / モーション・アニメーション部門
- **KPI**: デザインレビュー通過率、Avatar状態カバー率、デザインシステム準拠率
- **連携方法**: AI開発本部Desktop部門・Frontend部門と共同でAvatar
  (`packages/avatar-2d`, `packages/avatar-3d`)のビジュアル仕様を策定する

### 3.6 AI管理本部

- **部門**: 総務部門 / 法務部門 / 購買部門 / IT部門 / 資産管理部門 / 契約部門 /
  **人事部門**(採用/教育/評価/勤怠/福利厚生) / **経理部門**(会計/請求/支払/売上/原価/税務)
- **KPI**: コンプライアンス違反件数、契約処理リードタイム、採用/教育/定着率、
  請求・支払処理精度
- **連携方法**: 全本部からの契約・支出・採用申請を受け、Approval Flowに従い
  本部長→CEOの承認を得た上で処理する

### 3.7 AIサポート本部

(Development Bible 第22章の「カスタマーサクセス本部」を改称)

- **部門**: サポート部門 / FAQ部門 / チャット部門 / 導入支援部門 / 運用支援部門
- **KPI**: 応答時間、解決率、顧客満足度
- **連携方法**: 営業本部からの引き渡し後の顧客を担当し、Voice Analysis
  (`packages/voice-analysis`)の感情分析結果をエスカレーション判断に用いる

### 3.8 AI研究開発本部

- **部門**: Memory研究部門 / Vision研究部門 / Automation研究部門 /
  Self Improvement研究部門
- **KPI**: 研究提案の採択数、実験成功率、既存エンジンへの改善提案件数
- **連携方法**: 新技術・改善案をAI開発本部に提案し、採択された場合のみ
  Development Bible第4章の優先順位(Memory→Voice→Vision→Automation→
  Self Improvement)に沿って開発本部が実装する

---

## 第4章 KPI体系(共通)

| 本部 | 主要KPI |
|---|---|
| 企画 | 戦略達成率、Bible整備率 |
| 開発 | Issue/PR/Bug/Coverage |
| 営業 | アポ率/受注率/売上/架電 |
| マーケティング | リード獲得数/CV率/CPA |
| クリエイティブ | デザインレビュー通過率 |
| 管理 | コンプライアンス違反件数、採用/教育/定着率 |
| サポート | 応答時間/解決率/顧客満足度 |
| 研究開発 | 提案採択数/実験成功率 |

---

## 第5章 承認フロー(共通)

Development Bible 第25章の通り、社員 → 主任 → 課長 → 部長 → 本部長 → CEOの
順で承認される。本部を跨ぐ意思決定(例: 営業本部が開発本部に機能追加を依頼する)は、
双方の部長級以上が合意した上でPMO部門(AI企画本部)が調整する。

---

## 第6章 実装との対応

本ドキュメントの組織構造は `packages/ai-company` の型定義に対応する。

- `OrganizationUnit.level` — company / headquarters / division / department / team
- `EmployeeRank` — 本章第2章のRankに対応(`ceo` は特例として単一インスタンスのみ許可)
- `AIEmployee.authorityLevel` — 本章第2章のLevelに対応
- `APPROVAL_CHAIN` — 本章第5章の承認順に対応

現段階では型定義のみが実装されている。永続化・実際の承認ワークフロー実行・
Organization Dashboard(Development Bible 第29章)はEpic β-001完了後に実装する
(`docs/ARCHITECTURE.md` 第5章を参照)。
