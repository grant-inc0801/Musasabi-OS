import { forwardRef, useEffect, useState } from "react";
import { DEPT_STATUS_COLOR, DEPT_STATUS_LABEL_JA, deptIcon } from "@musasabi/ai-company";
import type { CommandDepartment } from "@musasabi/ai-company";

// 部署パネル 円柱型進捗メーター(メタリック・ステータスシリンダー仕様書)。
// 鈍いメタルグレー〜クロムの一体型シリンダーに縦長のガラス窓を設け、中の発光液体メーターが
// 下から上へ充填する。上部にアイコン・部署名・ステータス、下部に大きな%と発光ライン。
// 進捗に応じて充填、色はステータス連動。色覚多様性に配慮しアイコン/ラベルでも状態を示す。

/** 表示名の短縮(高さ統一のため長い名称を1行に収める)。 */
const SHORT_NAME: Record<string, string> = {
  "カスタマーサポート部": "サポート部",
};

export const DepartmentCylinder = forwardRef<
  HTMLButtonElement,
  { dept: CommandDepartment; selected: boolean; onSelect: (id: string) => void }
>(function DepartmentCylinder({ dept, selected, onSelect }, ref) {
  const color = DEPT_STATUS_COLOR[dept.status];
  const target = Math.max(0, Math.min(100, dept.progressPercent));
  const displayName = SHORT_NAME[dept.name] ?? dept.name;

  // 金属/液体の流光をシリンダーごとにランダム(決定論・id由来)なタイミングにする。
  const seed = [...dept.id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const shineSpeed = `${4.4 + (seed % 36) / 10}s`;   // 4.4〜7.9s
  const shineDelay = `${-((seed % 40) / 10)}s`;       // 0〜-3.9s
  const liquidDelay = `${-((seed % 32) / 10)}s`;      // 0〜-3.1s

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
      style={{
        ["--glow" as string]: color,
        ["--color" as string]: color,
        ["--shine-speed" as string]: shineSpeed,
        ["--shine-delay" as string]: shineDelay,
        ["--liquid-delay" as string]: liquidDelay,
      }}
      onClick={() => onSelect(dept.id)}
      aria-pressed={selected}
      aria-label={`${dept.name} ${DEPT_STATUS_LABEL_JA[dept.status]} ${target}%`}
      title={`${dept.name}(${DEPT_STATUS_LABEL_JA[dept.status]})`}
    >
      {/* 円柱型の金属シリンダー(一体型筐体) */}
      <span className="dept-cyl-vessel">
        {/* 上部: アイコン・部署名・ステータス */}
        <span className="dept-cyl-header">
          <span className="dept-cyl-icon">{deptIcon(dept.id)}</span>
          <span className="dept-cyl-name">{displayName}</span>
          <span className="dept-cyl-status">
            <span className="dept-lamp" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            {DEPT_STATUS_LABEL_JA[dept.status]}
          </span>
        </span>

        {/* 中央: 金属フレーム付きのガラス窓+発光液体メーター */}
        <span className="dept-cyl-frame" aria-hidden="true">
          <span className="dept-cyl-window">
            <span className="dept-cyl-scale">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </span>
            <span className="dept-cyl-liquid" style={{ height: `${fill}%` }} />
          </span>
        </span>

        {/* 下部: パーセンテージ+発光ライン(一体型) */}
        <span className="dept-cyl-pct">{target}<span>%</span></span>
        <span className="dept-cyl-baseline" aria-hidden="true" />
      </span>
    </button>
  );
});
