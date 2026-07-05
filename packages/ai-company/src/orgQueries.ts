import { ORGANIZATION_UNITS } from "./organization";
import type { OrganizationUnit } from "./types";

// 組織ツリーの探索(Organization Bible 第1・6章)。決定論的な純粋関数。
// 既定では ORGANIZATION_UNITS マスタを対象にするが、任意の単位配列も渡せる
// (将来の永続化ストア差し替えに備える)。

/** IDから組織単位を1件取得する。存在しなければ null。 */
export function getUnit(
  id: string,
  units: readonly OrganizationUnit[] = ORGANIZATION_UNITS,
): OrganizationUnit | null {
  return units.find((unit) => unit.id === id) ?? null;
}

/** 指定単位の直下の子単位を返す。 */
export function getChildren(
  id: string,
  units: readonly OrganizationUnit[] = ORGANIZATION_UNITS,
): OrganizationUnit[] {
  return units.filter((unit) => unit.parentId === id);
}

/**
 * 指定単位から会社(ルート)までの祖先を、近い順(親→…→会社)で返す。
 * 自分自身は含めない。循環データに対しても無限ループしないよう訪問済みIDを追跡する。
 */
export function getAncestors(
  id: string,
  units: readonly OrganizationUnit[] = ORGANIZATION_UNITS,
): OrganizationUnit[] {
  const ancestors: OrganizationUnit[] = [];
  const visited = new Set<string>([id]);
  let current = getUnit(id, units);
  while (current && current.parentId !== null) {
    if (visited.has(current.parentId)) {
      break; // 循環参照を検出したら打ち切る
    }
    const parent = getUnit(current.parentId, units);
    if (!parent) {
      break;
    }
    ancestors.push(parent);
    visited.add(parent.id);
    current = parent;
  }
  return ancestors;
}

/**
 * 指定単位が属する本部(headquarters レベルの祖先)を返す。本部自身を渡した場合は
 * それ自身、会社を渡した場合は null。
 */
export function getHeadquarters(
  id: string,
  units: readonly OrganizationUnit[] = ORGANIZATION_UNITS,
): OrganizationUnit | null {
  const unit = getUnit(id, units);
  if (!unit) {
    return null;
  }
  if (unit.level === "headquarters") {
    return unit;
  }
  return getAncestors(id, units).find((ancestor) => ancestor.level === "headquarters") ?? null;
}
