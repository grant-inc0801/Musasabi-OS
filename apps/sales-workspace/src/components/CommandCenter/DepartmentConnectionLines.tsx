import { useEffect, useState } from "react";
import { isConnectionActive } from "@musasabi/ai-company";
import type { CommandDepartment, DeptConnection } from "@musasabi/ai-company";

// 部署間連携ライン(D-20260706-007+ユーザーFB第5弾)。パネル中心同士を結び、
// 連携中(両端が稼働中/エラー対応中)のラインだけ光が流れるアニメーションで
// 点灯し、非連携時は消灯(非表示)する。reduced-motion では流れを止める。

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function DepartmentConnectionLines({
  container,
  cards,
  connections,
  departments,
}: {
  container: HTMLElement | null;
  cards: ReadonlyMap<string, HTMLElement>;
  connections: readonly DeptConnection[];
  departments: readonly CommandDepartment[];
}) {
  const [lines, setLines] = useState<Line[]>([]);
  const activeConnections = connections.filter((c) => isConnectionActive(departments, c));

  useEffect(() => {
    function measure(): void {
      if (!container) return;
      const base = container.getBoundingClientRect();
      const next: Line[] = [];
      for (const conn of activeConnections) {
        const from = cards.get(conn.from)?.getBoundingClientRect();
        const to = cards.get(conn.to)?.getBoundingClientRect();
        if (!from || !to) continue;
        next.push({
          x1: from.x + from.width / 2 - base.x,
          y1: from.y + from.height / 2 - base.y,
          x2: to.x + to.width / 2 - base.x,
          y2: to.y + to.height / 2 - base.y,
        });
      }
      setLines(next);
    }
    measure();
    window.addEventListener("resize", measure);
    // 初期レイアウト確定後にもう一度測る
    const timer = setTimeout(measure, 200);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(timer);
    };
    // activeConnections は connections+departments から導出される
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, cards, connections, departments]);

  return (
    <svg className="dept-lines" aria-hidden="true">
      {lines.map((l, i) => (
        <g key={i}>
          <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className="dept-line-glow" />
          <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} className="dept-line-flow" />
          {/* ライン上のノード点(中点) */}
          <circle cx={(l.x1 + l.x2) / 2} cy={(l.y1 + l.y2) / 2} r={3.2} className="dept-line-node" />
        </g>
      ))}
    </svg>
  );
}
