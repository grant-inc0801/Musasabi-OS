import { forwardRef, useEffect, useState } from "react";
import { DEPT_STATUS_COLOR, DEPT_STATUS_LABEL_JA, deptIcon } from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";

// 部署パネル 円柱型進捗メーター(部署パネルUI仕様書)。
// 円柱(メタリック調)を進捗に応じて下から上へ充填し、ステータス色で連動する。
// 上部: アイコン・部署名・ステータス / 下部: パーセンテージ。クリックで詳細へ、
// ホバーで軽い拡大(scale 1.05)。色覚多様性に配慮しアイコンとラベルでも状態を示す。

export const DepartmentCylinder = forwardRef<
  HTMLButtonElement,
  { dept: CommandDepartment; selected: boolean; onSelect: (id: string) => void }
>(function DepartmentCylinder({ dept, selected, onSelect }, ref) {
  const color = DEPT_STATUS_COLOR[dept.status];
  const target = Math.max(0, Math.min(100, dept.progressPercent));

  // マウント後に 0 → target へアニメーション(下から上に上昇)。
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFill(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <button
      ref={ref}
      type="button"
      className={`dept-cyl${selected ? " selected" : ""}`}
      style={{ ["--glow" as string]: color }}
      onClick={() => onSelect(dept.id)}
      aria-pressed={selected}
      aria-label={`${dept.name} ${DEPT_STATUS_LABEL_JA[dept.status]} ${target}%`}
      title={`${dept.name}(${DEPT_STATUS_LABEL_JA[dept.status]})`}
    >
      <div className="dept-cyl-head">
        <span className="dept-cyl-icon" aria-hidden="true">{deptIcon(dept.id)}</span>
        <div className="dept-cyl-name">{dept.name}</div>
        <div className="dept-cyl-status">
          <span className="dept-lamp" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          {DEPT_STATUS_LABEL_JA[dept.status]}
        </div>
      </div>

      <div className="dept-cyl-tube" aria-hidden="true">
        {/* 目盛り(100/50/0) */}
        <span className="dept-cyl-scale">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </span>
        {/* 充填メーター(下から上へ・ステータス色メタリック) */}
        <span
          className="dept-cyl-fill"
          style={{
            height: `${fill}%`,
            // 横方向の金属反射(左右陰影+中央ハイライト)でメタリックなメーターにする
            background: `linear-gradient(90deg, ${color}88 0%, #ffffffcc 16%, ${color} 42%, ${color} 58%, ${color}55 84%, ${color}88 100%)`,
            boxShadow: `0 0 14px ${color}aa inset, 0 -1px 4px ${color} inset`,
          }}
        />
        {/* ガラスの光沢 */}
        <span className="dept-cyl-gloss" />
      </div>

      <div className="dept-cyl-pct" style={{ color }}>{target}%</div>
    </button>
  );
});
