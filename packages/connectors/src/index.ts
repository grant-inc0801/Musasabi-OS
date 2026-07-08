// Phase 3: Real-World Integration(Directive D-20260708-004)。
// 外部業務システム連携の「コネクタ・フレームワーク」。ビジネスロジックと連携実装を
// 分離し、まず Mock アダプタで動かす。本番接続は明示承認まで無効。書き込みは承認ゲート必須。
// secrets はこのパッケージ/リポジトリに一切保存しない(実接続時に実行環境から注入する想定)。

/** 連携先カテゴリ(Directive の優先対象)。 */
export type ConnectorCategory =
  | "github"
  | "office_excel"
  | "calendar"
  | "zoom_phone"
  | "filemaker"
  | "accounting";

export const CONNECTOR_CATEGORY_LABEL_JA: Record<ConnectorCategory, string> = {
  github: "GitHub",
  office_excel: "Microsoft Office / Excel",
  calendar: "カレンダー",
  zoom_phone: "Zoom Phone",
  filemaker: "FileMaker",
  accounting: "会計ソフト",
};

/** 動作モード。production は明示承認まで無効。 */
export type ConnectorMode = "mock" | "production";

/** 操作種別。読み取りを書き込みより先に実装する方針。 */
export type OperationType = "read" | "write";

export const OPERATION_LABEL_JA: Record<OperationType, string> = {
  read: "読み取り",
  write: "書き込み",
};

/** コネクタ定義(1連携先=1ディスクリプタ)。 */
export interface ConnectorDescriptor {
  id: string;
  name: string;
  category: ConnectorCategory;
  /** 現在のモード。既定は mock。 */
  mode: ConnectorMode;
  /** 本番接続が承認済みか。false の間は production を許可しない。 */
  productionApproved: boolean;
  /** 対応する操作(read を先に、write は後続)。 */
  capabilities: readonly OperationType[];
  /** 説明。 */
  description: string;
}

/** 初期コネクタ(すべて Mock・本番未承認)。 */
export const CONNECTORS: readonly ConnectorDescriptor[] = [
  {
    id: "github",
    name: "GitHub",
    category: "github",
    mode: "mock",
    productionApproved: false,
    capabilities: ["read", "write"],
    description: "Issue / PR / リポジトリ情報の取得と作成(Mock)。",
  },
  {
    id: "office_excel",
    name: "Microsoft Office / Excel",
    category: "office_excel",
    mode: "mock",
    productionApproved: false,
    capabilities: ["read", "write"],
    description: "Excel ブックの読み込みと書き出し(Mock)。",
  },
  {
    id: "calendar",
    name: "カレンダー",
    category: "calendar",
    mode: "mock",
    productionApproved: false,
    capabilities: ["read", "write"],
    description: "予定の取得と登録(Mock)。",
  },
  {
    id: "zoom_phone",
    name: "Zoom Phone",
    category: "zoom_phone",
    mode: "mock",
    productionApproved: false,
    capabilities: ["read"],
    description: "通話履歴の取得(Mock・読み取りのみ)。",
  },
  {
    id: "filemaker",
    name: "FileMaker",
    category: "filemaker",
    mode: "mock",
    productionApproved: false,
    capabilities: ["read", "write"],
    description: "顧客レコードの取得と更新(Mock)。",
  },
  {
    id: "accounting",
    name: "会計ソフト",
    category: "accounting",
    mode: "mock",
    productionApproved: false,
    capabilities: ["read", "write"],
    description: "仕訳・収支データの取得と登録(Mock)。",
  },
];

/** ID からコネクタ定義を取得する。 */
export function getConnector(
  id: string,
  connectors: readonly ConnectorDescriptor[] = CONNECTORS,
): ConnectorDescriptor | undefined {
  return connectors.find((c) => c.id === id);
}

// ---- 承認ゲート ----

/** 操作可否の判定結果。 */
export interface OperationDecision {
  allowed: boolean;
  /** 実行された場合の効果。simulated は Mock(実システムに影響なし)。 */
  effect: "simulated" | "production" | "blocked";
  /** 却下理由(allowed=false のとき)。 */
  reason?: string;
}

/** 書き込み承認情報(本番書き込み時のみ必要)。 */
export interface WriteApproval {
  approvedBy: string;
  reason: string;
}

/**
 * コネクタ操作の可否を判定する(純関数・決定論)。
 * - コネクタが操作をサポートしていなければ却下。
 * - mock: read/write とも許可だが effect は simulated(実システム無影響)。
 * - production: productionApproved が必須。write はさらに承認(approval)が必須。
 */
export function evaluateOperation(
  descriptor: ConnectorDescriptor,
  operation: OperationType,
  approval?: WriteApproval,
): OperationDecision {
  if (!descriptor.capabilities.includes(operation)) {
    return {
      allowed: false,
      effect: "blocked",
      reason: `${descriptor.name} は${OPERATION_LABEL_JA[operation]}をサポートしていません。`,
    };
  }
  if (descriptor.mode === "mock") {
    return { allowed: true, effect: "simulated" };
  }
  // production
  if (!descriptor.productionApproved) {
    return {
      allowed: false,
      effect: "blocked",
      reason: "本番接続が未承認です。承認まで外部サービスは無効です。",
    };
  }
  if (operation === "write" && (!approval || approval.approvedBy.trim() === "")) {
    return {
      allowed: false,
      effect: "blocked",
      reason: "本番書き込みには承認(承認者・理由)が必要です。",
    };
  }
  return { allowed: true, effect: "production" };
}

// ---- Mock アダプタ ----

/** コネクタ操作の結果。 */
export interface ConnectorResult {
  connectorId: string;
  operation: OperationType;
  effect: OperationDecision["effect"];
  ok: boolean;
  /** 読み取り結果 or 書き込みエコー(Mock)。 */
  data?: unknown;
  message: string;
}

/** カテゴリ別の Mock 読み取りデータ(決定論)。 */
export function mockRead(descriptor: ConnectorDescriptor, resource: string): unknown {
  switch (descriptor.category) {
    case "github":
      return { repo: "grant-inc0801/Musasabi-OS", openIssues: 3, openPullRequests: 1, resource };
    case "office_excel":
      return { workbook: `${resource || "sample"}.xlsx`, sheets: ["営業リスト", "収支"], rows: 42 };
    case "calendar":
      return { events: [{ title: "定例MTG", start: "10:00" }, { title: "商談", start: "14:00" }], resource };
    case "zoom_phone":
      return { calls: [{ to: "080-0000-0000", durationSec: 128, result: "接続" }], resource };
    case "filemaker":
      return { table: resource || "Customers", records: 128, sample: { name: "サンプル商店", phone: "06-0000-0000" } };
    case "accounting":
      return { period: resource || "2026-07", revenue: 1250000, expense: 480000, entries: 36 };
    default:
      return { resource };
  }
}

/**
 * Mock コネクタアダプタ。承認ゲートを通してから read/write を行う。
 * 実システムには一切接続しない(effect=simulated)。監査ログへ記録できる。
 */
export class MockConnectorAdapter {
  constructor(private readonly descriptor: ConnectorDescriptor) {}

  read(resource = ""): ConnectorResult {
    const decision = evaluateOperation(this.descriptor, "read");
    if (!decision.allowed) {
      return {
        connectorId: this.descriptor.id,
        operation: "read",
        effect: decision.effect,
        ok: false,
        message: decision.reason ?? "読み取りは許可されていません。",
      };
    }
    return {
      connectorId: this.descriptor.id,
      operation: "read",
      effect: decision.effect,
      ok: true,
      data: mockRead(this.descriptor, resource),
      message: `${this.descriptor.name} から${resource || "既定リソース"}を読み取りました(Mock)。`,
    };
  }

  write(resource: string, payload: unknown, approval?: WriteApproval): ConnectorResult {
    const decision = evaluateOperation(this.descriptor, "write", approval);
    if (!decision.allowed) {
      return {
        connectorId: this.descriptor.id,
        operation: "write",
        effect: decision.effect,
        ok: false,
        message: decision.reason ?? "書き込みは許可されていません。",
      };
    }
    return {
      connectorId: this.descriptor.id,
      operation: "write",
      effect: decision.effect,
      ok: true,
      data: { resource, payload },
      message:
        decision.effect === "simulated"
          ? `${this.descriptor.name} への書き込みをシミュレートしました(実システム無影響)。`
          : `${this.descriptor.name} へ書き込みました(本番)。`,
    };
  }
}

// ---- 監査ログ ----

export interface AuditEntry {
  timestampMs: number;
  connectorId: string;
  operation: OperationType;
  effect: OperationDecision["effect"];
  ok: boolean;
  message: string;
}

/** 操作結果を監査エントリへ変換する。 */
export function toAuditEntry(result: ConnectorResult, nowMs: number): AuditEntry {
  return {
    timestampMs: nowMs,
    connectorId: result.connectorId,
    operation: result.operation,
    effect: result.effect,
    ok: result.ok,
    message: result.message,
  };
}

/** 監査ログへ追記する(イミュータブル・新配列を返す)。 */
export function appendAudit(log: readonly AuditEntry[], entry: AuditEntry): AuditEntry[] {
  return [entry, ...log];
}

// ---- サマリー ----

export interface ConnectorSummary {
  total: number;
  mockCount: number;
  productionApprovedCount: number;
  readOnlyCount: number;
  writeCapableCount: number;
}

/** コネクタ群のサマリー(決定論)。 */
export function summarizeConnectors(
  connectors: readonly ConnectorDescriptor[] = CONNECTORS,
): ConnectorSummary {
  return {
    total: connectors.length,
    mockCount: connectors.filter((c) => c.mode === "mock").length,
    productionApprovedCount: connectors.filter((c) => c.productionApproved).length,
    readOnlyCount: connectors.filter(
      (c) => c.capabilities.includes("read") && !c.capabilities.includes("write"),
    ).length,
    writeCapableCount: connectors.filter((c) => c.capabilities.includes("write")).length,
  };
}
