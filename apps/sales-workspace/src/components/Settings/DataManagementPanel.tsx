import { useRef, useState } from "react";
import {
  chooseBackupFolder,
  isAutoBackupSupported,
  loadAutoBackup,
  runBackupNow,
  saveAutoBackup,
} from "../../lib/autoBackup";
import { MUSASABI_KEY_PREFIX, buildBackupJson, parseBackupJson } from "@musasabi/shared";
import { saveBinaryFile } from "../../lib/saveFile";
import { recordMemory } from "../../lib/memoryStorage";

// データ管理(設定)。全ローカルデータ(musasabi.* の localStorage)の
// バックアップ(JSONエクスポート)と復元(インポート)、全削除。
// VRMファイル(IndexedDB)は対象外。処理は端末内で完結し外部送信はしない。

function collectEntries(): Record<string, string> {
  const entries: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key !== null && key.startsWith(MUSASABI_KEY_PREFIX)) {
      const value = localStorage.getItem(key);
      if (value !== null) entries[key] = value;
    }
  }
  return entries;
}

export function DataManagementPanel() {
  const [autoBk, setAutoBk] = useState(() => loadAutoBackup());
  const [bkBusy, setBkBusy] = useState(false);

  async function handleChooseFolder(): Promise<void> {
    const path = await chooseBackupFolder();
    if (path) setAutoBk(loadAutoBackup());
  }

  function toggleAutoBackup(enabled: boolean): void {
    const next = { ...autoBk, enabled };
    saveAutoBackup(next);
    setAutoBk(next);
  }

  async function handleBackupNow(): Promise<void> {
    setBkBusy(true);
    try {
      setAutoBk(await runBackupNow());
    } finally {
      setBkBusy(false);
    }
  }

  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);
  const entryCount = Object.keys(collectEntries()).length;

  async function handleExport(): Promise<void> {
    const entries = collectEntries();
    const json = buildBackupJson(entries, Date.now());
    const stamp = new Date().toISOString().slice(0, 10);
    try {
      const outcome = await saveBinaryFile(
        `MusasabiOS_backup_${stamp}.json`,
        new TextEncoder().encode(json),
        "JSON ファイル",
        ["json"],
      );
      if (outcome === "cancelled") return;
      setNote(`${Object.keys(entries).length}件のデータをエクスポートしました。`);
      recordMemory({
        category: "user",
        actor: "user",
        action: "データをバックアップ",
        detail: `${Object.keys(entries).length}エントリ`,
        tags: ["backup"],
      });
    } catch (error) {
      alert(`エクスポートに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async function handleImport(file: File): Promise<void> {
    const text = await file.text();
    const snapshot = parseBackupJson(text);
    if (snapshot === null) {
      alert("バックアップファイルを読み込めませんでした(形式が不正です)。");
      return;
    }
    const count = Object.keys(snapshot.entries).length;
    const exportedAt =
      snapshot.exportedAtMs > 0 ? new Date(snapshot.exportedAtMs).toLocaleString("ja-JP") : "不明";
    if (
      !confirm(
        `バックアップ(${exportedAt}・${count}件)を復元しますか?\n現在のデータは上書きされます。`,
      )
    ) {
      return;
    }
    for (const [key, value] of Object.entries(snapshot.entries)) {
      localStorage.setItem(key, value);
    }
    recordMemory({
      category: "user",
      actor: "user",
      action: "バックアップから復元",
      detail: `${count}エントリ(${exportedAt}時点)`,
      tags: ["backup", "restore"],
    });
    alert("復元しました。画面を再読み込みします。");
    location.reload();
  }

  function handleClearAll(): void {
    if (!confirm("すべてのローカルデータ(Memory・営業リスト・設定等)を削除しますか?\nこの操作は取り消せません。")) {
      return;
    }
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key !== null && key.startsWith(MUSASABI_KEY_PREFIX)) keys.push(key);
    }
    for (const key of keys) localStorage.removeItem(key);
    alert("削除しました。画面を再読み込みします。");
    location.reload();
  }

  return (
    <>
    <section aria-label="自動バックアップ" style={{ marginBottom: "1.5rem" }}>
      <h3>定期自動バックアップ(本番)</h3>
      {isAutoBackupSupported() ? (
        <>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "48rem" }}>
            全ローカルデータ(musasabi.*)を、選択したフォルダへ<strong>毎日自動で実バックアップ</strong>します
            (アプリ起動中に期限が来ると実行。起動直後にもキャッチアップ実行)。
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ fontSize: "0.8rem", display: "flex", gap: "0.3rem", alignItems: "center" }}>
              <input type="checkbox" checked={autoBk.enabled} onChange={(e) => toggleAutoBackup(e.target.checked)} />
              自動バックアップを有効化(毎日)
            </label>
            <button type="button" onClick={() => void handleChooseFolder()}>📁 保存先フォルダを選択</button>
            <button type="button" onClick={() => void handleBackupNow()} disabled={bkBusy}>
              {bkBusy ? "保存中…" : "▶ 今すぐバックアップ"}
            </button>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.35rem 0 0" }}>
            保存先: {autoBk.folderPath || "未設定"}
            {autoBk.lastResult && <><br />直近: {autoBk.lastResult}</>}
          </p>
        </>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          自動バックアップはデスクトップ版で利用できます(このブラウザ表示では下の手動バックアップを使用)。
        </p>
      )}
    </section>
    <section aria-label="データ管理" style={{ marginBottom: "1.5rem" }}>
      <h3>データ管理(バックアップ/復元)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
        この端末に保存されたデータ(Memory・コールログ・営業リスト・自動化ルーチン・
        各種設定 = 現在{entryCount}エントリ)をJSONファイルへバックアップ/復元できます。
        処理は端末内で完結し、外部送信はしません。
      </p>
      <button type="button" onClick={() => void handleExport()}>
        バックアップをエクスポート
      </button>{" "}
      <button type="button" onClick={() => fileRef.current?.click()}>
        バックアップから復元
      </button>{" "}
      <button type="button" onClick={handleClearAll} style={{ color: "var(--danger)" }}>
        すべてのローカルデータを削除
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleImport(f);
          e.target.value = "";
        }}
      />
      {note && <p style={{ color: "var(--ok)", margin: "0.5rem 0 0" }}>{note}</p>}
    </section>
    </>
  );
}
