import { APPROVAL_CHAIN, RANK_AUTHORITY_LEVEL, type EmployeeRank } from "./types";

// 承認フロー(Organization Bible 第5章 / Development Bible 第25章)。
// 社員 → 主任 → 課長 → 部長 → 本部長 → CEO の順。決定論的な純粋関数として実装する
// (Development Bible: 決定論的挙動を優先)。ここでは承認の「順序」のみを扱い、実際の
// 承認アクションの実行・永続化は次フェーズ。

/** 役職ランクに対応する権限レベルを返す。 */
export function resolveAuthorityLevel(rank: EmployeeRank): number {
  return RANK_AUTHORITY_LEVEL[rank];
}

/**
 * 承認チェーン上で、指定ランクの「次の承認者」ランクを返す。
 * チェーンの最上位(CEO)や、チェーンに含まれないランク(executive)は null。
 */
export function nextApprover(rank: EmployeeRank): EmployeeRank | null {
  const index = APPROVAL_CHAIN.indexOf(rank);
  if (index === -1 || index === APPROVAL_CHAIN.length - 1) {
    return null;
  }
  return APPROVAL_CHAIN[index + 1];
}

/**
 * `approver` が `requester` の申請を承認できるかを判定する。
 * 承認チェーン上で承認者が申請者より上位にいる場合のみ true。
 * どちらかがチェーンに含まれないランク(executive)の場合は false。
 */
export function canApprove(approver: EmployeeRank, requester: EmployeeRank): boolean {
  const approverIndex = APPROVAL_CHAIN.indexOf(approver);
  const requesterIndex = APPROVAL_CHAIN.indexOf(requester);
  if (approverIndex === -1 || requesterIndex === -1) {
    return false;
  }
  return approverIndex > requesterIndex;
}

/**
 * 指定ランクの申請が最終承認(CEO)に至るまでに通る承認者ランクの列を返す。
 * 例: staff → [supervisor, section_chief, department_manager, headquarters_manager, ceo]。
 * チェーンに含まれないランクは空配列。
 */
export function approvalPath(rank: EmployeeRank): EmployeeRank[] {
  const index = APPROVAL_CHAIN.indexOf(rank);
  if (index === -1) {
    return [];
  }
  return APPROVAL_CHAIN.slice(index + 1);
}
