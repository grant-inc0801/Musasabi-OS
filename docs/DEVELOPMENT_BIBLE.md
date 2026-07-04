# Musasabi OS Development Bible

Version 1.0

このドキュメントはMusasabi OSの最上位設計原則である。`docs/ARCHITECTURE.md` を含む
すべての実装・設計判断は、本ドキュメントの内容を最優先で参照する。

---

## 第1章 Mission

### プロジェクト名

Musasabi OS

### Mission

Musasabi OSは、人がコンピュータを操作するのではなく、
AIが人の代わりに仕事を理解し、自律的に実行するWindows AI社員プラットフォーム
を構築することを目的とする。

### 最終目標

AIが

- 学習
- 判断
- 実行
- 改善

を継続し、人間の業務を安全に代替する。

---

## 第2章 Vision

Musasabi OSはWindows上で常駐し、社員一人につき一人のAI社員を実現する。

対象業務

- 営業
- コールセンター
- 営業事務
- 会計
- 人事
- マーケティング
- カスタマーサポート

---

## 第3章 Product Philosophy

Musasabiはチャットाईではない。デスクトップOSである。

全ての実装判断は「Windows上で人間の代わりに仕事をするか」を基準に行う。

---

## 第4章 AI Constitution

Claudeは以下を絶対ルールとして従う。

### 優先順位

1. Windows Desktop
2. Sales Workspace
3. Memory Engine
4. Voice
5. Vision
6. Automation
7. Self Improvement

### 禁止事項

勝手に

- ファイル削除
- Force Push
- Issue大量削除
- Secret変更
- APIキー表示

は禁止。

### 実装前

必ず `PLAN.md` を更新。

### Commit前

必ず

- Build
- Lint
- Test

を実行。

### Push前

必ず変更内容を要約する。

---

## 第5章 Architecture

### ディレクトリ

```
apps/
    desktop/
    sales-workspace/

packages/
    avatar-2d/
    avatar-3d/
    voice-engine/
    voice-analysis/
    ai-core/
    memory/
    vision/
    automation/
    shared/

docs/

tests/

scripts/

config/

plugins/
```

---

## 第6章 Coding Standard

- TypeScript
- Strict Mode
- ESLint
- Prettier
- SOLID
- Clean Architecture
- DDD
- Repository Pattern
- Event Driven

---

## 第7章 UI Philosophy

### 優先順位

1. Windows Native
2. 速度
3. 視認性
4. アニメーション

### UIテーマ

- Glass
- Minimal
- Professional
- Dark対応

---

## 第8章 Avatar

標準アバター: Musasabi

機能

- 感情
- 待機
- 歩行
- 作業
- 音声
- 視線
- 口パク
- 瞬き

---

## 第9章 Memory Engine

全ての行動はMemoryに保存。

分類

- 短期
- 長期
- 業務
- ユーザー
- 会社
- プロジェクト

---

## 第10章 Voice

- リアルタイム
- ノイズ除去
- 話者分離
- 要約
- 議事録
- 感情分析

---

## 第11章 Vision

- OCR
- 画面認識
- UI認識
- ボタン検出
- ウィンドウ管理

---

## 第12章 Automation

操作記録 → AI学習 → 再実行 → 改善

---

## 第13章 Sales Workspace

- 営業リスト
- Zoom Phone
- FileMaker
- メール
- Google Calendar
- Slack
- ChatGPT
- Claude

連携

---

## 第14章 Security

ユーザー許可無しに以下を禁止する。

- メール送信
- 削除
- 支払い
- 外部送信

---

## 第15章 Git Rule

必ず Feature Branch → Commit → Push → PR → Review → Merge

Force Push禁止。

---

## 第16章 Issue Rule

Issueは Epic → Feature → Task → Bug の4階層。

Issueを閉じる前に 実装 → テスト → レビュー を実施。

---

## 第17章 Documentation

コード変更時は必ず README / Architecture / Roadmap / ChangeLog を更新。

---

## 第18章 Self Evolution

Claudeはリファクタリング提案・改善提案・性能改善を積極的に行う。

---

## 第19章 Release Policy

Alpha → Beta → RC → Stable → Enterprise

---

## 第20章 Claude Code Operating Rule

Claudeは「コードを書くAI」ではない。Musasabi OSの共同開発者・主任エンジニアとして振る舞う。

判断基準

- 保守性
- 拡張性
- 可読性
- セキュリティ
- 長期運用

を最優先する。

---

## 第21章 Organization Philosophy

Musasabi OSは単体AIではない。**AI企業(AI Company)**である。

全てのAI社員は 会社 → 本部 → 部門 → 部署 → チーム → 社員 という階層に所属する。

### Company Structure

```
CEO

├ AI経営企画本部
├ AI営業本部
├ AIマーケティング本部
├ AI開発本部
├ AI管理本部
├ AI人事本部
├ AI経理本部
└ AIカスタマーサクセス本部
```

---

## 第22章 Department System

### 営業本部

営業部 / インサイドセールス / フィールドセールス / 営業企画 / 営業管理 / 営業教育 / 営業分析 / 営業支援

### 開発本部

AI開発 / Desktop / Backend / Frontend / QA / DevOps / Security / Architecture

### マーケティング本部

SNS / 広告 / SEO / LP / 動画 / ブランド / 広報

### 管理本部

総務 / 法務 / 購買 / IT / 資産管理 / 契約

### 人事本部

採用 / 教育 / 評価 / 勤怠 / 福利厚生

### 経理本部

会計 / 請求 / 支払 / 売上 / 原価 / 税務

### カスタマーサクセス本部

サポート / FAQ / チャット / 導入 / 運用

---

## 第23章 AI Employee Hierarchy

```
CEO
↓
役員
↓
本部長
↓
部長
↓
課長
↓
主任
↓
一般社員
↓
研修社員
```

---

## 第24章 AI Role

全AI社員は Role / Department / Authority / KPI / Memory / Skill を持つ。

例

```
MUSA-001
CEO秘書
管理本部
Level 8
```

```
MUSA-101
営業社員
営業部
Level 3
```

```
MUSA-205
営業部長
営業本部
Level 6
```

---

## 第25章 Approval Flow

業務は 社員 → 主任 → 課長 → 部長 → 本部長 → CEO の順で承認される。

Claudeは承認フローを破ってはならない。

---

## 第26章 KPI

全AI社員はKPIを持つ。

### 営業

アポ率 / 受注率 / 売上 / 架電

### 開発

Issue / PR / Bug / Coverage

### 人事

採用 / 教育 / 定着率

---

## 第27章 Collaboration

AI社員は単独で仕事しない。必ず 依頼 → レビュー → 承認 → 実行 を守る。

---

## 第28章 Company Brain

全社員は共有Brainを利用する。ただしMemoryは部署ごと・社員ごとに分離する。

---

## 第29章 Organization Dashboard

CEO画面: 会社KPI → 本部 → 部署 → 社員 まで、リアルタイム表示。

---

## 第30章 Future

将来 1社 → 10社 → 100社 → SaaS へ拡張可能。

### 最終構造

```
Musasabi OS

├ Company Genome
├ Development Bible
├ Organization Bible
├ AI Employee Bible
├ Sales Bible
├ Voice Bible
├ Vision Bible
├ Automation Bible
├ Security Bible
└ Plugin SDK Bible
```

---

## 補足: 今後整備するドキュメント群

Claude Codeが最初に読むドキュメント群として、以下を将来的に整備する。

- Company Genome
- Development Bible(本ドキュメント)
- Organization Bible
- AI Employee Bible
- Department Playbooks(営業・開発・経理など部門別運用書)
- Security Bible
- Plugin SDK Bible

これらはAI企業としての行動原則・組織ルール・意思決定・品質基準まで含めた「AI企業憲法」として、
本ドキュメントを土台に段階的に策定する。
