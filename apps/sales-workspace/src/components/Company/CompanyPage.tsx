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
  getEmployeesByUnit,
  initialRosterCallProgress,
  allowedCallModes,
  recommendedCallMode,
} from "@musasabi/ai-company";
import type { AIEmployee } from "@musasabi/ai-company";
import { CALL_MODE_LABEL_JA } from "@musasabi/call-training";
import type { OrganizationUnit } from "@musasabi/ai-company";

// AI Company System 画面(D-20260706-001)。Company Genome・組織図・AI社員名簿を表示し、
// Learning/Test/AutoCall の進捗をAI社員単位で可視化する。データはすべてMock。
// コールトレーニングへの相互遷移(β統合)は onNavigateToCallTraining で行う。

interface CompanyPageProps {
  onNavigateToCallTraining: () => void;
}

// 名簿の初期研修進捗(Mock)。安全ゲート未充足のため autocall は常に含まれない。
const CALL_PROGRESS = new Map(initialRosterCallProgress().map((p) => [p.employeeId, p]));

export function CompanyPage({ onNavigateToCallTraining }: CompanyPageProps) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const employees = selectedUnitId ? getEmployeesByUnit(selectedUnitId) : [...AI_EMPLOYEES];

  return (
    <section aria-label="AIカンパニー">
      <h2>AIカンパニー</h2>

      <div style={{ border: "1px solid #ddd", padding: "0.75rem", maxWidth: "48rem", marginBottom: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Company Genome v{COMPANY_GENOME.version}</h3>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Mission:</strong> {COMPANY_GENOME.mission}
        </p>
        <p style={{ margin: "0.25rem 0" }}>
          <strong>Values:</strong>{" "}
          {COMPANY_GENOME.values.map((v) => COMPANY_VALUE_LABEL_JA[v]).join(" / ")}
        </p>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ minWidth: "18rem" }}>
          <h3>組織図</h3>
          <button type="button" onClick={() => setSelectedUnitId(null)} disabled={selectedUnitId === null}>
            全社員を表示
          </button>
          <OrgTree unitId={COMPANY_ID} depth={0} selectedUnitId={selectedUnitId} onSelect={setSelectedUnitId} />
        </div>

        <div style={{ flex: 1, minWidth: "24rem" }}>
          <h3>
            AI社員名簿
            {selectedUnitId ? `(${getUnit(selectedUnitId)?.name ?? selectedUnitId})` : "(全社)"}
          </h3>
          {employees.length === 0 ? (
            <p style={{ color: "#555" }}>この組織単位に所属するAI社員はいません。</p>
          ) : (
            <table style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ID", "名前", "役割", "役職", "状態", "KPI", "利用可能コールモード"].map((h) => (
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
          <p style={{ color: "#555", fontSize: "0.85rem" }}>
            オートコールは全安全ゲート充足まで有効化されません(現フェーズは全AI社員で無効)。
          </p>
          <button type="button" onClick={onNavigateToCallTraining}>
            コールトレーニングへ移動
          </button>
        </div>
      </div>
    </section>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid #ddd",
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
        {Object.entries(employee.kpi)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")}
      </td>
      <td style={cellStyle}>
        {modes
          .map((m) => (m === recommended ? `${CALL_MODE_LABEL_JA[m]}(推奨)` : CALL_MODE_LABEL_JA[m]))
          .join(" / ")}
      </td>
    </tr>
  );
}

interface OrgTreeProps {
  unitId: string;
  depth: number;
  selectedUnitId: string | null;
  onSelect: (id: string) => void;
}

function OrgTree({ unitId, depth, selectedUnitId, onSelect }: OrgTreeProps) {
  const unit = getUnit(unitId, ORGANIZATION_UNITS);
  if (!unit) {
    return null;
  }
  const children = getChildren(unitId, ORGANIZATION_UNITS);
  return (
    <ul style={{ listStyle: "none", paddingLeft: depth === 0 ? 0 : "1rem", margin: "0.25rem 0" }}>
      <li>
        <button
          type="button"
          onClick={() => onSelect(unit.id)}
          disabled={selectedUnitId === unit.id}
          style={{ fontWeight: unit.level === "headquarters" ? "bold" : "normal" }}
        >
          {unit.name}
        </button>
        {children.map((child: OrganizationUnit) => (
          <OrgTree
            key={child.id}
            unitId={child.id}
            depth={depth + 1}
            selectedUnitId={selectedUnitId}
            onSelect={onSelect}
          />
        ))}
      </li>
    </ul>
  );
}
