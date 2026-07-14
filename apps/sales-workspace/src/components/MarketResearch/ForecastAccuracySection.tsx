import { useState } from "react";
import { fetchAllHeadlines } from "../../lib/rssFeeds";
import { loadMemoryRecords, recordMemory } from "../../lib/memoryStorage";
import {
  autoVerifyForecastOutcomes,
  forecastAccuracyStats,
  forecastAccuracyTrend,
  loadForecastOutcomes,
  removeForecastOutcome,
  setForecastOutcomeStatus,
  type ForecastOutcomeRecord,
  type ForecastOutcomeStatus,
} from "../../lib/forecastTracking";

// 市場調査部: 予測の的中率トラッキング(本番・完全ローカル)。
// 未来予測で選出したシナリオを記録し、RSS 実データ+社内記録と突合して的中率を可視化。
// 判定結果は次回予測の較正(学習ノート)へフィードバックされる。

const STATUS_JA: Record<ForecastOutcomeStatus, string> = {
  pending: "判定待ち",
  hit: "的中",
  partial: "部分的中",
  miss: "外れ",
};

const STATUS_COLOR: Record<ForecastOutcomeStatus, string> = {
  pending: "#94A3B8",
  hit: "#22C55E",
  partial: "#F59E0B",
  miss: "#EF4444",
};

/** 的中率の週次推移チャート(単一系列・検証済み色 #16A34A・判定日ベースの決定論集計)。 */
function AccuracyTrendChart({ records }: { records: ForecastOutcomeRecord[] }) {
  const points = forecastAccuracyTrend(records);
  const hasData = points.some((p) => p.hitRatePercent !== null);
  if (!hasData) return null;

  const W = 460;
  const H = 150;
  const PAD = { top: 18, right: 44, bottom: 24, left: 34 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (pct: number) => PAD.top + (1 - pct / 100) * plotH;
  const LINE = "#16A34A";

  // null(判定なし週)は線を切る — セグメントごとの折れ線にする
  const segments: Array<Array<{ i: number; pct: number }>> = [];
  let current: Array<{ i: number; pct: number }> = [];
  points.forEach((p, i) => {
    if (p.hitRatePercent === null) {
      if (current.length > 0) segments.push(current);
      current = [];
    } else {
      current.push({ i, pct: p.hitRatePercent });
    }
  });
  if (current.length > 0) segments.push(current);
  const lastIdx = [...points].map((p, i) => ({ p, i })).filter((x2) => x2.p.hitRatePercent !== null).pop()!.i;

  return (
    <div className="card" style={{ marginTop: "0.6rem", padding: "0.5rem 0.7rem", maxWidth: `${W + 16}px` }}>
      <strong style={{ fontSize: "0.8rem" }}>的中率の推移(週次・判定ベース)</strong>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="的中率の週次推移チャート">
        {[0, 50, 100].map((g) => (
          <g key={g}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(g)} y2={y(g)} stroke="var(--border)" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(g) + 3} textAnchor="end" fontSize={9} fill="var(--text-muted)">
              {g}%
            </text>
          </g>
        ))}
        {segments.map((seg, si) => (
          <polyline
            key={si}
            points={seg.map((s) => `${x(s.i)},${y(s.pct)}`).join(" ")}
            fill="none"
            stroke={LINE}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {points.map((p, i) =>
          p.hitRatePercent === null ? null : (
            <circle key={i} cx={x(i)} cy={y(p.hitRatePercent)} r={4} fill={LINE} stroke="var(--bg-card)" strokeWidth={2}>
              <title>{`${p.label}週: 的中率${p.hitRatePercent}%(判定${p.judged}件)`}</title>
            </circle>
          ),
        )}
        {points[lastIdx].hitRatePercent !== null && (
          <text
            x={Math.min(x(lastIdx) + 8, W - 4)}
            y={y(points[lastIdx].hitRatePercent!) + 3}
            fontSize={11}
            fontWeight={700}
            fill="var(--text)"
          >
            {points[lastIdx].hitRatePercent}%
          </text>
        )}
        {points.map((p, i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
            {p.label}
          </text>
        ))}
      </svg>
      <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--text-muted)" }}>
        判定日ベースの7日ビン(hit=1, partial=0.5)。詳細は下の記録一覧で確認できます。
      </p>
    </div>
  );
}

export function ForecastAccuracySection() {
  const [records, setRecords] = useState<ForecastOutcomeRecord[]>(() => loadForecastOutcomes());
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const stats = forecastAccuracyStats(records);

  async function handleAutoVerify(): Promise<void> {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      // 実績データ: RSS 見出し(外部実データ)+ 社内の行動記録
      const headlines = await fetchAllHeadlines(10).catch(() => []);
      const memories = loadMemoryRecords().slice(0, 100).map((r) => `${r.action}: ${r.detail}`);
      const evidence = [...headlines.map((h) => h.title), ...memories];
      if (evidence.length === 0) {
        setNote("突合できる実績データがありません(RSSソース・社内記録が空)。");
        return;
      }
      const { records: next, verifiedCount } = autoVerifyForecastOutcomes(evidence);
      setRecords(next);
      if (verifiedCount === 0) {
        setNote("判定待ちの予測はありません。");
      } else {
        setNote(`${verifiedCount}件を実績データ(RSS ${headlines.length}件+社内記録)と突合しました。判定は手動で上書きできます。`);
        recordMemory({
          category: "company",
          actor: "市場調査部",
          action: "予測と実績の自動突合を実行",
          detail: `${verifiedCount}件を判定(的中率: ${forecastAccuracyStats(next).hitRatePercent ?? "—"}%)`,
          tags: ["forecast", "accuracy"],
        });
      }
    } catch (e) {
      setNote(`突合に失敗しました: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  function overrideStatus(id: string, status: ForecastOutcomeStatus): void {
    setRecords(setForecastOutcomeStatus(id, status));
  }

  return (
    <section aria-label="予測の的中率">
      <h3>予測の的中率トラッキング</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "52rem" }}>
        未来予測で選出したシナリオを記録し、後日<strong>RSS実データ+社内記録と突合</strong>して的中率を追跡します。
        自動突合はキーワード一致率による判定候補で、<strong>最終判定は手動で上書き</strong>できます。
        的中率の実績は次回予測の較正(🧠学習ノート)へ自動フィードバックされます。
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {[
          { label: "的中率", value: stats.hitRatePercent === null ? "—" : `${stats.hitRatePercent}%` },
          { label: "的中", value: `${stats.hit}件` },
          { label: "部分的中", value: `${stats.partial}件` },
          { label: "外れ", value: `${stats.miss}件` },
          { label: "判定待ち", value: `${stats.pending}件` },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "0.4rem 0.9rem", textAlign: "center", minWidth: "6rem" }}>
            <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>{s.value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{s.label}</div>
          </div>
        ))}
      </div>
      {stats.avgPlausibilityHit !== null && stats.avgPlausibilityMiss !== null && (
        <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: "0.4rem 0 0" }}>
          較正の妥当性: 的中予測の平均実現性 {stats.avgPlausibilityHit}% / 外れ予測の平均実現性 {stats.avgPlausibilityMiss}%
          {stats.avgPlausibilityMiss >= stats.avgPlausibilityHit
            ? " — ⚠ 実現性の見積もりが楽観寄りです(次回予測で慎重側へ較正)"
            : " — 見積もりは妥当です"}
        </p>
      )}

      <AccuracyTrendChart records={records} />

      <button type="button" style={{ marginTop: "0.5rem" }} onClick={() => void handleAutoVerify()} disabled={busy}>
        {busy ? "実績データと突合中…" : "⚖ 実績データと自動突合(RSS+社内記録)"}
      </button>
      {note && <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>{note}</p>}

      <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {records.length === 0 && (
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            記録された予測はまだありません。上の「AGI深層予測」を実行すると選出シナリオが自動で記録されます。
          </p>
        )}
        {records.map((r) => (
          <div key={r.id} className="card" style={{ padding: "0.45rem 0.7rem", fontSize: "0.78rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{ fontSize: "0.64rem", background: `${STATUS_COLOR[r.status]}22`, color: STATUS_COLOR[r.status] }}
              >
                {STATUS_JA[r.status]}
              </span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                予測日 {new Date(r.createdAtMs).toLocaleDateString("ja-JP")} / 実現性 {r.plausibility}%
                {r.verifiedAtMs ? ` / 判定 ${new Date(r.verifiedAtMs).toLocaleDateString("ja-JP")}` : ""}
              </span>
              <button
                type="button"
                style={{ marginLeft: "auto", fontSize: "0.68rem", padding: "0.1rem 0.4rem" }}
                onClick={() => setRecords(removeForecastOutcome(r.id))}
              >
                削除
              </button>
            </div>
            <div style={{ marginTop: "0.2rem" }}>{r.summary}</div>
            {r.evidenceNote && (
              <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                突合根拠: {r.evidenceNote}
              </div>
            )}
            <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
              {(["hit", "partial", "miss", "pending"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  style={{
                    fontSize: "0.68rem",
                    padding: "0.1rem 0.45rem",
                    opacity: r.status === s ? 1 : 0.6,
                    borderColor: r.status === s ? STATUS_COLOR[s] : undefined,
                  }}
                  onClick={() => overrideStatus(r.id, s)}
                >
                  {STATUS_JA[s]}にする
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
