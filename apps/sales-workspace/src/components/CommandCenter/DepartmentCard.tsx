import { forwardRef } from "react";
import { DEPT_STATUS_COLOR, DEPT_STATUS_LABEL_JA } from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";

// 部署パネル(D-20260706-007)。表示は部署名・社員数・ステータスのみ。
// ステータス色でランプと枠を統一し、glow(box-shadow)で発光させる。

export const DepartmentCard = forwardRef<
  HTMLButtonElement,
  { dept: CommandDepartment; selected: boolean; onSelect: (id: string) => void }
>(function DepartmentCard({ dept, selected, onSelect }, ref) {
  const color = DEPT_STATUS_COLOR[dept.status];
  return (
    <button
      ref={ref}
      type="button"
      className={`dept-card${selected ? " selected" : ""}`}
      style={{ ["--glow" as string]: color }}
      onClick={() => onSelect(dept.id)}
      aria-pressed={selected}
    >
      <div className="dept-card-name">{dept.name}</div>
      <div className="dept-card-members">{dept.memberCount}人</div>
      <div className="dept-card-status">
        <span className="dept-lamp" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        {DEPT_STATUS_LABEL_JA[dept.status]}
      </div>
    </button>
  );
});
