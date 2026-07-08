import {
  MOCK_TENANTS,
  PLAN_ORDER,
  PLAN_LABEL_JA,
  PLAN_FEATURES,
  FEATURE_LABEL_JA,
  PLAN_LIMITS,
  hasFeature,
  usagePercent,
  withinLimit,
  recommendUpgrade,
  type FeatureKey,
} from "@musasabi/tenancy";

// Phase 5: Product Launch(D-20260708-006)。マルチテナント/プラン/機能ゲート。
// 課金は Mock、顧客データ分離が前提。secrets/本番認証情報は保存しない。

const ALL_FEATURES = Object.keys(FEATURE_LABEL_JA) as FeatureKey[];

export function ProductPage() {
  return (
    <>
      <section aria-label="プロダクト概要">
        <h2>プロダクト / テナント管理(Phase 5・Mock)</h2>
        <p style={{ color: "var(--warn)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          Musasabi OS の商用SaaS化に向けたマルチテナント・プラン・機能ゲートです。
          課金・請求はすべて Mock。顧客データは分離前提で、secrets/本番認証情報は保存しません。
        </p>
      </section>

      <section aria-label="プラン機能マトリクス">
        <h3>プラン別 機能マトリクス</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", whiteSpace: "nowrap" }}>
            <thead>
              <tr>
                <th style={cell}>機能</th>
                {PLAN_ORDER.map((p) => <th key={p} style={cell}>{PLAN_LABEL_JA[p]}</th>)}
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURES.map((f) => (
                <tr key={f}>
                  <td style={cell}>{FEATURE_LABEL_JA[f]}</td>
                  {PLAN_ORDER.map((p) => (
                    <td key={p} style={{ ...cell, textAlign: "center" }}>
                      {hasFeature(p, f) ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td style={{ ...cell, fontWeight: "bold" }}>席数上限 / 部門上限</td>
                {PLAN_ORDER.map((p) => (
                  <td key={p} style={{ ...cell, textAlign: "center" }}>
                    {PLAN_LIMITS[p].maxSeats} / {PLAN_LIMITS[p].maxDepartments}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
          ✓ = 利用可。本番連携・SSO・優先サポートは Enterprise のみ({PLAN_FEATURES.enterprise.length}機能)。
        </p>
      </section>

      <section aria-label="テナント一覧">
        <h3>テナント(顧客企業・Mock)</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{["テナント", "プラン", "席数", "部門", "月間操作", "上限内", "アップグレード推奨"].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {MOCK_TENANTS.map((t) => {
              const upgrade = recommendUpgrade(t);
              const ok = withinLimit(t, "seats") && withinLimit(t, "departments") && withinLimit(t, "operations");
              return (
                <tr key={t.id}>
                  <td style={cell}>{t.name}</td>
                  <td style={cell}>{PLAN_LABEL_JA[t.plan]}</td>
                  <td style={cell}>{t.seatsUsed}({usagePercent(t, "seats")}%)</td>
                  <td style={cell}>{t.departmentsUsed}({usagePercent(t, "departments")}%)</td>
                  <td style={cell}>{t.monthlyOperations.toLocaleString()}({usagePercent(t, "operations")}%)</td>
                  <td style={cell}>{ok ? "はい" : "超過"}</td>
                  <td style={cell}>{upgrade ? PLAN_LABEL_JA[upgrade] : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

const cell: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
