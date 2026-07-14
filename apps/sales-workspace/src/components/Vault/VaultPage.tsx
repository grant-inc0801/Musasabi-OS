import { useRef, useState } from "react";
import {
  VAULT_CAPACITY_CHARS,
  addVaultDocument,
  exportVaultJson,
  importVaultJson,
  loadVaultDocs,
  removeVaultDocument,
  vaultUsageChars,
  type VaultDocument,
} from "../../lib/vaultStorage";
import { recordMemory } from "../../lib/memoryStorage";
import { saveBinaryFile } from "../../lib/saveFile";
import { proposeVaultCuration, summarizeAndRemove, type CurationCandidate } from "../../lib/vaultCuration";

// 保管庫(Knowledge Vault)ページ(本番・完全ローカル)。
// テキスト資料(txt/md/csv 等)を実保存し、Company Brain の RAG 索引へ統合する。
// 保存した文書はチャット・エージェント・未来予測から意味検索で参照できる。

const SOURCE_JA: Record<VaultDocument["source"], string> = {
  upload: "ファイル取込",
  planning: "企画部",
  agent: "エージェント",
};

const ACCEPTED = [".txt", ".md", ".csv", ".json", ".log", ".tsv"];

function formatChars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}千文字` : `${n}文字`;
}

export function VaultPage() {
  const [docs, setDocs] = useState<VaultDocument[]>(() => loadVaultDocs());
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<CurationCandidate[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const usage = vaultUsageChars(docs);
  const usagePercent = Math.min(100, Math.round((usage / VAULT_CAPACITY_CHARS) * 100));

  async function handleFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;
    setError(null);
    const added: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        if (text.trim() === "") {
          setError(`「${file.name}」は空のファイルのため取り込めませんでした。`);
          continue;
        }
        const doc = addVaultDocument({
          title: file.name.replace(/\.[^.]+$/, ""),
          text,
          source: "upload",
          tags: ["upload"],
        });
        added.push(doc.title);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        break;
      }
    }
    if (added.length > 0) {
      setDocs(loadVaultDocs());
      setNote(`${added.length}件の資料を保管庫へ保存しました: ${added.join(" / ")}`);
      recordMemory({
        category: "company",
        actor: "保管庫",
        action: "資料を保管庫へ取込",
        detail: added.join(" / ").slice(0, 200),
        tags: ["vault", "upload"],
      });
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleRemove(doc: VaultDocument): void {
    setDocs(removeVaultDocument(doc.id));
    setNote(`「${doc.title}」を保管庫から削除しました。`);
  }

  async function handleExport(): Promise<void> {
    const result = await saveBinaryFile(
      `musasabi-vault-${new Date().toISOString().slice(0, 10)}.json`,
      new TextEncoder().encode(exportVaultJson()),
      "JSON",
      ["json"],
    );
    if (result !== "cancelled") {
      setNote(`保管庫の全文書(${docs.length}件)をエクスポートしました。`);
    }
  }

  async function handleImport(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;
    setError(null);
    try {
      const raw = await files[0].text();
      const result = importVaultJson(raw);
      if (result.error) {
        setError(result.error);
        return;
      }
      setDocs(loadVaultDocs());
      const parts = [`${result.added}件を取り込みました`];
      if (result.skippedDuplicates > 0) parts.push(`重複スキップ${result.skippedDuplicates}件`);
      if (result.skippedCapacity > 0) parts.push(`容量上限スキップ${result.skippedCapacity}件`);
      setNote(`インポート完了: ${parts.join("・")}。取り込んだ文書は次回の索引更新でRAG検索対象になります。`);
      if (result.added > 0) {
        recordMemory({
          category: "company",
          actor: "保管庫",
          action: "保管庫エクスポートを取込",
          detail: parts.join("・"),
          tags: ["vault", "import"],
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const filtered = query.trim()
    ? docs.filter(
        (d) =>
          d.title.includes(query.trim()) ||
          d.text.includes(query.trim()) ||
          d.tags.some((t) => t.includes(query.trim())),
      )
    : docs;

  return (
    <>
      <section aria-label="保管庫の説明" className="card" style={{ maxWidth: "46rem" }}>
        <strong>🗄 保管庫(Knowledge Vault)— 本番実装</strong>
        <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          会社の資料(txt / md / csv などのテキスト文書)をこの端末内に実保存します。
          保存した資料は Company Brain の意味検索(RAG)へ自動で索引され、
          AIアシスタントへの相談・エージェント実行・未来予測が内容を参照できます。
          外部送信はありません(完全ローカル)。
        </p>
      </section>

      <section aria-label="容量" style={{ marginTop: "1rem", maxWidth: "46rem" }}>
        <h3 style={{ margin: "0 0 0.4rem" }}>使用容量</h3>
        <div
          role="progressbar"
          aria-valuenow={usagePercent}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            height: 10,
            borderRadius: 6,
            background: "var(--border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${usagePercent}%`,
              height: "100%",
              background: usagePercent >= 90 ? "#EF4444" : usagePercent >= 70 ? "#F59E0B" : "#22C55E",
            }}
          />
        </div>
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          {formatChars(usage)} / {formatChars(VAULT_CAPACITY_CHARS)}(使用率{usagePercent}%)・保管{docs.length}件
        </p>
      </section>

      <section aria-label="資料の取込" style={{ marginTop: "1rem" }}>
        <h3 style={{ margin: "0 0 0.4rem" }}>資料の取込</h3>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          aria-label="保管庫へ取り込むファイル"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          対応形式: {ACCEPTED.join(" ")}(テキスト文書)。複数選択可。1文書あたり4万文字まで保存します。
        </p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <button type="button" onClick={() => void handleExport()} disabled={docs.length === 0}>
            📦 全文書をエクスポート(JSON)
          </button>
          <label style={{ fontSize: "0.8rem", display: "flex", gap: "0.35rem", alignItems: "center" }}>
            📥 エクスポートを取込:
            <input
              type="file"
              accept=".json"
              aria-label="保管庫エクスポートを取込"
              onChange={(e) => void handleImport(e.target.files)}
            />
          </label>
        </div>
        <p style={{ margin: "0.3rem 0 0", fontSize: "0.74rem", color: "var(--text-muted)" }}>
          エクスポート/インポートで別端末へ保管庫を持ち運べます(同一IDは重複スキップ・容量超過分はスキップ・完全ローカル)。
        </p>
        {note && <p style={{ color: "var(--ok)", fontSize: "0.82rem" }}>{note}</p>}
        {error && <p style={{ color: "#EF4444", fontSize: "0.82rem" }}>{error}</p>}
      </section>

      <section aria-label="保管庫の整理" style={{ marginTop: "1rem" }}>
        <h3 style={{ margin: "0 0 0.4rem" }}>保管庫の整理(AI司書・承認制)</h3>
        <p style={{ margin: "0 0 0.4rem", fontSize: "0.78rem", color: "var(--text-muted)", maxWidth: "46rem" }}>
          同名の旧版・30日より古いAI成果物を整理候補として提案します(決定論・提案のみ)。
          実行は候補ごとの<strong>承認ボタンを押した場合のみ</strong>で、原本の冒頭要約を「要約:」として残します。
        </p>
        <button type="button" onClick={() => setCandidates(proposeVaultCuration())}>
          🧹 整理候補を提案
        </button>
        {candidates !== null && (
          candidates.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
              整理候補はありません(保管庫は整っています)。
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.5rem" }}>
              {candidates.map((c) => (
                <div key={c.doc.id} className="card" style={{ padding: "0.45rem 0.7rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "16rem" }}>
                    <strong>{c.doc.title}</strong>{" "}
                    <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                      {SOURCE_JA[c.doc.source]} / {formatChars(c.doc.text.length)} / {new Date(c.doc.createdAtMs).toLocaleDateString("ja-JP")}
                    </span>
                    <div style={{ color: "#F59E0B", fontSize: "0.74rem" }}>理由: {c.reason}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const { summaryTitle } = summarizeAndRemove(c.doc);
                      setDocs(loadVaultDocs());
                      setCandidates((prev) => (prev ?? []).filter((x) => x.doc.id !== c.doc.id));
                      setNote(
                        summaryTitle
                          ? `「${c.doc.title}」を整理しました(「${summaryTitle}」を保存・原本削除)。`
                          : `「${c.doc.title}」を削除しました(本文が短いため要約なし)。`,
                      );
                    }}
                  >
                    ✔ 承認して要約・削除
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidates((prev) => (prev ?? []).filter((x) => x.doc.id !== c.doc.id))}
                  >
                    今回は残す
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </section>

      <section aria-label="保管資料一覧" style={{ marginTop: "1rem" }}>
        <h3 style={{ margin: "0 0 0.4rem" }}>保管資料({filtered.length}件)</h3>
        <input
          type="search"
          placeholder="タイトル・本文・タグで絞り込み"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ marginBottom: "0.5rem", minWidth: "18rem" }}
        />
        {filtered.length === 0 ? (
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {docs.length === 0
              ? "保管資料はまだありません。上の「資料の取込」からファイルを追加してください。"
              : "絞り込みに一致する資料はありません。"}
          </p>
        ) : (
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["タイトル", "出所", "サイズ", "保存日", "冒頭", "操作"].map((h) => (
                  <th key={h} style={cellStyle}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td style={cellStyle}>{d.title}</td>
                  <td style={cellStyle}>{SOURCE_JA[d.source]}</td>
                  <td style={cellStyle}>{formatChars(d.text.length)}</td>
                  <td style={cellStyle}>{new Date(d.createdAtMs).toLocaleDateString("ja-JP")}</td>
                  <td style={{ ...cellStyle, maxWidth: "22rem" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {d.text.replace(/\s+/g, " ").slice(0, 80)}
                      {d.text.length > 80 ? "…" : ""}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <button type="button" onClick={() => handleRemove(d)}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          保存した資料は Company Brain の意味検索へ自動索引されます(分類: vault)。
        </p>
      </section>
    </>
  );
}

const cellStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  padding: "0.35rem 0.6rem",
  textAlign: "left",
  verticalAlign: "top",
};
