import { strict as assert } from "node:assert";
import { test } from "node:test";
import { GLOSSARY, HELP_FAQ, HELP_TOPICS } from "./help";

test("ヘルプの機能ガイドは主要ページを網羅する", () => {
  assert.ok(HELP_TOPICS.length >= 8);
  const pages = new Set(HELP_TOPICS.map((t) => t.page));
  for (const p of ["workspace", "operations", "company_dashboard", "workflow", "collaboration"]) {
    assert.ok(pages.has(p), `missing ${p}`);
  }
  for (const t of HELP_TOPICS) {
    assert.ok(t.title.length > 0);
    assert.ok(t.description.length > 0);
  }
});

test("用語集とFAQが定義されている", () => {
  assert.ok(GLOSSARY.length >= 5);
  for (const g of GLOSSARY) {
    assert.ok(g.term.length > 0 && g.definition.length > 0);
  }
  assert.ok(HELP_FAQ.length >= 3);
  for (const f of HELP_FAQ) {
    assert.ok(f.question.length > 0 && f.answer.length > 0);
  }
});
