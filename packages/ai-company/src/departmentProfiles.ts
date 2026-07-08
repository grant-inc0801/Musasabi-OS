// 部門プロファイル(Directive D-20260708-001 §4)。
// 各部門に「目的・担当AI社員・稼働状態・進行中/完了/保留タスク・次の推奨アクション・
// 関連ドキュメント・保管庫連携状態」という統一概念を与える。β版はすべて Mock(決定論)。
// 実データ連携・保管庫の実保存は行わない。

/** 部門の稼働状態(Command Center と同じ4区分)。 */
export type DeptProfileStatus = "done" | "working" | "error" | "waiting_approval";

export const DEPT_PROFILE_STATUS_LABEL_JA: Record<DeptProfileStatus, string> = {
  done: "完了",
  working: "稼働中",
  error: "要対応",
  waiting_approval: "承認待ち",
};

export const DEPT_PROFILE_STATUS_COLOR: Record<DeptProfileStatus, string> = {
  done: "#22C55E",
  working: "#FACC15",
  error: "#EF4444",
  waiting_approval: "#A855F7",
};

/** 保管庫連携状態。 */
export type VaultLinkStatus = "連携済" | "連携準備中" | "未連携";

export const VAULT_LINK_STATUS_COLOR: Record<VaultLinkStatus, string> = {
  連携済: "#22C55E",
  連携準備中: "#FACC15",
  未連携: "#6b7280",
};

/** 1部門のプロファイル(§4 の概念一式)。 */
export interface DepartmentProfile {
  id: string;
  /** 部門名。 */
  name: string;
  /** 部門アイコン(絵文字)。 */
  icon: string;
  /** 目的。 */
  purpose: string;
  /** 担当AI社員。 */
  staff: readonly string[];
  /** 現在の稼働状態。 */
  status: DeptProfileStatus;
  /** 進行中タスク。 */
  inProgressTasks: readonly string[];
  /** 完了タスク。 */
  doneTasks: readonly string[];
  /** 保留タスク。 */
  pendingTasks: readonly string[];
  /** 次の推奨アクション。 */
  nextActions: readonly string[];
  /** 関連ドキュメント。 */
  relatedDocs: readonly string[];
  /** 保管庫連携状態。 */
  vaultLink: VaultLinkStatus;
}

/** 9部門のプロファイルMock(§4 初期部門例に対応)。 */
export const DEPARTMENT_PROFILES: readonly DepartmentProfile[] = [
  {
    id: "management",
    name: "経営部門",
    icon: "🏛️",
    purpose: "全社の方針決定・承認・部門横断の意思統一を担う。",
    staff: ["AI CEO", "AI経営企画担当"],
    status: "waiting_approval",
    inProgressTasks: ["各部門の承認待ち案件レビュー", "月次経営サマリー作成"],
    doneTasks: ["今週の全社方針確定"],
    pendingTasks: ["出版部の高リスク案件の最終承認"],
    nextActions: ["承認キューの承認待ち案件を処理する", "全社レポートを確認する"],
    relatedDocs: ["全社ダッシュボード", "オペレーション"],
    vaultLink: "連携済",
  },
  {
    id: "planning",
    name: "企画部門",
    icon: "📝",
    purpose: "新規サービス・営業資料・出版企画の立案と部門間連携を担う。",
    staff: ["AIプランナー", "AI資料作成担当"],
    status: "working",
    inProgressTasks: ["営業部向け導入事例資料の企画", "出版部の新作企画レビュー"],
    doneTasks: ["市場調査部の新サービス提案を企画へ反映"],
    pendingTasks: ["料金比較表の構成案確定"],
    nextActions: ["営業資料の構成案を営業部へ共有する", "企画資料を保管庫へ保存する"],
    relatedDocs: ["市場調査部", "保管庫"],
    vaultLink: "連携済",
  },
  {
    id: "development",
    name: "開発部門",
    icon: "💻",
    purpose: "Musasabi OS 本体・自動化ツール・架電リスト制作の開発を担う。",
    staff: ["AIエンジニア", "AIビルド管理担当", "AI架電リスト制作担当"],
    status: "working",
    inProgressTasks: ["β版UIの改善", "架電リスト抽出ツールの調整"],
    doneTasks: ["部門ダッシュボードの実装", "Beta Build の安定化"],
    pendingTasks: ["Tauri本格統合(後続フェーズ)"],
    nextActions: ["テストを追加してCIを維持する", "エラー案件を優先対応する"],
    relatedDocs: ["開発部", "架電リスト制作課"],
    vaultLink: "連携済",
  },
  {
    id: "sales",
    name: "営業部門",
    icon: "📞",
    purpose: "架電・アポ獲得・トークスクリプト改善で収益化を牽引する。",
    staff: ["営業リーダーAI", "AIセールス担当", "AIコールコーチ"],
    status: "working",
    inProgressTasks: ["本日20件の架電", "改善対象トークの練習"],
    doneTasks: ["本日アポ2件獲得", "営業リストの更新"],
    pendingTasks: ["料金比較表のレビュー待ち"],
    nextActions: ["未架電リスト上位20件へ架電する", "獲得アポの商談資料を企画部へ依頼する"],
    relatedDocs: ["営業部 — KPI", "営業リスト"],
    vaultLink: "連携済",
  },
  {
    id: "publishing",
    name: "出版部門",
    icon: "📚",
    purpose: "作品の企画〜校正〜Kindle/note販売準備を半自動で商品化する。",
    staff: ["敏腕編集長AI", "AI校正担当", "AI類似性チェッカー", "AI販売戦略担当"],
    status: "waiting_approval",
    inProgressTasks: ["6作品のパイプライン進行", "敏腕編集長AIの指摘反映"],
    doneTasks: ["感情を持ったAIの一日 のKindle準備"],
    pendingTasks: ["類似作品チェックの承認待ち", "出版可否判定"],
    nextActions: ["校正待ち作品を確認する", "編集長指摘を各担当が反映する"],
    relatedDocs: ["出版部", "保管庫"],
    vaultLink: "連携済",
  },
  {
    id: "back_office",
    name: "管理部門",
    icon: "🧮",
    purpose: "経理・人事・マーケティングなど全社の運用資料を管理する。",
    staff: ["AI経理担当", "AI人事担当", "AIマーケティング担当"],
    status: "working",
    inProgressTasks: ["月次仕訳の整理", "採用要件の整備"],
    doneTasks: ["収支レポートのExcel出力"],
    pendingTasks: ["広告出稿計画の承認待ち"],
    nextActions: ["運用資料を保管庫へ保存する", "月次収支を経営部門へ共有する"],
    relatedDocs: ["経理部", "人事部", "マーケティング部"],
    vaultLink: "連携準備中",
  },
  {
    id: "market_research",
    name: "市場調査部門",
    icon: "🔬",
    purpose: "新しいAIサービス・技術トレンドを調査し組み合わせを提案する。",
    staff: ["AIリサーチャー", "AIアナリスト", "AIアーキテクト"],
    status: "working",
    inProgressTasks: ["新サービスの技術評価", "組み合わせ候補の検討"],
    doneTasks: ["新AIサービスの発見と一覧化"],
    pendingTasks: ["開発部への申し送り確定"],
    nextActions: ["有望な組み合わせを開発部へ申し送る", "調査結果を企画部へ共有する"],
    relatedDocs: ["市場調査部"],
    vaultLink: "連携済",
  },
  {
    id: "support",
    name: "カスタマーサポート部門",
    icon: "🎧",
    purpose: "問い合わせ対応・FAQ整備・導入支援を担う。",
    staff: ["AIサポート担当", "AIナレッジ担当"],
    status: "working",
    inProgressTasks: ["未対応チケットの一次回答", "FAQの拡充"],
    doneTasks: ["導入手順ドキュメントの整備"],
    pendingTasks: ["エスカレーション案件の確認"],
    nextActions: ["未対応チケットを優先度順に処理する", "頻出質問をFAQへ追加する"],
    relatedDocs: ["サポート部"],
    vaultLink: "連携準備中",
  },
  {
    id: "vault",
    name: "保管庫管理部門",
    icon: "🗄️",
    purpose: "各部門の成果物を保管し、容量・連携状態を管理する(Mock)。",
    staff: ["AI保管庫管理担当"],
    status: "working",
    inProgressTasks: ["各部門成果物の受け入れ整理", "容量モニタリング"],
    doneTasks: ["企画資料・営業資料・原稿の受け入れ"],
    pendingTasks: ["実クラウド連携(後続フェーズ)"],
    nextActions: ["容量が逼迫した場合は経営部門へ通知する", "各部門の連携状態を維持する"],
    relatedDocs: ["保管庫"],
    vaultLink: "連携済",
  },
];

/** ID から部門プロファイルを取得する。 */
export function getDepartmentProfile(
  id: string,
  profiles: readonly DepartmentProfile[] = DEPARTMENT_PROFILES,
): DepartmentProfile | undefined {
  return profiles.find((p) => p.id === id);
}

export interface DepartmentDashboardStats {
  totalDepartments: number;
  workingCount: number;
  waitingApprovalCount: number;
  errorCount: number;
  vaultLinkedCount: number;
  totalInProgressTasks: number;
  totalPendingTasks: number;
}

/** 部門プロファイル群を集計する(決定的)。 */
export function buildDepartmentDashboardStats(
  profiles: readonly DepartmentProfile[] = DEPARTMENT_PROFILES,
): DepartmentDashboardStats {
  return {
    totalDepartments: profiles.length,
    workingCount: profiles.filter((p) => p.status === "working").length,
    waitingApprovalCount: profiles.filter((p) => p.status === "waiting_approval").length,
    errorCount: profiles.filter((p) => p.status === "error").length,
    vaultLinkedCount: profiles.filter((p) => p.vaultLink === "連携済").length,
    totalInProgressTasks: profiles.reduce((sum, p) => sum + p.inProgressTasks.length, 0),
    totalPendingTasks: profiles.reduce((sum, p) => sum + p.pendingTasks.length, 0),
  };
}
