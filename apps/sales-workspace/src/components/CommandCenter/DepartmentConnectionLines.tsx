import { useEffect, useState } from "react";
import type { DeptConnection } from "@musasabi/ai-company";

// 部署間連携ライン(D-20260706-007)。パネル中心同士を白い半透明の発光ラインで
// 結び、ライン上に小さな白いノード点を置く。連携中は流れるアニメーション
// (CSSの stroke-dashoffset。reduced-motion では停止)。

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
}: {
  container: HTMLElement | null;
  cards: ReadonlyMap<string, HTMLElement>;
  connections: readonly DeptConnection[];
}) {
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    function measure(): void {
      if (!container) return;
      const base = container.getBoundingClientRect();
      const next: Line[] = [];
      for (const conn of connections) {
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
  }, [container, cards, connections]);

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
