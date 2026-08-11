import assert from "node:assert/strict";
import test from "node:test";

import { setupWithHelloWorldTest } from "./workflow.js";

test("creates a Hello World test after setup", async () => {
  const result = await setupWithHelloWorldTest(
    { repository: "K1erans/qualms-app", commit: "abc123" },
    {
      async createSetup(payload) {
        assert.deepEqual(payload, {
          version: 1,
          source: { repository: "K1erans/qualms-app", commit: "abc123" },
        });
        return { id: "setup-123" };
      },
      async createTest(payload) {
        assert.deepEqual(payload, {
          version: 1,
          setupId: "setup-123",
          objective: "Hello World",
        });
        return { id: "test-456" };
      },
    },
  );

  assert.deepEqual(result, {
    setupId: "setup-123",
    testId: "test-456",
  });
});
