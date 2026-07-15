// AI司書定例のE2E: スケジューラで整理提案テンプレを登録→今すぐ実行→
// 候補提案(提案のみ・データ無傷)+要対応イベント(ネットワーク不要・決定論)。

import { startStaticServer, launchPage, assertChecks } from "./helper.mjs";

const PORT = 4504;
const server = await startStaticServer(PORT);
const { browser, page, errors } = await launchPage(() => {
  const now = Date.now();
  localStorage.setItem("musasabi.vaultDocs", JSON.stringify([
    { id: "v-old", title: "実行報告: 旧タスク", text: "古い本文。" + "あ".repeat(500), source: "agent", tags: ["agent"], createdAtMs: now - 86400e3 * 40 },
    { id: "v-new", title: "新しいメモ", text: "新しい本文。", source: "upload", tags: [], createdAtMs: now },
  ]));
});
const checks = {};
try {
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(900);

  await page.click(".cc-settings:has-text('設定')");
  await page.waitForTimeout(400);
  await page.click(".sidebar-group-button:has-text('Workflow')");
  await page.waitForTimeout(300);
  await page.locator(".sidebar-item:has-text('スケジューラ')").first().click();
  await page.waitForTimeout(500);

  await page.selectOption("select[aria-label='テンプレート']", "vault_curation");
  await page.click("button:has-text('+ 定例実行を登録')");
  await page.waitForTimeout(300);
  const card = page.locator(".card", { hasText: "保管庫の整理提案(AI司書)" }).first();
  await card.locator("button:has-text('▶ 今すぐ実行')").click();
  await page.waitForFunction(() => document.body.innerText.includes("整理候補"), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  const text = await card.innerText();
  checks.proposed = text.includes("整理候補が1件") && text.includes("実行報告: 旧タスク");
  checks.proposalOnly = text.includes("承認した場合のみ実行");
  checks.noDeletion = (await page.evaluate(() => JSON.parse(localStorage.getItem("musasabi.vaultDocs")).length)) === 2;
  const events = await page.evaluate(() => JSON.parse(localStorage.getItem("musasabi.appEvents") ?? "[]"));
  checks.warnEvent = events.some((e) => e.title.includes("保管庫の整理候補") && e.level === "warn");
} finally {
  await browser.close();
  server.close();
}
assertChecks("scheduler-curation", checks, errors);
