// ファイル保存。Tauriデスクトップでは保存先を選ぶネイティブダイアログを表示し、
// 選択されたパスへ書き込む。ブラウザ実行時は従来どおりダウンロードにフォールバック。

export type SaveResult = "saved" | "cancelled" | "downloaded";

export async function saveBinaryFile(
  fileName: string,
  bytes: Uint8Array,
  filterName: string,
  extensions: string[],
): Promise<SaveResult> {
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    const path = await save({
      defaultPath: fileName,
      filters: [{ name: filterName, extensions }],
    });
    if (path === null) {
      return "cancelled";
    }
    await writeFile(path, bytes);
    return "saved";
  }
  // ブラウザ: ダウンロードとして保存(保存先はブラウザの設定に従う)。
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}
