import assert from "node:assert/strict";
import test from "node:test";

import {
  createSetupPayload,
  normalizeRepository,
  parseSetupArguments,
} from "../job.js";

test("accepts setup with no test definition", () => {
  assert.deepEqual(parseSetupArguments([]), {});
});

test("accepts a runner endpoint", () => {
  assert.deepEqual(
    parseSetupArguments(["--endpoint", "https://runner.example.com/api"]),
    {
      runnerBaseUrl: "https://runner.example.com/api",
    },
  );
});

test("rejects test definitions during setup", () => {
  assert.throws(
    () => parseSetupArguments(["--test", "Verify login"]),
    /Unknown setup option: --test/,
  );
});

test("creates a setup-only payload", () => {
  const payload = createSetupPayload(
    { repository: "K1erans/qualms-app", commit: "abc123" },
  );

  assert.deepEqual(payload, {
    version: 1,
    source: { repository: "K1erans/qualms-app", commit: "abc123" },
  });
});

test("normalizes GitHub HTTPS and SSH remotes", () => {
  assert.equal(normalizeRepository("https://github.com/K1erans/qualms-app.git"), "K1erans/qualms-app");
  assert.equal(normalizeRepository("git@github.com:K1erans/qualms-app.git"), "K1erans/qualms-app");
});
