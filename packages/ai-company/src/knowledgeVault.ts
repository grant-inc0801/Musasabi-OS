// 保管庫(Knowledge Vault)+容量管理(Directive D-20260706-010)。
// マニュアル・提案書・仕様書などの重要資料を一元管理するナレッジストレージ。
// βはMockデータのみ(実ファイル読取・削除・アップロード・クラウド接続はしない)。

/** 資料の種類。 */
export type VaultCategory =
  | "マニュアル"
  | "提案書"
  | "仕様書"
  | "設計書"
  | "プレゼン資料"
  | "営業資料"
  | "操作ガイド"
  | "出版資料"
  | "AI学習資料"
  | "テンプレート"
  | "議事録"
  | "リリースノート";

export type VaultItemStatus = "保存済み" | "保存待ち" | "アーカイブ候補" | "圧縮候補" | "削除候補";

/** バージョン履歴(原本は1つ・更新は履歴管理)。 */
export interface VaultFileVersion {
  version: string;
  updatedAtMs: number;
  note: string;
}

/** 保管データ1件(メタデータ。実体ファイルとは分離する設計)。 */
export interface KnowledgeVaultItem {
  id: string;
  title: string;
  category: VaultCategory;
  dept: string;
  author: string;
  version: string;
  createdAtMs: number;
  updatedAtMs: number;
  sizeKb: number;
  tags: string[];
  status: VaultItemStatus;
  /** 重要資料の保護フラグ(削除候補にしない)。 */
  isProtected: boolean;
  versions: VaultFileVersion[];
}

const DAY = 24 * 60 * 60 * 1000;
/** Mockの基準時刻(決定論のため固定)。 */
export const VAULT_NOW_MS = 1_751_900_000_000;

function item(
  id: string,
  title: string,
  category: VaultCategory,
  dept: string,
  author: string,
  sizeKb: number,
  daysAgo: number,
  tags: string[],
  status: VaultItemStatus = "保存済み",
  isProtected = false,
  versions: VaultFileVersion[] = [],
): KnowledgeVaultItem {
  return {
    id,
    title,
    category,
    dept,
    author,
    version: versions.length > 0 ? versions[versions.length - 1].version : "v1.0",
    createdAtMs: VAULT_NOW_MS - daysAgo * DAY - 3 * DAY,
    updatedAtMs: VAULT_NOW_MS - daysAgo * DAY,
    sizeKb,
    tags,
    status,
    isProtected,
    versions,
  };
}

/** 保管データ(Mock)。 */
export const VAULT_ITEMS: readonly KnowledgeVaultItem[] = [
  item("v-001", "テストコール操作マニュアル", "マニュアル", "企画部", "AIドキュメントライター", 420, 1, ["営業部", "コール"], "保存済み", true, [
    { version: "v1.0", updatedAtMs: VAULT_NOW_MS - 20 * DAY, note: "初版" },
    { version: "v1.1", updatedAtMs: VAULT_NOW_MS - 1 * DAY, note: "議事録機能を追記" },
  ]),
  item("v-002", "架電リストツール提案書", "提案書", "企画部", "AIプランナー", 5800, 2, ["外販", "営業"], "圧縮候補"),
  item("v-003", "Musasabi OS β仕様書", "仕様書", "システム開発部", "AIアーキテクト", 980, 5, ["β版"], "保存済み", true),
  item("v-004", "AI出版パイプライン設計書", "設計書", "出版部", "AI編集長", 760, 8, ["出版"]),
  item("v-005", "新サービス紹介プレゼン", "プレゼン資料", "企画部", "AIプランナー", 8200, 12, ["営業資料"], "圧縮候補"),
  item("v-006", "営業トーク集(共通ナレッジ)", "営業資料", "営業部", "AIセールスコーチ", 310, 3, ["Sales Brain"]),
  item("v-007", "保管庫操作ガイド", "操作ガイド", "企画部", "AIドキュメントライター", 150, 0, ["保管庫"], "保存待ち"),
  item("v-008", "AI学習用コール分析データ", "AI学習資料", "市場調査部", "AIアナリスト", 12400, 40, ["大容量"], "アーカイブ候補"),
  item("v-009", "議事録テンプレート", "テンプレート", "企画部", "AIドキュメントライター", 45, 15, ["テンプレ"]),
  item("v-010", "週次定例議事録(6月)", "議事録", "経理部", "AI書記", 88, 35, ["定例"], "アーカイブ候補"),
  item("v-011", "β版リリースノート", "リリースノート", "システム開発部", "AIリリース管理", 62, 1, ["リリース"]),
  item("v-012", "架電リストツール提案書", "提案書", "企画部", "AIプランナー", 5800, 30, ["外販", "旧版"], "削除候補"),
];

/** 上限容量Mock(KB)。 */
export const VAULT_CAPACITY_KB = 51_200; // 50MB
/** 大容量とみなす閾値(KB)。 */
export const LARGE_FILE_KB = 5_000;

export type VaultCapacityStatus = "正常" | "注意" | "危険";

export const VAULT_STATUS_COLOR: Record<VaultCapacityStatus, string> = {
  正常: "#22C55E",
  注意: "#FACC15",
  危険: "#EF4444",
};

export interface KnowledgeVaultStorageSummary {
  itemCount: number;
  totalKb: number;
  capacityKb: number;
  usagePercent: number;
  status: VaultCapacityStatus;
  largeFileCount: number;
  duplicateCount: number;
  archiveCandidateCount: number;
  deleteCandidateCount: number;
  compressCandidateCount: number;
  byDept: Array<{ dept: string; totalKb: number }>;
  byCategory: Array<{ category: string; totalKb: number }>;
}

/** 使用率から容量ステータスを決める(0-69%正常 / 70-89%注意 / 90%以上危険)。 */
export function capacityStatusOf(usagePercent: number): VaultCapacityStatus {
  if (usagePercent >= 90) return "危険";
  if (usagePercent >= 70) return "注意";
  return "正常";
}

/** 重複候補: 同一タイトル・同一サイズの組を検出する(Mock)。 */
export function findDuplicateCandidates(items: readonly KnowledgeVaultItem[]): KnowledgeVaultItem[] {
  const seen = new Map<string, KnowledgeVaultItem>();
  const dups: KnowledgeVaultItem[] = [];
  for (const it of items) {
    const key = `${it.title}|${it.sizeKb}`;
    if (seen.has(key)) {
      dups.push(it);
    } else {
      seen.set(key, it);
    }
  }
  return dups;
}

/** 容量サマリーを集計する(決定的)。 */
export function computeVaultSummary(
  items: readonly KnowledgeVaultItem[],
  capacityKb = VAULT_CAPACITY_KB,
): KnowledgeVaultStorageSummary {
  const totalKb = items.reduce((sum, it) => sum + it.sizeKb, 0);
  const usagePercent = capacityKb === 0 ? 0 : Math.round((totalKb / capacityKb) * 100);
  const agg = (key: (it: KnowledgeVaultItem) => string) => {
    const map = new Map<string, number>();
    for (const it of items) map.set(key(it), (map.get(key(it)) ?? 0) + it.sizeKb);
    return [...map.entries()]
      .map(([k, v]) => ({ name: k, totalKb: v }))
      .sort((a, b) => b.totalKb - a.totalKb);
  };
  return {
    itemCount: items.length,
    totalKb,
    capacityKb,
    usagePercent,
    status: capacityStatusOf(usagePercent),
    largeFileCount: items.filter((it) => it.sizeKb >= LARGE_FILE_KB).length,
    duplicateCount: findDuplicateCandidates(items).length,
    archiveCandidateCount: items.filter((it) => it.status === "アーカイブ候補").length,
    deleteCandidateCount: items.filter((it) => it.status === "削除候補").length,
    compressCandidateCount: items.filter((it) => it.status === "圧縮候補").length,
    byDept: agg((it) => it.dept).map((e) => ({ dept: e.name, totalKb: e.totalKb })),
    byCategory: agg((it) => it.category).map((e) => ({ category: e.name, totalKb: e.totalKb })),
  };
}

/** 検索・絞り込み(キーワードはタイトル/タグ/作成AI社員に部分一致)。 */
export function filterVaultItems(
  items: readonly KnowledgeVaultItem[],
  query: { keyword?: string; category?: string; dept?: string; sort?: "updated" | "size" },
): KnowledgeVaultItem[] {
  const keyword = query.keyword?.trim().toLowerCase();
  const filtered = items.filter((it) => {
    if (query.category && it.category !== query.category) return false;
    if (query.dept && it.dept !== query.dept) return false;
    if (
      keyword &&
      !it.title.toLowerCase().includes(keyword) &&
      !it.author.toLowerCase().includes(keyword) &&
      !it.tags.some((t) => t.toLowerCase().includes(keyword))
    ) {
      return false;
    }
    return true;
  });
  const sorted = [...filtered];
  if (query.sort === "size") {
    sorted.sort((a, b) => b.sizeKb - a.sizeKb);
  } else {
    sorted.sort((a, b) => b.updatedAtMs - a.updatedAtMs);
  }
  return sorted;
}

/** 保存ルール(Mock表示用)。 */
export const VAULT_STORAGE_POLICIES: readonly string[] = [
  "原本は1つだけ保持し、更新はバージョン履歴として管理",
  "古いバージョンはアーカイブ候補へ移動",
  "画像・PDF・動画など大きい資料は圧縮候補にする",
  "30日以上未使用の大容量ファイルは整理候補にする",
  "削除は即時ではなく削除候補として表示(保護フラグ付きは対象外)",
  "プレビュー用サムネイルのみ保持し、実体ファイルとメタデータを分離",
  "保管前にファイルサイズを表示して確認",
];

// ---- 企画部の資料作成フロー ----

/** 企画部に追加する業務内容(Directive 8)。 */
export const PLANNING_DOC_TASKS: readonly string[] = [
  "開発した自動化のマニュアル作成",
  "新ツールの操作ガイド作成",
  "新サービスの提案資料作成",
  "営業資料・導入ガイド・プレゼン資料作成",
  "リリースノート作成",
  "保管庫への保存・更新履歴管理・資料整理",
];

/** 企画部詳細パネル用の資料状況(Mock)。 */
export interface PlanningDocStatus {
  label: string;
  items: string[];
}

export const PLANNING_DOC_STATUSES: readonly PlanningDocStatus[] = [
  { label: "作成中マニュアル", items: ["営業リスト管理マニュアル v0.9"] },
  { label: "作成中提案資料", items: ["AI音声コーチ導入提案(市場調査部連携)"] },
  { label: "保管庫保存待ち", items: ["保管庫操作ガイド v1.0"] },
  { label: "保存済み資料", items: ["テストコール操作マニュアル v1.1", "架電リストツール提案書"] },
  { label: "更新が必要な資料", items: ["Musasabi OS β仕様書(市場調査部の新技術を反映)"] },
  { label: "容量注意資料", items: ["新サービス紹介プレゼン(8.2MB・圧縮候補)"] },
];

/** 資料フロー(Mock表示用)。 */
export const VAULT_FLOW_JA = "市場調査部 → 開発部 → 企画部 → 保管庫 → 営業部 / 出版部 / 管理部";

/** アバター吹き出し用: 保管庫の要約行(決定的)。 */
export function buildVaultSummaryJa(items: readonly KnowledgeVaultItem[] = VAULT_ITEMS): string[] {
  const summary = computeVaultSummary(items);
  const lines: string[] = [];
  lines.push("企画部が営業部向けマニュアルを作成し、保管庫へ保存しました。");
  if (summary.status === "正常") {
    lines.push(`保管庫の使用率は${summary.usagePercent}%で正常です。`);
  } else {
    lines.push(
      `保管庫の使用率が${summary.usagePercent}%になっています。大容量の資料が${summary.largeFileCount}件あるため、圧縮またはアーカイブ候補として整理できます。`,
    );
  }
  return lines;
}
