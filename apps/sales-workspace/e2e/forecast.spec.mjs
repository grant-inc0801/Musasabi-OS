// 未来予測E2E: AGI深層予測(ルールベース頭脳)→ 較正表示 → レポート保管庫自動保存 →
// 的中率トラッキングに pending 登録(ネットワーク不要・決定論)。

import { startStaticServer, launchPage, assertChecks } from "./helper.mjs";

const PORT = 4503;
const server = await startStaticServer(PORT);
const { browser, page, errors } = await launchPage();
const checks = {};
try {
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(900);

  await page.click(".cc-settings:has-text('設定')");
  await page.waitForTimeout(400);
  await page.click(".sidebar-group-button:has-text('Departments')");
  await page.waitForTimeout(300);
  await page.locator(".sidebar-item:has-text('市場調査部')").first().click();
  await page.waitForTimeout(600);

  await page.locator("button:has-text('AGI深層予測')").click();
  await page.waitForFunction(() => document.body.innerText.includes("較正後 63%"), null, { timeout: 30000 });
  checks.calibrated = true;
  checks.selectedLeaf = (await page.locator("section[aria-label='未来予測']").innerText()).includes("選出(最も現実性が高い)");

  // レポートの保管庫自動保存+的中率 pending 登録
  const docs = await page.evaluate(() => JSON.parse(localStorage.getItem("musasabi.vaultDocs") ?? "[]"));
  checks.reportSaved = docs.some((d) => d.title.startsWith("未来予測レポート:") && d.source === "agent");
  const outcomes = await page.evaluate(() => JSON.parse(localStorage.getItem("musasabi.forecastOutcomes") ?? "[]"));
  checks.pendingTracked = outcomes.some((o) => o.status === "pending");
} finally {
  await browser.close();
  server.close();
}
assertChecks("forecast", checks, errors);
