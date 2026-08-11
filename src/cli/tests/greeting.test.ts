import assert from "node:assert/strict";
import test from "node:test";

import { parseCommandLine } from "../greeting.js";

test("parses a command and its arguments", () => {
  assert.deepEqual(parseCommandLine("  setup --endpoint http://localhost:3000  "), [
    "setup",
    "--endpoint",
    "http://localhost:3000",
  ]);
});

test("ignores empty input", () => {
  assert.deepEqual(parseCommandLine("   "), []);
});
