import { MOCK_DEPARTMENT_SUMMARIES, formatJpy, DEPARTMENT_STATUS_LABEL_JA } from "@musasabi/ai-company";

// 出版部ページ(D-20260706-006)。成果物・販売数・売上を中心に表示する。
// β版はすべて Mock 値(実売上データ連携・実制作パイプラインは後続フェーズ)。

interface PublishedWork {
  title: string;
  format: string;
  status: "published" | "editing" | "drafting";
  unitsSold: number;
  revenueJpy: number;
}

const WORK_STATUS_LABEL_JA: Record<PublishedWork["status"], string> = {
  published: "販売中",
  editing: "校正中",
  drafting: "執筆中",
};

// 成果物のMockマスタ。実在の作品・実売上ではない。
const MOCK_WORKS: readonly PublishedWork[] = [
  { title: "ムササビは夜に翔ぶ(第1巻)", format: "ライトノベル(電子)", status: "published", unitsSold: 320, revenueJpy: 96000 },
  { title: "AI社員はじめました", format: "ライトノベル(電子)", status: "published", unitsSold: 80, revenueJpy: 24000 },
  { title: "ムササビは夜に翔ぶ(第2巻)", format: "ライトノベル(電子)", status: "editing", unitsSold: 0, revenueJpy: 0 },
  { title: "営業AIの教科書", format: "実用書(企画)", status: "drafting", unitsSold: 0, revenueJpy: 0 },
];

const publishingSummary = MOCK_DEPARTMENT_SUMMARIES.find((d) => d.id === "dept-publishing");

export function PublishingPage() {
  const totalUnits = MOCK_WORKS.reduce((sum, w) => sum + w.unitsSold, 0);
  const totalRevenue = MOCK_WORKS.reduce((sum, w) => sum + w.revenueJpy, 0);

  return (
    <>
      <section aria-label="出版部サマリー">
        <h2>出版部</h2>
        <p style={{ color: "var(--warn)", fontSize: "0.9rem" }}>
          β版はMock値の表示のみです(実売上データ連携・実制作パイプラインは後続フェーズ)。
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>総販売数</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{totalUnits}部</div>
          </div>
          <div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>総売上</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>{formatJpy(totalRevenue)}</div>
          </div>
          {publishingSummary && (
            <>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>本日進捗</div>
                <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
                  {publishingSummary.progressPercent}%
                </div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>状態</div>
                <div style={{ fontSize: "1.6rem", fontWeight: "bold" }}>
                  {DEPARTMENT_STATUS_LABEL_JA[publishingSummary.status]}
                </div>
              </div>
            </>
          )}
        </div>
        {publishingSummary && (
          <p style={{ color: "var(--text-muted)" }}>本日の作業: {publishingSummary.todaySummary}</p>
        )}
      </section>

      <section aria-label="成果物一覧">
        <h3>成果物一覧</h3>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["タイトル", "形態", "状態", "販売数", "売上"].map((h) => (
                <th key={h} style={cellStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_WORKS.map((w) => (
              <tr key={w.title}>
                <td style={cellStyle}>{w.title}</td>
                <td style={cellStyle}>{w.format}</td>
                <td style={cellStyle}>{WORK_STATUS_LABEL_JA[w.status]}</td>
                <td style={cellStyle}>{w.unitsSold > 0 ? `${w.unitsSold}部` : "—"}</td>
                <td style={cellStyle}>{w.revenueJpy > 0 ? formatJpy(w.revenueJpy) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
