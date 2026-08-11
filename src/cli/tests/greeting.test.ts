import assert from "node:assert/strict";
import test from "node:test";

import { greeting } from "../greeting.js";

test("greets kiean", () => {
  assert.equal(greeting(), "hello kiean");
});
