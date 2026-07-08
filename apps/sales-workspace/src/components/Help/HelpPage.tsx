import {
  GLOSSARY,
  HELP_FAQ,
  HELP_TOPICS,
} from "@musasabi/ai-company";

// D-020 Onboarding & Help: アプリ内ヘルプ。機能ガイド(各画面への導線)+
// 用語集+FAQ+初回セットアップの再表示。すべてローカル(外部送信なし)。

export function HelpPage({
  onOpenPage,
  onRestartSetup,
}: {
  onOpenPage: (page: string) => void;
  onRestartSetup: () => void;
}) {
  return (
    <>
      <section aria-label="ヘルプ概要">
        <h3 style={{ marginTop: 0 }}>ヘルプ / はじめに(Onboarding & Help)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          Musasabi OS の各機能の使い方をまとめています。カードの「開く」から各画面へ移動できます
          (β版はすべてMock・ローカル処理・外部送信なし)。
        </p>
        <button type="button" onClick={onRestartSetup}>
          初回セットアップをもう一度見る
        </button>
      </section>

      <section aria-label="機能ガイド">
        <h3 style={{ marginTop: 0 }}>機能ガイド</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
            gap: "0.6rem",
          }}
        >
          {HELP_TOPICS.map((t) => (
            <div key={t.title} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <strong>{t.title}</strong>
              <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", flex: 1 }}>{t.description}</div>
              <button type="button" style={{ alignSelf: "flex-start" }} onClick={() => onOpenPage(t.page)}>
                開く
              </button>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="用語集">
        <h3 style={{ marginTop: 0 }}>用語集</h3>
        <dl style={{ maxWidth: "48rem" }}>
          {GLOSSARY.map((g) => (
            <div key={g.term} style={{ margin: "0 0 0.5rem" }}>
              <dt style={{ fontWeight: 700 }}>{g.term}</dt>
              <dd style={{ margin: "0.1rem 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {g.definition}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-label="よくある質問">
        <h3 style={{ marginTop: 0 }}>よくある質問(FAQ)</h3>
        <ul style={{ maxWidth: "48rem" }}>
          {HELP_FAQ.map((f) => (
            <li key={f.question} style={{ margin: "0.4rem 0" }}>
              <strong>{f.question}</strong>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{f.answer}</div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
