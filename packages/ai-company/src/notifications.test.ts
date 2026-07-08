import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  NOTIFICATION_LEVEL_COLOR,
  buildNotifications,
  parseReadIds,
  unreadNotifications,
} from "./notifications";

test("通知は承認・エラー・注意を集約する", () => {
  const items = buildNotifications();
  assert.ok(items.length >= 3);
  const levels = new Set(items.map((i) => i.level));
  assert.ok(levels.has("承認"));
  assert.ok(levels.has("エラー"));
  assert.ok(levels.has("注意"));
  for (const i of items) {
    assert.ok(i.id.length > 0);
    assert.ok(i.title.length > 0);
    assert.match(NOTIFICATION_LEVEL_COLOR[i.level], /^#/);
  }
});

test("既読IDを除いた未読通知を返す", () => {
  const items = buildNotifications();
  const firstId = items[0].id;
  const unread = unreadNotifications(items, new Set([firstId]));
  assert.equal(unread.length, items.length - 1);
  assert.ok(!unread.some((i) => i.id === firstId));
});

test("parseReadIds は不正入力を空集合にする", () => {
  assert.equal(parseReadIds(null).size, 0);
  assert.equal(parseReadIds("{broken").size, 0);
  assert.equal(parseReadIds('{"a":1}').size, 0);
  const s = parseReadIds('["x","y",1]');
  assert.ok(s.has("x") && s.has("y"));
  assert.equal(s.size, 2);
});
