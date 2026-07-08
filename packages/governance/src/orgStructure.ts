// AI組織構造(docs/ai-handoff/AI_ORGANIZATION_STRUCTURE.md)。
// 既存の組織モデル(@musasabi/ai-company の 会社→本部→部門→部署)を「置換せず拡張」する形で、
// AI経営陣(役員層)と 8本部/部門 の対応、指揮系統、独立AI監査を表現する。決定論・Mock。

import type { ExecutiveRole } from "./index";
import { EXECUTIVE_ROLE_LABEL_JA, EXECUTIVE_ROLES } from "./index";

/** 役員が管掌する本部/領域(既存 ai-company の 8本部名に整合)。 */
export interface ExecutiveScope {
  /** 主に管掌する本部・領域名(表示用)。 */
  headquarters: string;
  /** 担当領域の要約。 */
  focus: string;
}

export const EXECUTIVE_SCOPE: Record<ExecutiveRole, ExecutiveScope> = {
  ceo: { headquarters: "全社(経営)", focus: "戦略・最終優先順位・全社KPI・Company Brain方針" },
  coo: { headquarters: "AI管理本部(オペレーション)", focus: "オペレーション・部門調整・生産性" },
  cto: { headquarters: "AI開発本部", focus: "エンジニアリング・システム品質・AI基盤・技術ロードマップ" },
  cfo: { headquarters: "AI管理本部(財務)", focus: "月次予算・コスト・ROI・収益性" },
  cmo: { headquarters: "AI営業本部 / AIマーケティング本部", focus: "営業・マーケ・売上・成長KPI" },
  cpo: { headquarters: "AI企画本部", focus: "企画・製品戦略・サービス改善・新製品" },
  chro: { headquarters: "AI管理本部(人事)", focus: "AI社員配置・評価・育成・組織設計" },
  pm: { headquarters: "横断(PMO)", focus: "ワークフロー・スプリント・Issue・Claude Code/Codex実行管理" },
};

/** 組織図ノードの種別。 */
export type OrgNodeKind = "ceo" | "executive" | "headquarters" | "audit";

/** 組織図ノード(親IDでツリーを構成)。 */
export interface OrgNode {
  id: string;
  label: string;
  kind: OrgNodeKind;
  parentId: string | null;
  /** 役員ノードのとき対応ロール。 */
  role?: ExecutiveRole;
  /** 指揮系統上の独立性(監査は経営層から独立)。 */
  independent?: boolean;
}

/**
 * 組織図を構築する(決定論)。CEO を頂点に、役員層 → 各役員の管掌本部を配置。
 * AI監査は経営層から独立したノードとして会社直下に置く。
 */
export function buildOrgChart(): OrgNode[] {
  const nodes: OrgNode[] = [];
  // CEO(頂点)
  nodes.push({ id: "ceo", label: EXECUTIVE_ROLE_LABEL_JA.ceo, kind: "ceo", parentId: null, role: "ceo" });
  // 役員層(CEO 以外)+ 各役員の管掌本部
  for (const role of EXECUTIVE_ROLES) {
    if (role === "ceo") continue;
    const execId = `exec-${role}`;
    nodes.push({ id: execId, label: EXECUTIVE_ROLE_LABEL_JA[role], kind: "executive", parentId: "ceo", role });
    nodes.push({
      id: `hq-${role}`,
      label: EXECUTIVE_SCOPE[role].headquarters,
      kind: "headquarters",
      parentId: execId,
    });
  }
  // 独立AI監査(経営層から独立・会社直下)
  nodes.push({ id: "audit", label: "AI監査(独立)", kind: "audit", parentId: null, independent: true });
  return nodes;
}

/**
 * 指揮系統ビュー: CEO → 役員 → 管掌本部 のチェーン一覧(決定論)。
 * 監査は独立のため別立てで返す。
 */
export interface CommandChain {
  chains: string[][];
  /** 独立ラインの説明。 */
  independentLine: string;
}

export function buildCommandChain(): CommandChain {
  const chains: string[][] = [];
  for (const role of EXECUTIVE_ROLES) {
    if (role === "ceo") continue;
    chains.push([
      EXECUTIVE_ROLE_LABEL_JA.ceo,
      EXECUTIVE_ROLE_LABEL_JA[role],
      EXECUTIVE_SCOPE[role].headquarters,
    ]);
  }
  return {
    chains,
    independentLine: "AI監査は経営層の指揮系統から独立し、リスク警告・レビュー要求・高リスク操作の一時停止提案(承認前提)を行う。",
  };
}

/** 必要ダッシュボード(org structure doc の一覧・表示用)。 */
export const REQUIRED_DASHBOARDS: readonly string[] = [
  "AI組織図",
  "指揮系統ビュー",
  "役員KPIダッシュボード",
  "月次予算ダッシュボード",
  "予測・リスクダッシュボード",
  "AI監査ダッシュボード",
  "AI社員パフォーマンスダッシュボード",
  "日次・週次・月次レポート",
];
