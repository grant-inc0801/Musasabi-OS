import { test } from "node:test";
import * as assert from "node:assert/strict";
import { MockCredentialStore } from "./CredentialStore";

test("save then get returns a copy of the draft, not the same reference", () => {
  const store = new MockCredentialStore();
  const draft = { host: "dummy-host" };
  store.save("filemaker", draft);

  const retrieved = store.get("filemaker");
  assert.deepEqual(retrieved, draft);
  assert.notEqual(retrieved, draft);
});

test("get returns null for an integration with no saved draft", () => {
  const store = new MockCredentialStore();
  assert.equal(store.get("zoom_phone"), null);
});

test("clear removes the saved draft", () => {
  const store = new MockCredentialStore();
  store.save("filemaker", { host: "dummy-host" });
  store.clear("filemaker");
  assert.equal(store.get("filemaker"), null);
});

test("drafts for different integrations do not overwrite each other", () => {
  const store = new MockCredentialStore();
  store.save("filemaker", { host: "dummy-fm" });
  store.save("zoom_phone", { accountId: "dummy-zoom" });

  assert.deepEqual(store.get("filemaker"), { host: "dummy-fm" });
  assert.deepEqual(store.get("zoom_phone"), { accountId: "dummy-zoom" });
});
