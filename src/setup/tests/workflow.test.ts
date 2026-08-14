import assert from "node:assert/strict";
import test from "node:test";

import { parseRepositoryUrl } from "../job.js";
import { setupRepository } from "../workflow.js";

test("submits one repository setup and returns its state", async () => {
  const repository = parseRepositoryUrl(
    "https://github.com/qualms/example.git",
  );

  const result = await setupRepository(repository, {
    async setup(request) {
      assert.deepEqual(request, {
        version: 1,
        repository: {
          url: "https://github.com/qualms/example.git",
          host: "github.com",
          transport: "https",
        },
        authentication: { method: "https_credentials" },
      });
      return {
        status: "pending_auth",
        setupId: "setup-123",
        browserUrl: "https://app.qualms.example/setup/setup-123",
        reason: "repository_credentials",
      };
    },
  });

  assert.deepEqual(result, {
    status: "pending_auth",
    setupId: "setup-123",
    browserUrl: "https://app.qualms.example/setup/setup-123",
    reason: "repository_credentials",
  });
});
