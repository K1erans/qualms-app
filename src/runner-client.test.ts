import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { createHttpRunnerClient } from "./runner-client.js";
import { setupWithHelloWorldTest } from "./setup-workflow.js";

test("submits setup and test creation as separate runner requests", async (context) => {
  const requests: Array<{ path: string; body: unknown }> = [];
  const server = createServer(async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) {
      chunks.push(Buffer.from(chunk));
    }
    requests.push({
      path: request.url ?? "",
      body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    });

    response.setHeader("content-type", "application/json");
    response.end(JSON.stringify({ id: request.url === "/api/setups" ? "setup-123" : "test-456" }));
  });
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  context.after(() => server.close());

  const { port } = server.address() as AddressInfo;
  const runner = createHttpRunnerClient(`http://127.0.0.1:${port}/api`);

  assert.deepEqual(
    await setupWithHelloWorldTest(
      { repository: "K1erans/qualms-app", commit: "abc123" },
      runner,
    ),
    { setupId: "setup-123", testId: "test-456" },
  );
  assert.deepEqual(requests, [
    {
      path: "/api/setups",
      body: {
        version: 1,
        source: { repository: "K1erans/qualms-app", commit: "abc123" },
      },
    },
    {
      path: "/api/tests",
      body: {
        version: 1,
        setupId: "setup-123",
        objective: "Hello World",
      },
    },
  ]);
});
