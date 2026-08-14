import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { parseRepositoryUrl } from "../../setup/job.js";
import { setupRepository } from "../../setup/workflow.js";
import { createHttpSetupClient } from "../http-client.js";

test("posts setup to the configured Qualms service", async (context) => {
  const requests: Array<{ path: string; body: unknown }> = [];
  const server = createServer(async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    requests.push({
      path: request.url ?? "",
      body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
    });
    response.setHeader("content-type", "application/json");
    response.end(
      JSON.stringify({
        status: "provisioning",
        setupId: "setup-123",
      }),
    );
  });
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  context.after(() => server.close());

  const { port } = server.address() as AddressInfo;
  const client = createHttpSetupClient(`http://127.0.0.1:${port}/api`);
  const result = await setupRepository(
    parseRepositoryUrl("git@gitlab.com:qualms/example.git"),
    client,
  );

  assert.deepEqual(result, { status: "provisioning", setupId: "setup-123" });
  assert.deepEqual(requests, [
    {
      path: "/api/setups",
      body: {
        version: 1,
        repository: {
          url: "git@gitlab.com:qualms/example.git",
          host: "gitlab.com",
          transport: "ssh",
        },
        authentication: {
          method: "project_ssh_key",
          hostKeyVerification: "pending_service_enrollment",
        },
      },
    },
  ]);
});

test("reports runner failures without including response secrets", async (context) => {
  const secret = "service-leaked-token";
  const server = createServer((_request, response) => {
    response.statusCode = 500;
    response.end(`internal failure: ${secret}`);
  });
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  context.after(() => server.close());

  const { port } = server.address() as AddressInfo;
  const client = createHttpSetupClient(`http://127.0.0.1:${port}`);

  await assert.rejects(
    () =>
      setupRepository(
        parseRepositoryUrl("https://github.com/qualms/example.git"),
        client,
      ),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /Qualms service rejected setup \(500\)/);
      assert.doesNotMatch(error.message, new RegExp(secret));
      return true;
    },
  );
});
