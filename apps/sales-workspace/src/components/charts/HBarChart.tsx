// 横棒グラフ(SVG・依存なし)。コール結果の可視化に使う(D-20260706 ユーザーFB)。
// dataviz 指針: 細いマーク+データ端のみ4px丸め(基線側は直角)、系列間2pxギャップ、
// 目盛りは控えめ、値は棒の端に直接ラベル、テキストはテキスト色(系列色は使わない)、
// 2系列以上は凡例必須。系列色は検証済みダークパレット(#3987e5/#199e70/#c98500)。

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

export interface BarRow {
  label: string;
  /** series.key → 値。 */
  values: Record<string, number>;
}

interface HBarChartProps {
  series: readonly BarSeries[];
  rows: readonly BarRow[];
  /** 値の表示サフィックス(例: "件")。 */
  unit?: string;
  maxValue?: number;
}

const BAR_H = 12;
const BAR_GAP = 2;
const ROW_GAP = 10;
const LABEL_W = 88;
const VALUE_W = 44;
const CHART_W = 560;

/** データ端(右)のみ4px丸め・基線(左)は直角の横棒パス。 */
function barPath(x: number, y: number, width: number, height: number): string {
  const r = Math.min(4, width);
  return [
    `M ${x} ${y}`,
    `h ${Math.max(0, width - r)}`,
    `a ${r} ${r} 0 0 1 ${r} ${r}`,
    `v ${height - 2 * r}`,
    `a ${r} ${r} 0 0 1 -${r} ${r}`,
    `h ${-Math.max(0, width - r)}`,
    "z",
  ].join(" ");
}

export function HBarChart({ series, rows, unit = "", maxValue }: HBarChartProps) {
  const max = Math.max(
    1,
    maxValue ?? Math.max(...rows.flatMap((row) => series.map((s) => row.values[s.key] ?? 0))),
  );
  const groupH = series.length * BAR_H + (series.length - 1) * BAR_GAP;
  const height = rows.length * (groupH + ROW_GAP) - ROW_GAP + 8;
  const plotW = CHART_W - LABEL_W - VALUE_W;
  const gridSteps = 4;

  return (
    <div style={{ maxWidth: `${CHART_W}px`, overflowX: "auto" }}>
      {series.length > 1 && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
          {series.map((s) => (
            <span key={s.key} style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: s.color,
                  marginRight: 5,
                }}
              />
              {s.label}
            </span>
          ))}
        </div>
      )}
      <svg width={CHART_W} height={height} role="img" aria-label="コール結果グラフ">
        {/* 控えめな縦グリッド */}
        {Array.from({ length: gridSteps + 1 }, (_, i) => {
          const x = LABEL_W + (plotW * i) / gridSteps;
          return (
            <line key={i} x1={x} y1={0} x2={x} y2={height - 8} stroke="var(--border-strong)" strokeWidth={1} />
          );
        })}
        {rows.map((row, rowIndex) => {
          const groupY = rowIndex * (groupH + ROW_GAP);
          return (
            <g key={row.label}>
              <text
                x={LABEL_W - 8}
                y={groupY + groupH / 2 + 4}
                textAnchor="end"
                fontSize={12}
                fill="var(--text)"
              >
                {row.label}
              </text>
              {series.map((s, seriesIndex) => {
                const value = row.values[s.key] ?? 0;
                const width = (plotW * value) / max;
                const y = groupY + seriesIndex * (BAR_H + BAR_GAP);
                return (
                  <g key={s.key}>
                    <path d={barPath(LABEL_W, y, Math.max(width, 2), BAR_H)} fill={s.color}>
                      <title>{`${row.label} / ${s.label}: ${value}${unit}`}</title>
                    </path>
                    <text
                      x={LABEL_W + Math.max(width, 2) + 6}
                      y={y + BAR_H - 2}
                      fontSize={11}
                      fill="var(--text-muted)"
                    >
                      {value}
                      {unit}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
