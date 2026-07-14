// E2E ランナー: e2e/*.spec.mjs を順に実行し、1つでも失敗したら非0で終了する。
// 事前に apps/sales-workspace のビルド(dist)が必要(npm run e2e が面倒を見る)。

import { readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const dir = dirname(fileURLToPath(import.meta.url));
if (!existsSync(join(dir, "..", "dist", "index.html"))) {
  console.error("dist がありません。先に npm run build を実行してください。");
  process.exit(1);
}

const specs = readdirSync(dir).filter((f) => f.endsWith(".spec.mjs")).sort();
let failed = 0;
for (const spec of specs) {
  console.log(`\n=== E2E: ${spec} ===`);
  const r = spawnSync(process.execPath, [join(dir, spec)], { stdio: "inherit", timeout: 180000 });
  if (r.status !== 0) {
    failed += 1;
    console.error(`✗ ${spec} failed (exit ${r.status})`);
  } else {
    console.log(`✓ ${spec} passed`);
  }
}
console.log(`\nE2E: ${specs.length - failed}/${specs.length} passed`);
process.exit(failed === 0 ? 0 : 1);
