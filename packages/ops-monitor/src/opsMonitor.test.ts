import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SLO,
  evaluateSlo,
  getRunbook,
  buildOpsSummary,
  MOCK_METRICS,
  MOCK_INCIDENTS,
  type ServiceMetric,
} from "./index";

test("evaluateSlo は健全なメトリクスを healthy とする", () => {
  const good: ServiceMetric = { service: "s", uptimePercent: 99.99, errorRatePercent: 0.1, p95LatencyMs: 300 };
  assert.equal(evaluateSlo(good), "healthy");
});

test("evaluateSlo は上限超過を breached とする", () => {
  const bad: ServiceMetric = { service: "s", uptimePercent: 98.0, errorRatePercent: 2, p95LatencyMs: 1200 };
  assert.equal(evaluateSlo(bad), "breached");
});

test("evaluateSlo は境界付近を at_risk とする", () => {
  const risk: ServiceMetric = { service: "s", uptimePercent: 99.6, errorRatePercent: 0.8, p95LatencyMs: 700 };
  assert.equal(evaluateSlo(risk), "at_risk");
});

test("getRunbook は復旧手順を返す", () => {
  const rb = getRunbook("rb-restart");
  assert.ok(rb);
  assert.ok(rb.steps.length >= 1);
  assert.equal(getRunbook("nope"), undefined);
});

test("buildOpsSummary は状態別件数と未解決インシデントを集計する", () => {
  const s = buildOpsSummary(MOCK_METRICS, MOCK_INCIDENTS);
  assert.equal(s.services, MOCK_METRICS.length);
  assert.equal(s.healthy + s.atRisk + s.breached, MOCK_METRICS.length);
  assert.equal(s.openIncidents, 1); // inc-01 のみ未解決
  assert.ok(s.avgUptimePercent > 99);
  assert.ok(s.lines.length >= 2);
});

test("空入力でも安全", () => {
  const s = buildOpsSummary([], []);
  assert.equal(s.services, 0);
  assert.equal(s.avgUptimePercent, 0);
  assert.equal(s.openIncidents, 0);
});

test("DEFAULT_SLO は妥当な既定値", () => {
  assert.ok(DEFAULT_SLO.minUptimePercent >= 99);
  assert.ok(DEFAULT_SLO.maxErrorRatePercent <= 5);
});
