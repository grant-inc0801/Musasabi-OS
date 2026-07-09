// Master Roadmap to Production(docs/ai-handoff/MASTER_ROADMAP_TO_PRODUCTION.md)。
// Mock 完成状況の追跡と、本番対応(Production Readiness)フェーズのゲート管理を行う。
// 本モジュールは「追跡・可視化・ゲート」のみ。認証/secrets/本番DB 等は実装しない
// (人間承認が明示されるまでロック)。すべて Mock・決定論。

/** 開発方針(指示書 Development Policy)。 */
export const DEVELOPMENT_POLICY: readonly string[] = [
  "すべての機能をまず Mock データで構築する。",
  "UI・ワークフロー・ガバナンスを内部で検証する。",
  "各モジュールを1つのオペレーティングシステムへ統合する。",
  "エンドツーエンドの Mock テストを実施する。",
  "Mock 完成後にのみ Production Readiness へ進む。",
];

export type MockStatus = "done" | "in_progress" | "planned";

export const MOCK_STATUS_LABEL_JA: Record<MockStatus, string> = {
  done: "完了",
  in_progress: "進行中",
  planned: "予定",
};

/** Mock 完成スコープの1項目。 */
export interface MockScopeItem {
  id: string;
  name: string;
  status: MockStatus;
  /** 実装元(パッケージ/画面)。トレーサビリティ用。 */
  implementedBy: string;
}

/** Mock 完成スコープ(指示書 Mock Completion Scope)と現状。 */
export const MOCK_COMPLETION_SCOPE: readonly MockScopeItem[] = [
  { id: "executive-governance", name: "AI経営ガバナンス", status: "done", implementedBy: "@musasabi/governance・GovernancePage" },
  { id: "departments-employees", name: "部門・AI社員", status: "done", implementedBy: "@musasabi/ai-company・CompanyPage" },
  { id: "company-brain", name: "Company Brain", status: "done", implementedBy: "@musasabi/memory・CompanyBrainPage" },
  { id: "dna-constitution", name: "Musasabi DNA・憲章", status: "done", implementedBy: "@musasabi/advanced-modules・@musasabi/agi" },
  { id: "ceo-dashboard", name: "CEOダッシュボード", status: "done", implementedBy: "@musasabi/ceo-dashboard・CeoDashboardPanel" },
  { id: "two-layer-ui", name: "二層UI", status: "done", implementedBy: "CommandCenter(Layer A/B)" },
  { id: "business-factory", name: "AI事業ファクトリー", status: "done", implementedBy: "@musasabi/business-factory・BusinessFactoryPage" },
  { id: "business-templates", name: "事業テンプレートカタログ", status: "done", implementedBy: "@musasabi/business-factory(BUSINESS_TEMPLATES)" },
  { id: "musasabi-world", name: "Musasabi World", status: "done", implementedBy: "@musasabi/musasabi-world・MusasabiWorldPage" },
  { id: "evolution-modules", name: "進化モジュール", status: "done", implementedBy: "@musasabi/evolution-modules・EvolutionModulesPage" },
  { id: "audit-kpi-risk", name: "監査・KPI・リスク", status: "done", implementedBy: "@musasabi/audit・AuditPage" },
  { id: "workflow-engine", name: "ワークフローエンジン", status: "done", implementedBy: "WorkflowPage" },
  { id: "dashboards", name: "ダッシュボード群", status: "done", implementedBy: "CompanyDashboardPage・CommandCenter" },
  { id: "reports", name: "レポート", status: "done", implementedBy: "ReportsPage" },
];

export type ReadinessStatus = "locked" | "in_progress" | "approved";

export const READINESS_STATUS_LABEL_JA: Record<ReadinessStatus, string> = {
  locked: "ロック中(承認待ち)",
  in_progress: "対応中",
  approved: "承認済み",
};

/** Production Readiness フェーズの1項目。人間承認が必須で、既定はロック。 */
export interface ReadinessItem {
  id: string;
  name: string;
  status: ReadinessStatus;
  /** 常に人間承認が必要(実装は承認後のみ)。 */
  requiresApproval: true;
  note: string;
  /**
   * 設計方針(実装ではなく設計のみ)。承認前に用意する「設計ドキュメント/構成テンプレート」の
   * 要旨。実認証情報・実接続・課金は含めない。詳細は PRODUCTION_READINESS_DESIGN_DOC 参照。
   */
  design: string;
}

/** 設計ドキュメントの場所(実装は承認後・本フェーズは設計のみ)。 */
export const PRODUCTION_READINESS_DESIGN_DOC = "docs/ai-handoff/PRODUCTION_READINESS_DESIGN.md";

/** Production Readiness 項目(指示書 Production Readiness Phase)。Mock 完成後のみ・承認必須。 */
export const PRODUCTION_READINESS_ITEMS: readonly ReadinessItem[] = [
  { id: "authn-authz", name: "認証・認可", status: "locked", requiresApproval: true, note: "実認証情報が必要なため承認まで未着手。", design: "OIDC/OAuth2 + RBAC。ロール(admin/operator/viewer)と権限マトリクスを定義。secrets は外部シークレットマネージャ参照(値はコミットしない)。" },
  { id: "secret-management", name: "シークレット管理", status: "locked", requiresApproval: true, note: "secrets を扱うため承認必須。", design: "シークレットマネージャ(例: Vault/クラウドKMS)に集約。アプリは環境変数経由で参照名のみ保持。.env.example はプレースホルダのみ。" },
  { id: "production-db", name: "本番データベース", status: "locked", requiresApproval: true, note: "実データ書き込みのため承認必須。", design: "マネージドRDB。接続はシークレット経由、最小権限ロール、暗号化(at-rest/in-transit)、スキーマ/マイグレーション管理。" },
  { id: "logging-monitoring", name: "本番ロギング・監視", status: "locked", requiresApproval: true, note: "本番環境接続のため承認必須。", design: "構造化ログ+集約基盤、メトリクス/アラート、SLO/エラーバジェット。個人情報のマスキング方針を定義。" },
  { id: "backup-dr", name: "バックアップ・災害復旧", status: "locked", requiresApproval: true, note: "本番データ対象のため承認必須。", design: "定期自動バックアップ+リストア手順、RPO/RTO 目標、DR リージョン、復旧演習の計画。" },
  { id: "env-separation", name: "環境分離(dev/staging/prod)", status: "locked", requiresApproval: true, note: "本番環境構築のため承認必須。", design: "dev/staging/prod を分離。環境別の設定・シークレット・アクセス制御。構成テンプレートは docs/production-readiness/ENVIRONMENTS.md。" },
  { id: "secure-deploy", name: "セキュアデプロイパイプライン", status: "locked", requiresApproval: true, note: "本番デプロイのため承認必須。", design: "署名付きアーティファクト、承認ゲート付きデプロイ、ロールバック、最小権限のデプロイ資格情報。テンプレは deploy-pipeline.example.yml(不活性)。" },
  { id: "data-migration", name: "データ移行", status: "locked", requiresApproval: true, note: "実データ移行のため承認必須。", design: "前方互換マイグレーション、ドライラン、バックアップ前提、ロールバック計画。実データは承認後にのみ扱う。" },
  { id: "perf-load-test", name: "性能・負荷テスト", status: "locked", requiresApproval: true, note: "本番相当環境が必要なため承認必須。", design: "負荷シナリオ、目標スループット/レイテンシ、ステージング環境での実施計画。本番には実施しない。" },
  { id: "security-review", name: "セキュリティレビュー", status: "locked", requiresApproval: true, note: "本番公開前の必須ゲート。", design: "脅威モデリング、依存脆弱性スキャン、秘密情報スキャン(既存 check-secret-patterns を拡張)、レビュー チェックリスト。" },
  { id: "prod-approval-gates", name: "本番承認ゲート", status: "locked", requiresApproval: true, note: "人間承認の最終ゲート。", design: "リリース承認フロー(申請→レビュー→人間承認→記録)。承認は監査ログに残し、憲章に従う。" },
];

export type ChecklistStatus = "done" | "pending";

export const CHECKLIST_STATUS_LABEL_JA: Record<ChecklistStatus, string> = {
  done: "済み",
  pending: "未(承認/本番フェーズで実施)",
};

export interface ChecklistItem {
  id: string;
  name: string;
  status: ChecklistStatus;
}

/** 本番リリースチェックリスト(指示書 Production Launch Checklist)。 */
export const PRODUCTION_LAUNCH_CHECKLIST: readonly ChecklistItem[] = [
  { id: "all-tests-passing", name: "全テスト成功", status: "done" },
  { id: "docs-complete", name: "ドキュメント整備", status: "done" },
  { id: "governance-verified", name: "ガバナンス検証", status: "done" },
  { id: "security-review", name: "セキュリティレビュー完了", status: "pending" },
  { id: "backup-verified", name: "バックアップ検証", status: "pending" },
  { id: "rollback-plan", name: "ロールバック計画準備", status: "pending" },
  { id: "human-approval", name: "本番リリース前の人間承認", status: "pending" },
];

/** 本番ルール(指示書 Rule)。 */
export const PRODUCTION_RULE =
  "Production Readiness が明示的に承認されるまで、本番連携・課金・銀行・機微な認証情報は一切行わない。";

export interface MockCompletion {
  total: number;
  done: number;
  percent: number;
  complete: boolean;
}

/** Mock 完成度を集計する。全項目 done で complete=true。 */
export function computeMockCompletion(
  scope: readonly MockScopeItem[] = MOCK_COMPLETION_SCOPE,
): MockCompletion {
  const total = scope.length;
  const done = scope.filter((s) => s.status === "done").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent, complete: total > 0 && done === total };
}

/**
 * Production Readiness ゲート。人間承認が明示されない限り常にロック解除しない。
 * Mock 完成 かつ approved=true のときのみ true。
 */
export function isProductionReadinessUnlocked(
  approved: boolean,
  scope: readonly MockScopeItem[] = MOCK_COMPLETION_SCOPE,
): boolean {
  return approved === true && computeMockCompletion(scope).complete;
}

/** 現時点の本番承認状態(既定 false = 未承認)。承認は人間が明示的に行う。 */
export const PRODUCTION_APPROVED = false;

/** AIアバターがロードマップ状況を要約する日本語文。 */
export function summarizeRoadmapJa(
  scope: readonly MockScopeItem[] = MOCK_COMPLETION_SCOPE,
): string {
  const c = computeMockCompletion(scope);
  const gate = isProductionReadinessUnlocked(PRODUCTION_APPROVED, scope)
    ? "Production Readiness 解放済み"
    : "Production Readiness はロック中(人間承認待ち)";
  return `本番ロードマップ: Mock完成 ${c.percent}%(${c.done}/${c.total})、${gate}。`;
}

/** ガバナンス方針(表示)。 */
export const ROADMAP_GOVERNANCE_NOTES: readonly string[] = [
  "Mock ファースト。UI・ワークフロー・ガバナンスを内部検証してから統合する。",
  "Production Readiness の各項目は人間承認が明示されるまでロックする。",
  "本番連携・課金・銀行・機微認証情報は承認前に一切行わない(監査ログ保持)。",
];
