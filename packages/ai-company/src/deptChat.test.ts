import { strict as assert } from "node:assert";
import { test } from "node:test";
import { COMMAND_DEPARTMENTS } from "./commandCenter";
import {
  DEPT_CHAT_MAX_ENTRIES,
  appendChatEntry,
  buildDeptReplyJa,
  parseChatHistory,
  recentEntriesFor,
  type DeptChatEntry,
} from "./deptChat";

const sales = COMMAND_DEPARTMENTS.find((d) => d.id === "sales")!;
const development = COMMAND_DEPARTMENTS.find((d) => d.id === "development")!;
const publishing = COMMAND_DEPARTMENTS.find((d) => d.id === "publishing")!;

test("進捗の問い合わせには進捗率と直近ログを返す", () => {
  const reply = buildDeptReplyJa(sales, "進捗状況を教えて");
  assert.ok(reply.includes("営業部"));
  assert.ok(reply.includes(`${sales.progressPercent}%`));
  assert.ok(reply.includes(sales.logs[0]));
});

test("課題の問い合わせはエラー部署なら原因と対処を返す", () => {
  const reply = buildDeptReplyJa(development, "課題を報告して");
  assert.ok(reply.includes("エラー"));
  assert.ok(reply.includes(development.errorCause!));
  assert.ok(reply.includes(development.errorFix!));
});

test("課題の問い合わせは承認待ち部署なら承認待ちを伝える", () => {
  const reply = buildDeptReplyJa(publishing, "問題ある?");
  assert.ok(reply.includes("承認待ち"));
});

test("タスクの問い合わせにはタスク一覧を返し、その他は受領応答", () => {
  const tasks = buildDeptReplyJa(sales, "優先タスクを教えて");
  for (const t of sales.tasks) assert.ok(tasks.includes(t));
  const other = buildDeptReplyJa(sales, "よろしく");
  assert.ok(other.includes("指示を受領しました"));
  assert.ok(other.includes(sales.tasks[0]));
});

function entry(deptId: string, atMs: number): DeptChatEntry {
  return { deptId, deptName: deptId, message: "m", reply: "r", atMs };
}

test("履歴は新しい順に追加され最大件数で丸められる", () => {
  let history: DeptChatEntry[] = [];
  for (let i = 0; i < DEPT_CHAT_MAX_ENTRIES + 10; i++) {
    history = appendChatEntry(history, entry("sales", i));
  }
  assert.equal(history.length, DEPT_CHAT_MAX_ENTRIES);
  assert.equal(history[0].atMs, DEPT_CHAT_MAX_ENTRIES + 9);
});

test("部署別の直近指示を取り出せる", () => {
  let history: DeptChatEntry[] = [];
  history = appendChatEntry(history, entry("sales", 1));
  history = appendChatEntry(history, entry("hr", 2));
  history = appendChatEntry(history, entry("sales", 3));
  const recent = recentEntriesFor(history, "sales", 3);
  assert.equal(recent.length, 2);
  assert.equal(recent[0].atMs, 3);
});

test("parseChatHistory は壊れた入力で空配列を返す", () => {
  assert.deepEqual(parseChatHistory(null), []);
  assert.deepEqual(parseChatHistory("{broken"), []);
  assert.deepEqual(parseChatHistory('{"a":1}'), []);
  const ok = parseChatHistory(JSON.stringify([entry("sales", 1), { bad: true }]));
  assert.equal(ok.length, 1);
  assert.equal(ok[0].deptId, "sales");
});
