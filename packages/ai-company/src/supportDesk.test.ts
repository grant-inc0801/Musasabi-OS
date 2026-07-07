import { strict as assert } from "node:assert";
import { test } from "node:test";
import { COMMAND_DEPARTMENTS } from "./commandCenter";
import {
  FAQ_ITEMS,
  SUPPORT_STAFF,
  SUPPORT_TICKETS,
  TICKET_STATUSES,
  TICKET_STATUS_COLOR,
  buildSupportKpi,
  setTicketStatus,
} from "./supportDesk";

test("サポートKPIはチケットのステータス数と整合する", () => {
  const kpi = buildSupportKpi(SUPPORT_TICKETS);
  assert.equal(
    kpi.openCount + kpi.inProgressCount + kpi.answeredCount + kpi.closedCount,
    SUPPORT_TICKETS.length,
  );
  assert.ok(kpi.openCount >= 1);
  assert.equal(kpi.faqCount, FAQ_ITEMS.length);
});

test("setTicketStatus は対象のみ変更し元配列を壊さない", () => {
  const next = setTicketStatus(SUPPORT_TICKETS, "T-1041", "対応中");
  assert.equal(next.find((t) => t.id === "T-1041")?.status, "対応中");
  assert.equal(SUPPORT_TICKETS.find((t) => t.id === "T-1041")?.status, "未対応");
  const unchanged = setTicketStatus(SUPPORT_TICKETS, "T-9999", "クローズ");
  assert.deepEqual(unchanged, [...SUPPORT_TICKETS]);
});

test("全ステータスに色が定義されている", () => {
  for (const s of TICKET_STATUSES) {
    assert.match(TICKET_STATUS_COLOR[s], /^#/);
  }
});

test("AI社員数は部署一覧(Command Center)の人数と整合する", () => {
  const support = COMMAND_DEPARTMENTS.find((d) => d.id === "support")!;
  assert.equal(SUPPORT_STAFF.length, support.memberCount);
});
