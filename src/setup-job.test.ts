import assert from "node:assert/strict";
import test from "node:test";

import {
  createSetupPayload,
  normalizeRepository,
  parseSetupArguments,
} from "./setup-job.js";

test("parses a goal and repeatable subtests", () => {
  assert.deepEqual(
    parseSetupArguments([
      "Confirm the critical journey works",
      "--test",
      "Verify the application starts",
      "--test",
      "Verify login works",
      "--timeout",
      "15",
    ]),
    {
      goal: "Confirm the critical journey works",
      subtests: ["Verify the application starts", "Verify login works"],
      timeoutMinutes: 15,
    },
  );
});

test("requires at least one subtest", () => {
  assert.throws(
    () => parseSetupArguments(["Test the application"]),
    /At least one subtest is required/,
  );
});

test("accepts subtests as a JSON array", () => {
  assert.deepEqual(
    parseSetupArguments([
      "--goal",
      "Confirm login works",
      "--tests",
      '["Verify signup", "Verify login"]',
    ]),
    {
      goal: "Confirm login works",
      subtests: ["Verify signup", "Verify login"],
      timeoutMinutes: 30,
    },
  );
});

test("rejects invalid subtest arrays", () => {
  assert.throws(
    () => parseSetupArguments(["A goal", "--tests", "[]"]),
    /non-empty JSON array/,
  );
});

test("creates stable, unique subtest identifiers", () => {
  const payload = createSetupPayload(
    { repository: "K1erans/qualms-app", commit: "abc123" },
    {
      goal: "Confirm login works",
      subtests: ["Verify login works", "Verify login works"],
      timeoutMinutes: 30,
    },
  );

  assert.deepEqual(payload, {
    version: 1,
    source: { repository: "K1erans/qualms-app", commit: "abc123" },
    goal: "Confirm login works",
    subtests: [
      { id: "verify-login-works", objective: "Verify login works" },
      { id: "verify-login-works-2", objective: "Verify login works" },
    ],
    limits: { timeoutMinutes: 30 },
  });
});

test("normalizes GitHub HTTPS and SSH remotes", () => {
  assert.equal(normalizeRepository("https://github.com/K1erans/qualms-app.git"), "K1erans/qualms-app");
  assert.equal(normalizeRepository("git@github.com:K1erans/qualms-app.git"), "K1erans/qualms-app");
});
