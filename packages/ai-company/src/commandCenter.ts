import { buildResearchAndPublishingSummaryJa } from "./marketResearch";

// Musasabi Command Center のデータモデル(Directive D-20260706-007)。
// 部署パネル・ステータス色・部署間連携・アシスタント要約(吹き出し)を扱う。
// β版は Mock データ(決定論)。実API接続・実架電はしない。

/** 部署ステータス(Directive のステータス色分け)。 */
export type DeptStatus = "done" | "working" | "error" | "waiting_approval";

export const DEPT_STATUSES: readonly DeptStatus[] = ["done", "working", "error", "waiting_approval"];

export const DEPT_STATUS_LABEL_JA: Record<DeptStatus, string> = {
  done: "完了",
  working: "作業中",
  error: "エラー",
  waiting_approval: "承認待ち",
};

/** ステータスカラー(Directive 指定。ランプと枠色を統一)。 */
export const DEPT_STATUS_COLOR: Record<DeptStatus, string> = {
  done: "#22C55E",
  working: "#FACC15",
  error: "#EF4444",
  waiting_approval: "#A855F7",
};

/** Command Center の部署パネル1枚。 */
export interface CommandDepartment {
  id: string;
  name: string;
  memberCount: number;
  status: DeptStatus;
  /** 右側詳細パネル用(作業内容・進捗・ログ)。 */
  tasks: string[];
  progressPercent: number;
  logs: string[];
  /** エラー時の原因と解決策(アシスタント吹き出しにも使う)。 */
  errorCause?: string;
  errorFix?: string;
}

/** 部署間連携(白い発光ラインで結ぶ)。 */
export interface DeptConnection {
  from: string;
  to: string;
}

/** 初期部署(Directive の初期部署例・Mock)。 */
export const COMMAND_DEPARTMENTS: readonly CommandDepartment[] = [
  {
    id: "sales",
    name: "営業部",
    memberCount: 8,
    status: "done",
    tasks: ["新規リストへの架電", "既存顧客フォローコール", "アポイント獲得活動", "顧客情報の更新"],
    progressPercent: 78,
    logs: [
      "14:32 新規リストへ架電開始(鈴木)",
      "14:15 アポ獲得: 株式会社〇〇(田中)",
      "13:48 顧客情報を更新(佐藤)",
      "13:22 コール結果を入力(高橋)",
      "12:58 リストをインポート(鈴木)",
    ],
  },
  {
    id: "support",
    name: "カスタマーサポート部",
    memberCount: 5,
    status: "working",
    tasks: ["問い合わせ対応", "FAQの更新"],
    progressPercent: 55,
    logs: ["14:20 問い合わせ3件に回答", "13:05 FAQを2件追加"],
  },
  {
    id: "marketing",
    name: "マーケティング部",
    memberCount: 4,
    status: "done",
    tasks: ["キャンペーン効果測定", "SNS投稿計画"],
    progressPercent: 90,
    logs: ["13:40 週次レポートを作成", "11:20 投稿計画を更新"],
  },
  {
    id: "development",
    name: "システム開発部",
    memberCount: 6,
    status: "error",
    tasks: ["API連携の実装", "架電リストツールの改善"],
    progressPercent: 42,
    logs: ["14:05 API接続エラーを検知", "13:30 リグレッションテスト実行"],
    errorCause: "外部APIの認証期限切れの可能性があります",
    errorFix: "APIキーを更新し、再接続してください",
  },
  {
    id: "publishing",
    name: "出版部",
    memberCount: 3,
    status: "waiting_approval",
    tasks: ["新刊企画書の最終確認", "原稿レビュー"],
    progressPercent: 68,
    logs: ["13:55 新刊企画書を提出(承認待ち)", "11:10 原稿レビューを完了"],
  },
  {
    id: "planning",
    name: "企画部",
    memberCount: 2,
    status: "working",
    tasks: ["四半期企画の立案", "市場調査"],
    progressPercent: 35,
    logs: ["14:00 市場調査データを収集中"],
  },
  {
    id: "accounting",
    name: "経理部",
    memberCount: 2,
    status: "done",
    tasks: ["月次仕訳の確認", "経費精算"],
    progressPercent: 100,
    logs: ["12:30 月次仕訳を締め"],
  },
  {
    id: "hr",
    name: "人事部",
    memberCount: 2,
    status: "waiting_approval",
    tasks: ["採用計画の承認申請", "評価面談の日程調整"],
    progressPercent: 60,
    logs: ["13:10 採用計画書を提出(承認待ち)"],
  },
  {
    id: "market_research",
    name: "市場調査部",
    memberCount: 5,
    status: "working",
    tasks: [
      "AI最新情報の収集(Mock)",
      "新AIサービスの調査・技術評価",
      "AIサービス組み合わせ研究",
      "開発部・企画部への提案作成",
    ],
    progressPercent: 62,
    logs: [
      "14:10 新AI音声サービス3件を発見",
      "13:45 日本語STTモデルを評価(採用候補)",
      "13:20 開発部へ技術提案を送付",
      "12:40 CEO提案資料を整理(承認待ち)",
    ],
  },
];

/** 部署間連携(D-20260706-007 + D-20260706-009 で市場調査部の連携を追加)。 */
export const DEPT_CONNECTIONS: readonly DeptConnection[] = [
  { from: "sales", to: "support" },
  { from: "support", to: "marketing" },
  { from: "publishing", to: "planning" },
  { from: "planning", to: "accounting" },
  { from: "development", to: "hr" },
  // 市場調査部: 開発部・企画部・出版部と連携(新技術→ツール化/商品化/出版活用)
  { from: "market_research", to: "development" },
  { from: "market_research", to: "planning" },
  { from: "market_research", to: "publishing" },
  { from: "development", to: "planning" },
];

/** 全社サマリー(左サイドバー表示用)。 */
export interface CompanyOverview {
  totalMembers: number;
  activeMembers: number;
  utilizationPercent: number;
}

/** 稼働率: 完了/作業中の部署の人員を「稼働中」とみなす決定的なMock集計。 */
export function summarizeCompany(departments: readonly CommandDepartment[]): CompanyOverview {
  const totalMembers = departments.reduce((sum, d) => sum + d.memberCount, 0);
  const activeMembers = departments
    .filter((d) => d.status === "done" || d.status === "working")
    .reduce((sum, d) => sum + d.memberCount, 0);
  return {
    totalMembers,
    activeMembers,
    utilizationPercent: totalMembers === 0 ? 0 : Math.round((activeMembers / totalMembers) * 100),
  };
}

/** 営業部の実データ(架電・営業リスト・Memoryから合成)。 */
export interface SalesLiveData {
  /** テストコール履歴の件数(実施済みセッション)。 */
  callCount: number;
  /** 営業リストのアポ獲得数。 */
  appointmentCount: number;
  /** 営業リストの成約数。 */
  wonCount: number;
  /** 未架電リード数(0なら営業部は「完了」、あれば「作業中」)。 */
  notCalledCount: number;
  /** Memoryの業務記録 最新ログ(表示用文字列)。 */
  recentLogs: string[];
}

/**
 * 営業部パネル/詳細へ実データを反映した新しい部署配列を返す(イミュータブル)。
 * データが全く無い場合(全て0・ログなし)は元のMock値を維持する。
 */
export function withLiveSalesData(
  departments: readonly CommandDepartment[],
  live: SalesLiveData,
): CommandDepartment[] {
  const hasData =
    live.callCount > 0 ||
    live.appointmentCount > 0 ||
    live.wonCount > 0 ||
    live.notCalledCount > 0 ||
    live.recentLogs.length > 0;
  if (!hasData) {
    return [...departments];
  }
  const totalLeads = live.notCalledCount + live.appointmentCount + live.wonCount;
  return departments.map((d) => {
    if (d.id !== "sales") return d;
    return {
      ...d,
      status: live.notCalledCount > 0 ? "working" : "done",
      logs: live.recentLogs.length > 0 ? live.recentLogs.slice(0, 5) : d.logs,
      progressPercent:
        totalLeads > 0
          ? Math.round(((live.appointmentCount + live.wonCount) / totalLeads) * 100)
          : d.progressPercent,
    };
  });
}

/**
 * アシスタント吹き出しの要約文(Directive 7: 承認待ちの所在・エラーの所在と
 * 原因・解決策・全体の進行状況)。決定的。
 */
export function buildAssistantSummaryJa(departments: readonly CommandDepartment[]): string {
  const lines: string[] = [];
  const waiting = departments.filter((d) => d.status === "waiting_approval");
  if (waiting.length > 0) {
    lines.push(`現在、${waiting.map((d) => d.name).join("と")}で承認待ちがあります。`);
  }
  for (const d of departments.filter((x) => x.status === "error")) {
    lines.push(`${d.name}ではエラーが発生しています。`);
    if (d.errorCause) lines.push(`原因は${d.errorCause}。`);
    if (d.errorFix) lines.push(`${d.errorFix}。`);
  }
  // 市場調査部・出版部クリーン運営の要約(D-20260706-009)
  lines.push(...buildResearchAndPublishingSummaryJa());
  const avg = Math.round(
    departments.reduce((sum, d) => sum + d.progressPercent, 0) / Math.max(departments.length, 1),
  );
  lines.push(`全体の進行状況は約${avg}%です。`);
  return lines.join("\n");
}
