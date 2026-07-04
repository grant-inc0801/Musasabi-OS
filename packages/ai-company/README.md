# @musasabi/ai-company

AI Company System。Musasabi OSは単体AIではなく「AI企業」であるという
Development Bible 第21章の思想を実装する中核パッケージ。

会社 → 本部 → 部門 → 部署 → チーム → AI社員 という組織階層(第21〜23章)、
AI社員のRole/Department/Authority/KPI(第24章)、承認フロー(第25章)、
KPI(第26章)、Company Brain(第28章、`@musasabi/memory` と連携)を扱う。

現段階では組織階層を表す型定義のみを提供し、永続化・承認ワークフロー・
Organization Dashboard(第29章)の実装は次フェーズで行う。
