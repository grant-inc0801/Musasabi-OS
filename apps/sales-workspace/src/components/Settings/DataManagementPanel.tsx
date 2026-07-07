import { useRef, useState } from "react";
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
    <section aria-label="データ管理" style={{ marginBottom: "1.5rem" }}>
      <h3>データ管理(バックアップ/復元)</h3>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "44rem" }}>
        この端末に保存されたデータ(Memory・コールログ・営業リスト・自動化ルーチン・
        各種設定 = 現在{entryCount}エントリ)をJSONファイルへバックアップ/復元できます。
        VRMアバターファイルは含まれません(設定 &gt; アバター作成で再取り込み)。
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
  );
}
