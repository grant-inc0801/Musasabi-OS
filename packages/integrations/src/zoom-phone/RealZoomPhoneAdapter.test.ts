import { test } from "node:test";
import * as assert from "node:assert/strict";
import { formatDateOnly } from "./RealZoomPhoneAdapter";

test("formatDateOnly uses local date components, not a UTC conversion", () => {
  // 2026-07-05T00:30 in a UTC+9 timezone is 2026-07-04T15:30Z; toISOString().slice(0,10)
  // would incorrectly report "2026-07-04". Constructing from local components instead
  // of a UTC offset string keeps this test timezone-independent while still exercising
  // the same "local midnight edge" the bug was found on.
  const localMidnightPlus30Min = new Date(2026, 6, 5, 0, 30, 0);
  assert.equal(formatDateOnly(localMidnightPlus30Min), "2026-07-05");
});

test("formatDateOnly pads single-digit month and day", () => {
  const date = new Date(2026, 0, 5, 12, 0, 0);
  assert.equal(formatDateOnly(date), "2026-01-05");
});
