#!/usr/bin/env node
// handoff docs の現在状態サマリ(CI: handoff-status.yml、手動実行)。
// 最新Directive ID / 最新Claude Response / Pending Questions / Next Action を
// 抽出して出力する。ファイル内容の要点のみを扱い、秘密情報は扱わない。

"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");

function read(rel) {
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

function firstMatch(text, regex) {
  if (!text) return null;
  const m = text.match(regex);
  return m ? m[0].trim() : null;
}

function section(title) {
  console.log(`\n## ${title}`);
}

// 最新Directive ID(CHATGPT_DIRECTIVE.md または DECISION_LOG.md の D-YYYYMMDD-NNN)
const directive = read("docs/ai-handoff/CHATGPT_DIRECTIVE.md") || "";
const decisionLog = read("docs/ai-handoff/DECISION_LOG.md") || "";
const directiveIds = (directive + "\n" + decisionLog).match(/D-\d{8}-\d{3}/g) || [];
const latestDirective = directiveIds.length > 0 ? directiveIds.sort().slice(-1)[0] : "(なし)";

// 最新Claude Response のエントリ見出し
const response = read("docs/ai-handoff/CLAUDE_RESPONSE.md") || "";
const responseHeading = firstMatch(response, /^## .+$/m) || "(なし)";

// Pending Questions(CLAUDE_QUESTIONS.md の未解決見出し)
const questions = read("docs/ai-handoff/CLAUDE_QUESTIONS.md") || "";
const questionHeadings = (questions.match(/^#{1,3} .+$/gm) || []).filter(
  (h) => !/解決|resolved|closed/i.test(h),
);

// Current Next Action(NEXT_ACTION.md の Claude Code 向けセクション先頭)
const nextAction = read("docs/ai-handoff/NEXT_ACTION.md") || "";

console.log("# Musasabi OS handoff status");
section("最新Directive ID");
console.log(latestDirective);

section("最新Claude Response");
console.log(responseHeading);

section("Pending Questions");
if (questionHeadings.length === 0) {
  console.log("(未解決の質問見出しは検出されませんでした)");
} else {
  for (const h of questionHeadings.slice(0, 20)) console.log(`- ${h.replace(/^#+\s*/, "")}`);
}

section("Current Next Action");
console.log(nextAction ? nextAction.split(/\r?\n/).slice(0, 40).join("\n") : "(なし)");
