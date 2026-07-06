import { useState } from "react";
import {
  AI_EMPLOYEES,
  COMPANY_GENOME,
  COMPANY_VALUE_LABEL_JA,
  EMPLOYEE_STATE_LABEL_JA,
  RANK_LABEL_JA,
  ORGANIZATION_UNITS,
  COMPANY_ID,
  getChildren,
  getUnit,
  getAncestors,
  getEmployeesByUnit,
  initialRosterCallProgress,
  allowedCallModes,
  recommendedCallMode,
} from "@musasabi/ai-company";
import type { AIEmployee, OrganizationUnit } from "@musasabi/ai-company";
import { CALL_MODE_LABEL_JA } from "@musasabi/call-training";

// AI社員管理(全社ビュー)。組織図(接続線つきツリー・所属人数バッジ・クリックで絞り込み)
// とAI社員名簿を1画面にまとめる(ユーザーFB: 全体にまとめて組織図もわかりやすく)。
// データはすべてMock。コールトレーニングへは onNavigateToCallTraining で遷移する。

interface CompanyPageProps {
  onNavigateToCallTraining: () => void;
}

// 名簿の初期研修進捗(Mock)。安全ゲート未充足のため autocall は常に含まれない。
const CALL_PROGRESS = new Map(initialRosterCallProgress().map((p) => [p.employeeId, p]));

/** 配下(自身含む)に所属するAI社員数。 */
function employeeCountUnder(unitId: string): number {
  return AI_EMPLOYEES.filter(
    (e) => e.unitId === unitId || getAncestors(e.unitId).some((a) => a.id === unitId),
  ).length;
}

/** 配下にAI社員がいる組織単位だけを表示対象にする(空の部門で図が埋まらないように)。 */
function hasEmployeesUnder(unitId: string): boolean {
  return employeeCountUnder(unitId) > 0;
}

export function CompanyPage({ onNavigateToCallTraining }: CompanyPageProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const employees = selectedUnitId
    ? AI_EMPLOYEES.filter(
        (e) =>
          e.unitId === selectedUnitId ||
          getAncestors(e.unitId).some((a) => a.id === selectedUnitId),
      )
    : [...AI_EMPLOYEES];
  const selectedUnit = selectedUnitId ? getUnit(selectedUnitId) : null;

  return (
    <>
      <section aria-label="組織図">
        <h3 style={{ marginTop: 0 }}>組織図(クリックで名簿を絞り込み)</h3>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "baseline" }}>
          <button
            type="button"
            onClick={() => setSelectedUnitId(null)}
            disabled={selectedUnitId === null}
          >
            全社員を表示
          </button>
          {selectedUnit && (
            <span style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>
              選択中: {selectedUnit.name}
            </span>
          )}
        </div>
        <ul className="org-tree">
          <OrgNode unitId={COMPANY_ID} selectedUnitId={selectedUnitId} onSelect={setSelectedUnitId} />
        </ul>
        <p style={{ color: "#9aa3ba", fontSize: "0.8rem" }}>
          AI社員が所属する組織のみ表示しています(組織全体の定義は docs/ORGANIZATION_BIBLE.md)。
        </p>
      </section>

      <section aria-label="AI社員名簿">
        <h3 style={{ marginTop: 0 }}>
          AI社員名簿{selectedUnit ? `(${selectedUnit.name}: ${employees.length}名)` : `(全社: ${employees.length}名)`}
        </h3>
        {employees.length === 0 ? (
          <p style={{ color: "#9aa3ba" }}>この組織単位に所属するAI社員はいません。</p>
        ) : (
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["ID", "名前", "役割", "役職", "状態", "利用可能コールモード"].map((h) => (
                  <th key={h} style={cellStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <EmployeeRow key={e.id} employee={e} />
              ))}
            </tbody>
          </table>
        )}
        <p style={{ color: "#9aa3ba", fontSize: "0.85rem" }}>
          オートコールは全安全ゲート充足まで有効化されません(現フェーズは全AI社員で無効)。
        </p>
        <button type="button" onClick={onNavigateToCallTraining}>
          コールトレーニングへ移動
        </button>
      </section>

      <section aria-label="Company Genome">
        <h3 style={{ marginTop: 0 }}>Company Genome v{COMPANY_GENOME.version}</h3>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Mission:</strong> {COMPANY_GENOME.mission}
        </p>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Values:</strong>{" "}
          {COMPANY_GENOME.values.map((v) => COMPANY_VALUE_LABEL_JA[v]).join(" / ")}
        </p>
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid rgba(151,168,205,0.16)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};

function EmployeeRow({ employee }: { employee: AIEmployee }) {
  const progress = CALL_PROGRESS.get(employee.id);
  const modes = progress ? allowedCallModes(progress) : [];
  const recommended = progress ? recommendedCallMode(progress) : null;
  return (
    <tr>
      <td style={cellStyle}>{employee.id}</td>
      <td style={cellStyle}>{employee.name}</td>
      <td style={cellStyle}>{employee.role}</td>
      <td style={cellStyle}>{RANK_LABEL_JA[employee.rank]}</td>
      <td style={cellStyle}>{EMPLOYEE_STATE_LABEL_JA[employee.state]}</td>
      <td style={cellStyle}>
        {modes
          .map((m) => (m === recommended ? `${CALL_MODE_LABEL_JA[m]}(推奨)` : CALL_MODE_LABEL_JA[m]))
          .join(" / ")}
      </td>
    </tr>
  );
}

interface OrgNodeProps {
  unitId: string;
  selectedUnitId: string | null;
  onSelect: (id: string) => void;
}

/** 接続線つき組織図ノード。所属人数(配下含む)をバッジ表示する。 */
function OrgNode({ unitId, selectedUnitId, onSelect }: OrgNodeProps) {
  const unit = getUnit(unitId, ORGANIZATION_UNITS);
  if (!unit) {
    return null;
  }
  const children = getChildren(unitId, ORGANIZATION_UNITS).filter(
    (child: OrganizationUnit) => hasEmployeesUnder(child.id),
  );
  const count = employeeCountUnder(unitId);
  return (
    <li>
      <button
        type="button"
        className={`org-node${selectedUnitId === unit.id ? " active" : ""}`}
        onClick={() => onSelect(unit.id)}
        disabled={selectedUnitId === unit.id}
      >
        <span>{unit.name}</span>
        <span className="count">{count}名</span>
      </button>
      {children.length > 0 && (
        <ul>
          {children.map((child: OrganizationUnit) => (
            <OrgNode
              key={child.id}
              unitId={child.id}
              selectedUnitId={selectedUnitId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
