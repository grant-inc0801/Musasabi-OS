import { forwardRef, useEffect, useState } from "react";
import { DEPT_STATUS_COLOR, DEPT_STATUS_LABEL_JA, deptIcon } from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";

// 部署パネル 円柱型進捗メーター(部署パネルUI仕様書)。
// 機械的・重厚感のある一体型シリンダー(背景パネルなし)。上部の金属キャップに
// アイコン、円柱本体に部署名・ステータス、中央のガラス窓に下から上へ充填するメーター、
// 台座にパーセンテージを一体表示する。進捗に応じて下から上へ充填し、色はステータス連動。
// 色覚多様性に配慮しアイコンとラベルでも状態を示す。

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
      {/* 上部の金属キャップ+アイコン */}
      <span className="dept-cyl-cap" aria-hidden="true">
        <span className="dept-cyl-icon">{deptIcon(dept.id)}</span>
      </span>

      {/* 円柱本体(黒ガンメタ) */}
      <span className="dept-cyl-body">
        <span className="dept-cyl-name">{dept.name}</span>
        <span className="dept-cyl-status">
          <span className="dept-lamp" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
          {DEPT_STATUS_LABEL_JA[dept.status]}
        </span>

        {/* ガラス窓のメーター(下から上へ・ステータス色メタリック) */}
        <span className="dept-cyl-window" aria-hidden="true">
          <span className="dept-cyl-scale">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </span>
          <span
            className="dept-cyl-fill"
            style={{
              height: `${fill}%`,
              background: `linear-gradient(90deg, ${color}88 0%, #ffffffbb 16%, ${color} 42%, ${color} 58%, ${color}55 84%, ${color}88 100%)`,
              boxShadow: `0 0 16px ${color}cc inset, 0 -1px 5px ${color} inset`,
            }}
          />
          <span className="dept-cyl-gloss" />
        </span>
      </span>

      {/* 台座+パーセンテージ(一体型) */}
      <span className="dept-cyl-base">
        <span className="dept-cyl-pct" style={{ color }}>{target}%</span>
      </span>
    </button>
  );
});
