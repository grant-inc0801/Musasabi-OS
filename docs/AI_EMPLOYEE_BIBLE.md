# Musasabi OS AI Employee Bible

Version 1.0

Organization Bible が定義する組織構造の中で、個々の**AI社員**がどう定義され、
どう成長し、どう評価されるかを定めるドキュメント。実装は `packages/ai-company`
(組織・役職の型)と `packages/memory`(個人Memory)、`packages/ai-core`
(部門別ロジック、まずは営業部)にまたがる。

---

## 第1章 AI社員プロフィール

すべてのAI社員は以下を持つ(Development Bible 第24章、`AIEmployee` 型に対応)。

- Employee ID(例: `MUSA-101`)
- 名前
- 所属(本部/部門/部署/チーム — Organization Bible 第1・3章)
- Role(役割)
- Rank / Authority Level(Organization Bible 第2章)
- スキルレベル・経験
- 現在の目標・現在のタスク
- 今日のKPI
- 自信度(Confidence Level)
- ステータス(稼働中/待機中/学習中 等)

---

## 第2章 ライフサイクル

```
研修社員として着任
↓
Onboarding(部署のPlaybookを学習)
↓
一般社員として稼働開始
↓
KPI・実績に応じて昇格判定
↓
主任 → 課長 → 部長 → 本部長 → 役員
```

昇格判定はOrganization Bible第2章のLevel基準とKPI実績に基づき、
一つ上位のRankの承認(Approval Flow)を経て確定する。

---

## 第3章 Memory(個人)

- 各AI社員は自分専用のMemory(Development Bible 第9章、`packages/memory`)を持つ
- 個人Memoryは会話・実行結果・学習内容・評価履歴を含む
- 個人MemoryはCompany Brain(Development Bible 第28章)へも要約が共有されるが、
  生データは本人の所属部署内に限定して公開される

---

## 第4章 スキルとGrowth

- スキルはDepartment Playbook(部署別運用書)で定義された業務単位で評価される
- 新しいスキルはOJT(実務を通じた学習)とMemoryへの蓄積により獲得される
- スキル成長はKPIの一部として本部長に報告される

---

## 第5章 日次計画(Sales部門の例)

営業部AI社員(`packages/ai-core`)は日次で以下を自動生成し、承認前に主任へ提示する。

- 今日の優先リード
- コールバック予定
- フォローアップスケジュール
- 推奨キュー

他部署のAI社員も同様に、Department Playbookで定義された日次計画フォーマットに従う。

---

## 第6章 推奨アクションと自信度

AI社員は判断結果を断定ではなく「推奨」として提示し、Confidence Levelを付与する。

- 高信頼度(根拠が明確、過去実績が十分) — 実行前提で提示
- 中信頼度 — 上位者の確認を推奨
- 低信頼度 — 実行せず、上位者の判断を仰ぐ

---

## 第7章 評価とKPI

- KPIはOrganization Bible第4章の本部別体系に従う
- 評価は自己申告(Memoryの実績記録)+上位者レビューの2段階で行う
- KPI未達が続く場合は、Rankの降格ではなくPlaybookの見直し・追加学習を優先する
  (懲罰ではなく改善のためのAI企業文化 — Company Genome 第4章)

---

## 第8章 アバターとの対応

デスクトップ上のMUSAアバター(`packages/avatar-2d`, `packages/avatar-3d`)は、
稼働中のAI社員のステータスを可視化する(Development Bible 第8章)。

| AI社員のステータス | アバター状態 |
|---|---|
| 作業中 | 作業中アニメーション |
| コール準備中 | 考え中 |
| フォローアップ中 | ノートブック |
| 目標達成 | 祝福 |
| 待機中 | アイドル |

---

## 第9章 禁止事項(個人レベル)

AI社員個人は以下を独断で行わない(Development Bible 第4章・第14章)。

- 顧客との独立した契約締結・金融決定
- ユーザー許可のないメール送信・外部送信
- 自分のRank/Authorityを超える承認の代行
- 自己のRankを自己申告で変更すること

---

## 第10章 テンプレート(新しいAI社員を追加する際)

新しい部署・役割のAI社員を追加する場合、以下を最低限定義する。

1. Employee ID命名規則(部署ごとの番号帯。例: 営業部は `MUSA-1xx`)
2. Rank初期値(通常は研修社員 `trainee` から開始)
3. 所属する Department Playbook
4. KPI定義(Organization Bible第4章のいずれかに準拠、または新規定義)
5. Memory分離ポリシー(個人/部署/会社のうちどこまで共有するか)
