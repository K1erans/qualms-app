import assert from "node:assert/strict";
import test from "node:test";

import { parseCommandLine } from "../greeting.js";

test("parses a command and its arguments", () => {
  assert.deepEqual(parseCommandLine("  setup git@example.com:team/repo.git  "), [
    "setup",
    "git@example.com:team/repo.git",
  ]);
});

test("ignores empty input", () => {
  assert.deepEqual(parseCommandLine("   "), []);
});
