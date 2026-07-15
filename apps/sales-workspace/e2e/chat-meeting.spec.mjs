// チャット会議連結のE2E: 「会議 ◯◯」→ 結論返信+議事録保管庫保存 →
// 「実行 この結論」→ 承認 → 実行完了(ルールベース頭脳・ネットワーク不要)。

import { startStaticServer, launchPage, assertChecks } from "./helper.mjs";

const PORT = 4505;
const server = await startStaticServer(PORT);
const { browser, page, errors } = await launchPage();
const checks = {};
try {
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(900);

  // 会議開催
  await page.fill(".command-chat-input", "会議 新サービスの立ち上げについて");
  await page.click(".send-btn");
  await page.waitForFunction(() => document.body.innerText.includes("AI CEO 結論"), null, { timeout: 30000 });
  const t1 = await page.locator(".cc-chat-dock").innerText();
  checks.meetingHeld = t1.includes("部署AI会議を開催しました");
  checks.runHint = t1.includes("「実行 この結論」");
  const docs = await page.evaluate(() => JSON.parse(localStorage.getItem("musasabi.vaultDocs") ?? "[]"));
  checks.minutesSaved = docs.some((d) => d.title.startsWith("議事録:") && d.source === "agent");

  // 実行 この結論 → 承認 → 完了
  await page.fill(".command-chat-input", "実行 この結論");
  await page.click(".send-btn");
  await page.waitForFunction(() => document.body.innerText.includes("承認"), null, { timeout: 30000 });
  for (let i = 0; i < 5; i++) {
    const done = await page.evaluate(() => document.body.innerText.includes("✅ 実行完了"));
    if (done) break;
    await page.fill(".command-chat-input", "承認");
    await page.click(".send-btn");
    await page.waitForTimeout(1500);
  }
  await page.waitForFunction(() => document.body.innerText.includes("✅ 実行完了"), null, { timeout: 30000 });
  const mem = await page.evaluate(() => JSON.parse(localStorage.getItem("musasabi.memory") ?? "{}"));
  checks.goalFromMeeting = (mem.records ?? []).some(
    (r) => r.action === "チャットから実行指示" && r.detail.includes("会議「新サービスの立ち上げについて」の結論を実行に移す"),
  );
  // 実行報告も保管庫へ自動保存されている
  const docs2 = await page.evaluate(() => JSON.parse(localStorage.getItem("musasabi.vaultDocs") ?? "[]"));
  checks.reportSaved = docs2.some((d) => d.title.startsWith("実行報告:"));
} finally {
  await browser.close();
  server.close();
}
assertChecks("chat-meeting", checks, errors);
