#!/usr/bin/env node
// 秘密情報らしきパターンの検出(CI: ci.yml)。
// 実APIキー・秘密鍵・トークンが誤ってコミットされるのを防ぐ。
// 重要: 検出しても値そのものは出力せず、ファイル:行番号とパターン名のみ報告する
// (secrets 値を絶対に出力しない、というルールに従う)。
// readiness UI 等で使うダミー値(dummy/placeholder/example/your-...)は許容する。

"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");

const IGNORED_DIRS = new Set([
  "node_modules", "dist", ".git", "target", "build", "out",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".rs", ".toml", ".yml", ".yaml",
  ".html", ".css", ".sh", ".txt", ".env",
]);

// パターンは name と regex のペア。誤検出を避けるため、明確に秘密情報である
// 形式のみを対象にする。
const PATTERNS = [
  { name: "PRIVATE KEY block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "AWS Access Key ID", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "GitHub personal access token", regex: /\bghp_[A-Za-z0-9]{36}\b/ },
  { name: "GitHub fine-grained token", regex: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/ },
  { name: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { name: "OpenAI API key", regex: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { name: "Google API key", regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
];

// ダミー値と判断できる語を含む行は除外する(readiness UI のプレースホルダ等)。
const DUMMY_HINT = /(dummy|placeholder|example|your[-_]|xxxxx|<[^>]+>|proxy-injected)/i;

// このスクリプト自身とテスト用フィクスチャは走査対象から外す
// (パターン文字列で自己検出しないように)。
const SELF = path.relative(repoRoot, __filename);

const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!TEXT_EXTENSIONS.has(ext) && entry.name !== ".env") continue;
      scanFile(path.join(dir, entry.name));
    }
  }
}

function scanFile(file) {
  const rel = path.relative(repoRoot, file);
  if (rel === SELF) return;
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (DUMMY_HINT.test(line)) return;
    for (const { name, regex } of PATTERNS) {
      if (regex.test(line)) {
        // 値は出力しない。ファイル:行:パターン名のみ。
        hits.push(`${rel}:${i + 1}  [${name}]`);
      }
    }
  });
}

walk(repoRoot);

if (hits.length > 0) {
  console.error("秘密情報らしきパターンが見つかりました(値は表示しません):");
  for (const hit of hits) {
    console.error(`  ${hit}`);
  }
  console.error("\nダミー値であれば dummy/placeholder/example 等の語を併記してください。");
  process.exit(1);
}

console.log("秘密情報らしきパターンは見つかりませんでした。");
