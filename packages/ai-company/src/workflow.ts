import { deptIcon } from "./commandCenter";

// D-012 AI Company Workflow: 部署をまたぐ業務フロー(ワークフロー)をモデル化する。
// 既存の連携ライン(市場調査部→開発部→企画部→保管庫→営業部/出版部)や各部署の
// 業務を、進行状態つきのステップ列として可視化する。すべてMock(実実行なし)。

export type WorkflowStepStatus = "完了" | "進行中" | "待機" | "承認待ち";

export const WORKFLOW_STEP_STATUSES: readonly WorkflowStepStatus[] = [
  "完了",
  "進行中",
  "待機",
  "承認待ち",
];

/** ステップ状態の色(Command Center のステータス色と同系統)。 */
export const WORKFLOW_STATUS_COLOR: Record<WorkflowStepStatus, string> = {
  完了: "#22C55E",
  進行中: "#FACC15",
  待機: "#6b7280",
  承認待ち: "#A855F7",
};

/** ワークフローの1ステップ(担当部署+作業+状態)。 */
export interface WorkflowStep {
  deptId: string;
  deptName: string;
  action: string;
  status: WorkflowStepStatus;
}

/** 部署横断ワークフロー。 */
export interface CompanyWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export const COMPANY_WORKFLOWS: readonly CompanyWorkflow[] = [
  {
    id: "productize",
    name: "新サービス商品化フロー",
    description: "市場調査で見つけた新技術を、社内ツール化・資料化して各部署へ展開する。",
    steps: [
      { deptId: "market_research", deptName: "市場調査部", action: "新サービス調査・技術評価", status: "完了" },
      { deptId: "development", deptName: "システム開発部", action: "社内ツール化(実装)", status: "進行中" },
      { deptId: "planning", deptName: "企画部", action: "マニュアル・提案資料作成", status: "待機" },
      { deptId: "planning", deptName: "企画部", action: "保管庫へ保存", status: "待機" },
      { deptId: "sales", deptName: "営業部", action: "営業展開", status: "待機" },
    ],
  },
  {
    id: "call_campaign",
    name: "架電キャンペーンフロー",
    description: "架電リスト制作課の抽出から、営業リスト取込・テストコール・成果計上まで。",
    steps: [
      { deptId: "development", deptName: "架電リスト制作課", action: "飲食店リスト抽出(Excel)", status: "完了" },
      { deptId: "sales", deptName: "営業部", action: "営業リストへ取り込み", status: "完了" },
      { deptId: "sales", deptName: "営業部", action: "テストコール(Mock)", status: "進行中" },
      { deptId: "sales", deptName: "営業部", action: "アポ・成約の記録", status: "進行中" },
      { deptId: "accounting", deptName: "経理部", action: "売上計上", status: "待機" },
    ],
  },
  {
    id: "publish",
    name: "出版フロー",
    description: "企画から執筆・校正・クリーン運営チェックを経て、承認後に販売する。",
    steps: [
      { deptId: "planning", deptName: "企画部", action: "作品企画", status: "完了" },
      { deptId: "publishing", deptName: "出版部", action: "執筆・校正", status: "完了" },
      { deptId: "publishing", deptName: "出版部", action: "クリーン運営/規約チェック", status: "進行中" },
      { deptId: "publishing", deptName: "出版部", action: "出版可否の承認", status: "承認待ち" },
      { deptId: "publishing", deptName: "出版部", action: "販売開始(承認後)", status: "待機" },
    ],
  },
  {
    id: "support",
    name: "問い合わせ対応フロー",
    description: "受付から一次対応・エスカレーション・回答・FAQ反映まで。",
    steps: [
      { deptId: "support", deptName: "カスタマーサポート部", action: "問い合わせ受付", status: "完了" },
      { deptId: "support", deptName: "カスタマーサポート部", action: "一次対応", status: "進行中" },
      { deptId: "development", deptName: "システム開発部", action: "技術エスカレーション", status: "待機" },
      { deptId: "support", deptName: "カスタマーサポート部", action: "回答・クローズ", status: "待機" },
      { deptId: "support", deptName: "カスタマーサポート部", action: "FAQへ反映", status: "待機" },
    ],
  },
];

/** ワークフローの進捗率(完了ステップ数 / 全ステップ数)。 */
export function workflowProgress(wf: CompanyWorkflow): number {
  if (wf.steps.length === 0) return 0;
  const done = wf.steps.filter((s) => s.status === "完了").length;
  return Math.round((done / wf.steps.length) * 100);
}

/** ワークフローの現在ステップ(最初の未完了。全完了なら null)。 */
export function currentStep(wf: CompanyWorkflow): WorkflowStep | null {
  return wf.steps.find((s) => s.status !== "完了") ?? null;
}

export interface WorkflowSummary {
  total: number;
  running: number;
  waitingApproval: number;
  averageProgressPercent: number;
}

/** 全ワークフローのサマリー。 */
export function buildWorkflowSummary(
  workflows: readonly CompanyWorkflow[] = COMPANY_WORKFLOWS,
): WorkflowSummary {
  if (workflows.length === 0) {
    return { total: 0, running: 0, waitingApproval: 0, averageProgressPercent: 0 };
  }
  const running = workflows.filter((w) => w.steps.some((s) => s.status === "進行中")).length;
  const waitingApproval = workflows.filter((w) =>
    w.steps.some((s) => s.status === "承認待ち"),
  ).length;
  const avg =
    workflows.reduce((sum, w) => sum + workflowProgress(w), 0) / workflows.length;
  return {
    total: workflows.length,
    running,
    waitingApproval,
    averageProgressPercent: Math.round(avg),
  };
}

/** ステップの部署アイコン(表示補助)。 */
export function workflowStepIcon(step: WorkflowStep): string {
  return deptIcon(step.deptId);
}
