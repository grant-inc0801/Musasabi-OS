// チャットコマンドのE2E: ヘルプ/今日何した?/接続診断(LLM不要の決定論コマンド)。

import { startStaticServer, launchPage, assertChecks } from "./helper.mjs";

const PORT = 4501;
const server = await startStaticServer(PORT);
const { browser, page, errors } = await launchPage(() => {
  const now = Date.now();
  localStorage.setItem("musasabi.appEvents", JSON.stringify([
    { id: "e1", level: "warn", title: "Musasabi — 承認待ち", detail: "新サービス", atMs: now - 1200e3, read: false },
  ]));
  localStorage.setItem("musasabi.vaultDocs", JSON.stringify([
    { id: "v1", title: "価格戦略メモ", text: "月額980円プランを軸とした価格戦略。", source: "upload", tags: [], createdAtMs: now },
  ]));
});
const checks = {};
try {
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(900);

  // ヘルプ
  await page.fill(".command-chat-input", "ヘルプ");
  await page.click(".send-btn");
  await page.waitForFunction(() => document.body.innerText.includes("使えるコマンド"), null, { timeout: 15000 });
  const t1 = await page.locator(".cc-chat-dock").innerText();
  checks.help = t1.includes("保管庫で◯◯を探して") && t1.includes("接続状況は?");

  // 今日何した?
  await page.fill(".command-chat-input", "今日何した?");
  await page.click(".send-btn");
  await page.waitForFunction(() => document.body.innerText.includes("今日の動き(実データ)"), null, { timeout: 15000 });
  const t2 = await page.locator(".cc-chat-dock").innerText();
  checks.today = t2.includes("保管庫は1件") && t2.includes("未読の要対応");

  // 保管庫検索
  await page.fill(".command-chat-input", "保管庫で価格戦略を探して");
  await page.click(".send-btn");
  await page.waitForFunction(() => document.body.innerText.includes("保管庫から"), null, { timeout: 15000 });
  checks.vaultSearch = (await page.locator(".cc-chat-dock").innerText()).includes("月額980円");

  // 接続診断(全ローカルAI未接続 → 🟡/🔴+ヒント)
  await page.fill(".command-chat-input", "接続状況は?");
  await page.click(".send-btn");
  await page.waitForFunction(() => document.body.innerText.includes("ローカルAI連携の診断結果"), null, { timeout: 30000 });
  const t4 = await page.locator(".cc-chat-dock").innerText();
  checks.diagnostics = t4.includes("🟡 LLM頭脳(Ollama)") && t4.includes("💡");
} finally {
  await browser.close();
  server.close();
}
assertChecks("chat-commands", checks, errors);
