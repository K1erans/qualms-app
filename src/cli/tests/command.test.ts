import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";

import { runCommand } from "../command.js";

test("setup uses application configuration and surfaces browser authentication", async (context) => {
  const server = createServer((_request, response) => {
    response.setHeader("content-type", "application/json");
    response.end(
      JSON.stringify({
        status: "pending_auth",
        setupId: "setup-123",
        browserUrl: "https://app.qualms.example/login/setup-123",
        reason: "login",
      }),
    );
  });
  server.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  context.after(() => server.close());

  const { port } = server.address() as AddressInfo;
  const output: string[] = [];
  await runCommand(
    ["setup", "https://github.com/qualms/example.git"],
    { QUALMS_SERVICE_URL: `http://127.0.0.1:${port}` },
    (line) => output.push(line),
  );

  assert.deepEqual(output, [
    "Setup setup-123 needs login.",
    "Continue in your browser: https://app.qualms.example/login/setup-123",
  ]);
});

test("setup requires a configured Qualms service", async () => {
  await assert.rejects(
    () =>
      runCommand(
        ["setup", "https://github.com/qualms/example.git"],
        {},
        () => undefined,
      ),
    /QUALMS_SERVICE_URL must be configured/,
  );
});

test("help documents only the positional setup contract", async () => {
  const output: string[] = [];
  await runCommand(["help"], {}, (line) => output.push(line));

  assert.match(output.join("\n"), /setup <repository-url>/);
  assert.doesNotMatch(output.join("\n"), /--endpoint|-s|current repository/);
});
