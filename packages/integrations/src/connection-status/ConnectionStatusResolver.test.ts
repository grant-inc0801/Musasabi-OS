import { test } from "node:test";
import * as assert from "node:assert/strict";
import { resolveConnectionStatus, isDraftComplete } from "./ConnectionStatusResolver";
import { REQUIRED_CREDENTIAL_FIELDS } from "./types";

test("resolveConnectionStatus: default (setup not started) is mock_connected", () => {
  const status = resolveConnectionStatus({
    setupStarted: false,
    wasReset: false,
    requiredFieldsFilled: false,
    hasValidationError: false,
  });
  assert.equal(status, "mock_connected");
});

test("resolveConnectionStatus: setup started but incomplete is pending_setup", () => {
  const status = resolveConnectionStatus({
    setupStarted: true,
    wasReset: false,
    requiredFieldsFilled: false,
    hasValidationError: false,
  });
  assert.equal(status, "pending_setup");
});

test("resolveConnectionStatus: all required fields filled is production_ready", () => {
  const status = resolveConnectionStatus({
    setupStarted: true,
    wasReset: false,
    requiredFieldsFilled: true,
    hasValidationError: false,
  });
  assert.equal(status, "production_ready");
});

test("resolveConnectionStatus: explicit reset is disconnected even if fields were filled", () => {
  const status = resolveConnectionStatus({
    setupStarted: true,
    wasReset: true,
    requiredFieldsFilled: true,
    hasValidationError: false,
  });
  assert.equal(status, "disconnected");
});

test("resolveConnectionStatus: validation error takes priority over every other flag", () => {
  const status = resolveConnectionStatus({
    setupStarted: true,
    wasReset: true,
    requiredFieldsFilled: true,
    hasValidationError: true,
  });
  assert.equal(status, "error");
});

test("isDraftComplete: null draft is never complete", () => {
  assert.equal(isDraftComplete(null, REQUIRED_CREDENTIAL_FIELDS.filemaker), false);
});

test("isDraftComplete: missing a required field is incomplete", () => {
  const draft = { host: "dummy-host", database: "dummy-db", username: "dummy-user" };
  assert.equal(isDraftComplete(draft, REQUIRED_CREDENTIAL_FIELDS.filemaker), false);
});

test("isDraftComplete: whitespace-only value counts as missing", () => {
  const draft = { host: "dummy-host", database: "dummy-db", username: "dummy-user", password: "   " };
  assert.equal(isDraftComplete(draft, REQUIRED_CREDENTIAL_FIELDS.filemaker), false);
});

test("isDraftComplete: all required fields present is complete", () => {
  const draft = {
    accountId: "dummy-account",
    clientId: "dummy-client",
    clientSecret: "dummy-secret",
  };
  assert.equal(isDraftComplete(draft, REQUIRED_CREDENTIAL_FIELDS.zoom_phone), true);
});
