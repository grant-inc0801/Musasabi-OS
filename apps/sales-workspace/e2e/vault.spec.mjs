// 保管庫E2E: 取込 → 一覧 → 編集 → 削除(実文書ストアの基本往復)。

import { startStaticServer, launchPage, assertChecks } from "./helper.mjs";

const PORT = 4502;
const server = await startStaticServer(PORT);
const { browser, page, errors } = await launchPage();
const checks = {};
try {
  await page.goto(`http://localhost:${PORT}/`);
  await page.waitForTimeout(900);

  // 保管庫ページへ
  await page.click(".cc-settings:has-text('設定')");
  await page.waitForTimeout(400);
  await page.click(".sidebar-group-button:has-text('Knowledge')");
  await page.waitForTimeout(300);
  await page.locator(".sidebar-item:has-text('保管庫(Knowledge Vault)')").first().click();
  await page.waitForTimeout(500);

  // 取込
  await page.setInputFiles("input[aria-label='保管庫へ取り込むファイル']", {
    name: "テスト資料.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("E2E用のテスト資料本文。", "utf8"),
  });
  await page.waitForFunction(() => document.body.innerText.includes("1件の資料を保管庫へ保存しました"), null, { timeout: 10000 });
  checks.imported = (await page.locator("section[aria-label='保管資料一覧']").innerText()).includes("テスト資料");

  // 編集(タイトル変更)
  await page.locator("button:has-text('編集')").first().click();
  await page.fill("input[aria-label='タイトルを編集']", "テスト資料 改訂版");
  await page.locator("button:has-text('保存')").first().click();
  await page.waitForTimeout(300);
  checks.edited = (await page.locator("section[aria-label='保管資料一覧']").innerText()).includes("テスト資料 改訂版");

  // 削除
  await page.locator("section[aria-label='保管資料一覧'] button:has-text('削除')").first().click();
  await page.waitForFunction(() => document.body.innerText.includes("を保管庫から削除しました"), null, { timeout: 10000 });
  checks.removed = (await page.evaluate(() => JSON.parse(localStorage.getItem("musasabi.vaultDocs") ?? "[]").length)) === 0;
} finally {
  await browser.close();
  server.close();
}
assertChecks("vault", checks, errors);
