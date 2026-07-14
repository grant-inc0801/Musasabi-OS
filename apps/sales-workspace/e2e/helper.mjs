// E2E 共通ヘルパー(完全ローカル・外部送信なし)。
// dist を静的配信し、chromium を起動する。ブラウザ実行ファイルは
// 1) CHROMIUM_PATH 環境変数 2) playwright パッケージ 3) /opt/pw-browsers/chromium の順で解決。

import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
};

/** dist を配信する静的サーバを起動する。 */
export function startStaticServer(port) {
  const server = createServer((req, res) => {
    const path = join(DIST, req.url === "/" ? "index.html" : req.url.split("?")[0]);
    if (!existsSync(path)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": MIME[extname(path)] ?? "application/octet-stream" });
    res.end(readFileSync(path));
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

/** chromium の実行ファイルパスを解決する。 */
export async function resolveChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  try {
    const { chromium } = await import("playwright");
    const p = chromium.executablePath();
    if (p && existsSync(p)) return p;
  } catch {
    /* playwright 未導入なら次へ */
  }
  if (existsSync("/opt/pw-browsers/chromium")) return "/opt/pw-browsers/chromium";
  throw new Error("chromium が見つかりません(CHROMIUM_PATH を設定するか npx playwright install chromium)");
}

/** ブラウザ+ページを起動する。テスト用の共通初期状態(セットアップ完了)を注入する。 */
export async function launchPage(initScript) {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ executablePath: await resolveChromium(), args: ["--use-gl=swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.addInitScript(() => {
    localStorage.setItem("musasabi.setupState", JSON.stringify({ completedSteps: ["welcome", "avatar", "integrations", "done"] }));
    localStorage.setItem("musasabi.llmSettings", JSON.stringify({ baseUrl: "http://127.0.0.1:9", model: "qwen2.5:0.5b" }));
  });
  if (initScript) await page.addInitScript(initScript);
  return { browser, page, errors };
}

/** チェック結果を検証して報告する。失敗があれば throw。 */
export function assertChecks(name, checks, errors) {
  const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  console.log(`[${name}] CHECKS:`, JSON.stringify(checks));
  console.log(`[${name}] PAGE_ERRORS:`, errors.length, errors.slice(0, 3));
  if (failed.length > 0 || errors.length > 0) {
    throw new Error(`${name} failed: checks=[${failed.join(",")}] pageErrors=${errors.length}`);
  }
}
