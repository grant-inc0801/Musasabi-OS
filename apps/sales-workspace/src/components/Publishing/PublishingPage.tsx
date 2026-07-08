import {
  CLEAN_CHECK_STATUS_COLOR,
  DEPARTMENT_STATUS_LABEL_JA,
  MOCK_DEPARTMENT_SUMMARIES,
  PUBLISHING_CLEAN_CHECKS,
  PUBLISHING_STAFF,
  PUBLISHING_WORKS,
  PUBLISHING_STAGE_LABEL_JA,
  PUBLISHING_CHANNEL_LABEL_JA,
  EDITOR_NOTES,
  EDITOR_NOTE_CATEGORY_LABEL_JA,
  EDITOR_IN_CHIEF_ROLES,
  buildPublishingSummary,
  formatJpy,
} from "@musasabi/ai-company";

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

// 作品パイプラインで表示するステージの並び(企画 → note販売準備)。
const PIPELINE_STAGES = [
  "planning",
  "writing",
  "proofreading",
  "similarity_check",
  "kindle_prep",
  "note_prep",
] as const;

export function PublishingPage() {
  const totalUnits = MOCK_WORKS.reduce((sum, w) => sum + w.unitsSold, 0);
  const totalRevenue = MOCK_WORKS.reduce((sum, w) => sum + w.revenueJpy, 0);
  const pubSummary = buildPublishingSummary();

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

      <section aria-label="作品パイプライン">
        <h3>作品パイプライン(Mock)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          企画から Kindle / note 販売準備までの各ステージにある作品を表示します。
          外部出版サービスへの実ログイン・実投稿・実販売設定は行いません。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {PIPELINE_STAGES.map((stage) => {
            const works = PUBLISHING_WORKS.filter((w) => w.stage === stage);
            return (
              <div
                key={stage}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "0.6rem 0.8rem",
                  minWidth: "12rem",
                  flex: "1 1 12rem",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "0.35rem" }}>
                  {PUBLISHING_STAGE_LABEL_JA[stage]}
                  <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}>
                    {" "}
                    ({works.length})
                  </span>
                </div>
                {works.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>—</div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.9rem" }}>
                    {works.map((w) => (
                      <li key={w.id}>
                        {w.title}
                        <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          {w.genre}・{PUBLISHING_CHANNEL_LABEL_JA[w.channel]}・{w.progressPercent}%・
                          {w.owner}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="敏腕編集長AI">
        <h3>敏腕編集長AIからの指摘(Mock)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          原稿の改善点・物語構成・キャラクター一貫性・既存作品との酷似回避・読者ターゲット・
          販売導線を確認し、各担当AIへ指摘します。
        </p>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {EDITOR_NOTES.map((n) => {
            const work = PUBLISHING_WORKS.find((w) => w.id === n.workId);
            return (
              <li
                key={n.id}
                style={{
                  borderLeft: "3px solid var(--accent, #A855F7)",
                  padding: "0.35rem 0.6rem",
                  margin: "0.5rem 0",
                  background: "var(--surface-2, rgba(168,85,247,0.06))",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {work ? work.title : n.workId}・{EDITOR_NOTE_CATEGORY_LABEL_JA[n.category]}
                </div>
                <div>敏腕編集長AI：{n.message}</div>
              </li>
            );
          })}
        </ul>
        <h4>敏腕編集長AIの役割</h4>
        <ul>
          {EDITOR_IN_CHIEF_ROLES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section aria-label="次の出版アクション">
        <h3>次の出版アクション(Mock)</h3>
        <ol>
          {pubSummary.nextActions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ol>
      </section>

      <section aria-label="クリーン運営">
        <h3 style={{ marginTop: 0 }}>クリーン運営 / 規約チェック(Mock・AI編集長)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
          Kindle / note 等の利用ルール・著作権・AI生成ルール・類似性を出版前に確認します。
          高リスク案件はCEO/管理部の承認待ちへ回します(実出版・実投稿は行いません)。
        </p>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {PUBLISHING_CLEAN_CHECKS.map((c) => (
            <li key={c.item} style={{ margin: "0.25rem 0", display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="dept-lamp"
                style={{
                  background: CLEAN_CHECK_STATUS_COLOR[c.status],
                  boxShadow: `0 0 6px ${CLEAN_CHECK_STATUS_COLOR[c.status]}`,
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                }}
              />
              {c.item}: {c.status}
            </li>
          ))}
        </ul>
        <h4>出版部AI社員(Mock)</h4>
        <ul>
          {PUBLISHING_STAFF.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
};
