import { useMemo, useState } from "react";
import { buildEvolutionInsights } from "@musasabi/self-improvement";
import { loadMemoryRecords, promoteMemoriesNow } from "../../lib/memoryStorage";

// D-015 AI Self Evolution: Memory(行動記録)から自己進化のインサイトを提示する。
// 頻出アクション・自動化候補・稼働主体・短期/長期の内訳を可視化し、
// 繰り返された短期メモリの長期昇格(手動)を実行できる。すべてローカル・外部送信なし。

export function SelfEvolutionPage({ onOpenAutomation }: { onOpenAutomation: () => void }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const insights = useMemo(() => buildEvolutionInsights(loadMemoryRecords()), [reloadKey]);

  function handlePromote(): void {
    const count = promoteMemoriesNow();
    setNote(
      count === 0
        ? "昇格対象はありませんでした(同じ行動の短期メモリが2回以上必要です)。"
        : `${count}件を長期ナレッジへ昇格しました。`,
    );
    setReloadKey((k) => k + 1);
  }

  const tiles = [
    { label: "記録総数", value: `${insights.totalRecords}件` },
    { label: "短期メモリ", value: `${insights.shortTermCount}件` },
    { label: "長期ナレッジ", value: `${insights.longTermCount}件` },
    { label: "自動化候補", value: `${insights.automationCandidates.length}件` },
  ];

  return (
    <>
      <section aria-label="自己進化サマリー">
        <h3 style={{ marginTop: 0 }}>AI自己進化(Self Evolution)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          行動記録(Company Brain)から、繰り返される操作・頻出アクション・稼働主体を分析し、
          自動化候補と長期ナレッジ化を提案します(決定的ロジック・LLM推論や外部送信はなし)。
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {tiles.map((t) => (
            <div key={t.label} className="card" style={{ minWidth: "8.5rem", textAlign: "center" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>{t.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="自動化候補">
        <h3 style={{ marginTop: 0 }}>自動化候補(繰り返された操作)</h3>
        {insights.automationCandidates.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            まだ自動化候補はありません。同じ操作を繰り返すと候補として提案されます。
          </p>
        ) : (
          <>
            <ul>
              {insights.automationCandidates.map((c) => (
                <li key={c.key}>
                  <strong>{c.key}</strong>({c.count}回)— Automationで自動化できます
                </li>
              ))}
            </ul>
            <button type="button" onClick={onOpenAutomation}>
              Automation(操作記録)を開く
            </button>
          </>
        )}
      </section>

      <section aria-label="長期ナレッジ化">
        <h3 style={{ marginTop: 0 }}>長期ナレッジ化(短期→長期の昇格)</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
          繰り返された短期メモリを長期ナレッジへ昇格します(Development Bible 第18章
          Self Evolution)。昇格自体も監査として記録されます。
        </p>
        <button type="button" onClick={handlePromote}>
          繰り返された短期メモリを長期へ昇格
        </button>
        {note && <p style={{ color: "var(--ok)", margin: "0.5rem 0 0" }}>{note}</p>}
      </section>

      <section aria-label="頻出アクションと稼働主体">
        <h3 style={{ marginTop: 0 }}>頻出アクション / 稼働主体</h3>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <h4 style={{ margin: "0 0 0.3rem" }}>頻出アクション(上位)</h4>
            {insights.frequentActions.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>記録がありません。</p>
            ) : (
              <ol style={{ margin: 0 }}>
                {insights.frequentActions.map((c) => (
                  <li key={c.key}>
                    {c.key}({c.count}回)
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div>
            <h4 style={{ margin: "0 0 0.3rem" }}>稼働主体(上位)</h4>
            {insights.topActors.length === 0 ? (
              <p style={{ color: "var(--text-muted)" }}>記録がありません。</p>
            ) : (
              <ol style={{ margin: 0 }}>
                {insights.topActors.map((c) => (
                  <li key={c.key}>
                    {c.key}({c.count}件)
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
