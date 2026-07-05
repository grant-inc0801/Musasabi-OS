#!/usr/bin/env node
// 必須ドキュメントの存在チェック(CI: ci.yml / chatgpt-directive-check.yml)。
// handoff/設計/governance の必須ファイルが1つでも欠けたら失敗させ、
// 「設計書をコードより優先する」運用が壊れていないことを保証する。
// このスクリプトはファイルの存在のみを確認し、内容(秘密情報含む)は出力しない。

"use strict";

const fs = require("fs");
const path = require("path");

const REQUIRED_DOCS = [
  "docs/ai-governance/Development_Bible.md",
  "docs/architecture/ARCHITECTURE.md",
  "docs/architecture/SYSTEM_OVERVIEW.md",
  "docs/ai-handoff/CHATGPT_DIRECTIVE.md",
  "docs/ai-handoff/CHATGPT_CLAUDE_LOOP.md",
  "docs/ai-handoff/CLAUDE_QUESTIONS.md",
  "docs/ai-handoff/CLAUDE_RESPONSE.md",
  "docs/ai-handoff/NEXT_ACTION.md",
  "docs/ai-handoff/STATUS.md",
];

const repoRoot = path.resolve(__dirname, "..", "..");
const missing = [];

for (const rel of REQUIRED_DOCS) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    missing.push(rel);
  } else {
    console.log(`OK       ${rel}`);
  }
}

if (missing.length > 0) {
  console.error("\n必須ドキュメントが不足しています:");
  for (const rel of missing) {
    console.error(`MISSING  ${rel}`);
  }
  process.exit(1);
}

console.log(`\n必須ドキュメント ${REQUIRED_DOCS.length} 件すべて存在します。`);
