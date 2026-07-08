import { forwardRef } from "react";
import { DEPT_STATUS_COLOR, DEPT_STATUS_LABEL_JA, deptIcon } from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";

// 部署パネル(D-20260706-007 + ユーザーFB第6弾)。部署ごとの丸アイコン+部署名・
// 社員数・ステータス。ステータス色でランプ・枠・流れる光を統一する。

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
      {/* 流れる光の枠(メタル調・ユーザーFB第6弾) */}
      <span className="dept-card-sheen" aria-hidden="true" />
      {/* アイコンは部署名の左に配置し、パネルが縦に伸びないようにする(第7弾) */}
      <div className="dept-card-head">
        <span className="dept-card-icon" aria-hidden="true">
          {deptIcon(dept.id)}
        </span>
        <div className="dept-card-name">{dept.name}</div>
      </div>
      <div className="dept-card-members">{dept.memberCount}人</div>
      <div className="dept-card-status">
        <span className="dept-lamp" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        {DEPT_STATUS_LABEL_JA[dept.status]}
      </div>
    </button>
  );
});
