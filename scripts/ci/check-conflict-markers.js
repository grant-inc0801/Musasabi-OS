#!/usr/bin/env node
// マージコンフリクトマーカーの検出(CI: ci.yml)。
// 未解決の Git conflict marker が残ったままマージされるのを防ぐ。
// node_modules / dist / .git などの生成物・VCS内部は対象外。
// マーカー文字列は自己検出を避けるため分割して構築する。

"use strict";

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");

// 7文字のマーカー。文字列連結で書き、このスクリプト自身がヒットしないようにする。
const START = "<".repeat(7) + " ";
const MIDDLE = "=".repeat(7);
const END = ">".repeat(7) + " ";

const IGNORED_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  "target", // Rust ビルド生成物
  "build",
  "out",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".rs", ".toml", ".yml", ".yaml",
  ".html", ".css", ".sh", ".txt",
]);

const hits = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!TEXT_EXTENSIONS.has(ext)) continue;
      scanFile(path.join(dir, entry.name));
    }
  }
}

function scanFile(file) {
  const rel = path.relative(repoRoot, file);
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (line.startsWith(START) || line.startsWith(END) || line === MIDDLE) {
      hits.push(`${rel}:${i + 1}`);
    }
  });
}

walk(repoRoot);

if (hits.length > 0) {
  console.error("マージコンフリクトマーカーが見つかりました:");
  for (const hit of hits) {
    console.error(`  ${hit}`);
  }
  process.exit(1);
}

console.log("マージコンフリクトマーカーは見つかりませんでした。");
