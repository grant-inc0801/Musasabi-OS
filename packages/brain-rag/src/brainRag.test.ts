import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import {
  DEFAULT_RAG_SETTINGS,
  HashEmbeddings,
  OllamaEmbeddings,
  VectorIndex,
  buildRagContext,
  detectEmbeddings,
  indexDocuments,
} from "./index";

// Ollama 互換 /api/embeddings エミュレータ(決定論: 単語の共起でベクトル生成)
function startFakeEmbeddings(port: number): Promise<Server> {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (req.url === "/api/embeddings" && req.method === "POST") {
        let body = "";
        req.on("data", (c) => (body += c));
        req.on("end", () => {
          const { prompt } = JSON.parse(body) as { prompt: string };
          // 決定論埋め込み: 語彙8軸(営業/調査/マーケ/経理/開発/顧客/レポート/承認)
          const axes = ["営業", "調査", "マーケ", "経理", "開発", "顧客", "レポート", "承認"];
          const embedding = axes.map((a) => (prompt.includes(a) ? 1 : 0.01));
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ embedding }));
        });
        return;
      }
      res.writeHead(404);
      res.end();
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

test("ハッシュ埋め込みは決定論で、語彙が重なるほど類似が高い", async () => {
  const h = new HashEmbeddings();
  const a1 = await h.embed("営業リストを作成して架電する");
  const a2 = await h.embed("営業リストを作成して架電する");
  assert.deepEqual(a1, a2);
  const idx = new VectorIndex();
  await indexDocuments(idx, h, [
    { id: "m1", text: "営業リストを作成して架電を開始した" },
    { id: "m2", text: "経理部が月次仕訳をExcelへ出力した" },
  ]);
  const hits = await idx.search("営業の架電リスト", h, 2, 0);
  assert.equal(hits[0].doc.id, "hash:m1");
});

test("Ollama互換エミュレータで実HTTP埋め込み→意味検索が動く", async () => {
  const server = await startFakeEmbeddings(43121);
  try {
    const settings = { baseUrl: "http://127.0.0.1:43121", embedModel: "nomic-embed-text" };
    const detected = await detectEmbeddings(settings);
    assert.equal(detected.source, "ollama");
    const idx = new VectorIndex();
    const added = await indexDocuments(idx, detected.provider, [
      { id: "m1", text: "市場調査部が競合3社の調査レポートを作成", meta: { 分類: "work" } },
      { id: "m2", text: "経理部が月次収支を確定", meta: { 分類: "work" } },
      { id: "m3", text: "マーケ部がSNS投稿ドラフトを作成", meta: { 分類: "work" } },
    ]);
    assert.equal(added, 3);
    const hits = await idx.search("調査 レポート", detected.provider, 2);
    assert.equal(hits[0].doc.id, "ollama:m1");
    const ctx = buildRagContext(hits);
    assert.ok(ctx.includes("市場調査部"));
    assert.ok(ctx.includes("分類:work"));
  } finally {
    server.close();
  }
});

test("埋め込みサーバ未検出時はハッシュ埋め込みへフォールバック", async () => {
  const detected = await detectEmbeddings({ baseUrl: "http://127.0.0.1:43299", embedModel: "x" });
  assert.equal(detected.source, "fallback");
  assert.equal(detected.provider.kind, "hash");
});

test("増分索引: 既存IDはスキップされ、シリアライズ→復元できる", async () => {
  const h = new HashEmbeddings();
  const idx = new VectorIndex();
  await indexDocuments(idx, h, [{ id: "a", text: "顧客サポートの問い合わせ対応" }]);
  const again = await indexDocuments(idx, h, [
    { id: "a", text: "顧客サポートの問い合わせ対応" },
    { id: "b", text: "開発部がエラー修正をリリース" },
  ]);
  assert.equal(again, 1);
  assert.equal(idx.size, 2);
  const restored = VectorIndex.fromJSON(JSON.stringify(idx.toJSON()));
  assert.equal(restored.size, 2);
  const hits = await restored.search("開発 エラー", h, 1, 0);
  assert.equal(hits[0].doc.id, "hash:b");
});

test("壊れたJSONからの復元は空索引になり、既定設定はlocalhost", () => {
  const idx = VectorIndex.fromJSON("{broken");
  assert.equal(idx.size, 0);
  assert.ok(DEFAULT_RAG_SETTINGS.baseUrl.includes("127.0.0.1"));
  const o = new OllamaEmbeddings();
  assert.ok(o.name.includes("nomic-embed-text"));
});
