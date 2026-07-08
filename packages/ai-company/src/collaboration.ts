import { deptIcon } from "./commandCenter";

// D-013 Company Brain & Collaboration Engine: 部署間の引き継ぎ・提案・共有ナレッジを
// モデル化する。Company Brain(Memory)と並ぶ「協働」の可視化層。すべてMock。

export type CollabType = "引き継ぎ" | "提案" | "共有ナレッジ" | "承認依頼";

export const COLLAB_TYPES: readonly CollabType[] = ["引き継ぎ", "提案", "共有ナレッジ", "承認依頼"];

export type CollabStatus = "対応中" | "完了" | "承認待ち" | "保留";

export const COLLAB_STATUS_COLOR: Record<CollabStatus, string> = {
  対応中: "#FACC15",
  完了: "#22C55E",
  承認待ち: "#A855F7",
  保留: "#6b7280",
};

/** 部署間コラボレーション項目(A部署 → B部署へ渡す仕事・提案)。 */
export interface CollabItem {
  id: string;
  fromDeptId: string;
  fromDept: string;
  toDeptId: string;
  toDept: string;
  type: CollabType;
  title: string;
  status: CollabStatus;
  createdAt: string;
}

export const COLLAB_ITEMS: readonly CollabItem[] = [
  {
    id: "C-1",
    fromDeptId: "market_research",
    fromDept: "市場調査部",
    toDeptId: "development",
    toDept: "システム開発部",
    type: "提案",
    title: "日本語STTモデルをテストコール解析へ組み込む",
    status: "対応中",
    createdAt: "07/07",
  },
  {
    id: "C-2",
    fromDeptId: "market_research",
    fromDept: "市場調査部",
    toDeptId: "planning",
    toDept: "企画部",
    type: "提案",
    title: "AI出版パイプラインの商品化",
    status: "保留",
    createdAt: "07/07",
  },
  {
    id: "C-3",
    fromDeptId: "development",
    fromDept: "システム開発部",
    toDeptId: "planning",
    toDept: "企画部",
    type: "引き継ぎ",
    title: "保管庫の自動アーカイブ提案の資料化",
    status: "対応中",
    createdAt: "07/06",
  },
  {
    id: "C-4",
    fromDeptId: "development",
    fromDept: "架電リスト制作課",
    toDeptId: "sales",
    toDept: "営業部",
    type: "引き継ぎ",
    title: "抽出した飲食店リストの営業リストへの取り込み",
    status: "完了",
    createdAt: "07/06",
  },
  {
    id: "C-5",
    fromDeptId: "publishing",
    fromDept: "出版部",
    toDeptId: "market_research",
    toDept: "市場調査部",
    type: "承認依頼",
    title: "類似作品チェックの最終判断(CEO/管理部)",
    status: "承認待ち",
    createdAt: "07/07",
  },
  {
    id: "C-6",
    fromDeptId: "support",
    fromDept: "カスタマーサポート部",
    toDeptId: "development",
    toDept: "システム開発部",
    type: "引き継ぎ",
    title: "テストコール履歴が見つからない問い合わせの技術確認",
    status: "対応中",
    createdAt: "07/06",
  },
];

/** 全社共有ナレッジ(部署をまたいで参照・採用される知見)。 */
export interface SharedKnowledgeEntry {
  id: string;
  category: "トーク改善" | "技術" | "運用" | "テンプレート";
  title: string;
  sourceDeptId: string;
  sourceDept: string;
  adoptedByDepts: string[];
}

export const SHARED_KNOWLEDGE: readonly SharedKnowledgeEntry[] = [
  {
    id: "K-1",
    category: "トーク改善",
    title: "冒頭30秒で要件を伝える架電トーク",
    sourceDeptId: "sales",
    sourceDept: "営業部",
    adoptedByDepts: ["営業部", "カスタマーサポート部"],
  },
  {
    id: "K-2",
    category: "技術",
    title: "日本語STT(OSS)のローカル評価手順",
    sourceDeptId: "market_research",
    sourceDept: "市場調査部",
    adoptedByDepts: ["システム開発部"],
  },
  {
    id: "K-3",
    category: "運用",
    title: "保管庫の肥大化を防ぐ保存ルール",
    sourceDeptId: "planning",
    sourceDept: "企画部",
    adoptedByDepts: ["企画部", "出版部", "システム開発部"],
  },
  {
    id: "K-4",
    category: "テンプレート",
    title: "議事録テンプレート(部署別)",
    sourceDeptId: "planning",
    sourceDept: "企画部",
    adoptedByDepts: ["営業部", "出版部", "人事部"],
  },
  {
    id: "K-5",
    category: "運用",
    title: "出版クリーン運営チェックリスト",
    sourceDeptId: "publishing",
    sourceDept: "出版部",
    adoptedByDepts: ["出版部", "市場調査部"],
  },
];

export interface CollaborationSummary {
  totalItems: number;
  inProgress: number;
  waitingApproval: number;
  sharedKnowledgeCount: number;
  /** 共有ナレッジが採用された部署数(延べ)。 */
  adoptionCount: number;
}

/** コラボレーション全体のサマリー。 */
export function buildCollaborationSummary(
  items: readonly CollabItem[] = COLLAB_ITEMS,
  knowledge: readonly SharedKnowledgeEntry[] = SHARED_KNOWLEDGE,
): CollaborationSummary {
  return {
    totalItems: items.length,
    inProgress: items.filter((i) => i.status === "対応中").length,
    waitingApproval: items.filter((i) => i.status === "承認待ち").length,
    sharedKnowledgeCount: knowledge.length,
    adoptionCount: knowledge.reduce((sum, k) => sum + k.adoptedByDepts.length, 0),
  };
}

/** 種別・部署でコラボレーション項目を絞り込む(部署は from/to どちらでも一致)。 */
export function filterCollabItems(
  items: readonly CollabItem[],
  filter: { type?: CollabType; deptId?: string },
): CollabItem[] {
  return items.filter((i) => {
    if (filter.type && i.type !== filter.type) return false;
    if (filter.deptId && i.fromDeptId !== filter.deptId && i.toDeptId !== filter.deptId) {
      return false;
    }
    return true;
  });
}

/** コラボ項目の from/to アイコン(表示補助)。 */
export function collabIcons(item: CollabItem): { from: string; to: string } {
  return { from: deptIcon(item.fromDeptId), to: deptIcon(item.toDeptId) };
}
