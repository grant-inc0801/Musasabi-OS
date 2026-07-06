# @musasabi/ai-company

AI Company System。Musasabi OSは単体AIではなく「AI企業」であるという
Development Bible 第21章の思想を実装する中核パッケージ。

会社 → 本部 → 部門 → 部署 → チーム → AI社員 という組織階層(第21〜23章)、
AI社員のRole/Department/Authority/KPI(第24章)、承認フロー(第25章)、
KPI(第26章)、Company Brain(第28章、`@musasabi/memory` と連携)を扱う。

## 提供機能(D-20260706-001 現在)

- **組織モデル** — `ORGANIZATION_UNITS`(会社→8本部→部門→部署)、`getUnit`/`getChildren`/
  `getAncestors`/`getHeadquarters`
- **AI社員モデル** — `AIEmployee`(役割/所属/役職/権限/KPI/稼働状態)。
  稼働状態は `EmployeeState`(待機中/業務中/通話中/研修中/停止中)
- **AI社員名簿(Mock)** — `AI_EMPLOYEES`(MUSA-001 CEO、100番台=AI営業本部)、
  `getEmployee`/`getEmployeesByUnit`。実在の人物・実データではない
- **Company Genome 反映** — `COMPANY_GENOME`(Mission/Vision/Values/意思決定原則)
- **承認フロー** — `nextApprover`/`canApprove`/`approvalPath`(社員→主任→課長→部長→本部長→CEO)
- **コール三段階統合** — `@musasabi/call-training` と連携し、AI社員ごとの研修進捗
  (`EmployeeCallProgress`)から利用可能モードを判定(`allowedCallModes`)。
  AutoCall は合格基準充足かつ全安全ゲート充足時のみで、現フェーズでは常に無効

## Pending(次フェーズ)

- 永続化(組織・名簿・研修進捗のローカルストア)
- 承認ワークフローの実行・記録
- Organization Dashboard(第29章)
- Company Brain(第28章、`@musasabi/memory` と連携)
