import { createHttpSetupClient } from "../runner/http-client.js";
import { parseSetupArguments } from "../setup/job.js";
import type { SetupResult } from "../setup/types.js";
import { setupRepository } from "../setup/workflow.js";

type Environment = Record<string, string | undefined>;
type WriteLine = (line: string) => void;

export async function runCommand(
  args: string[],
  environment: Environment = process.env,
  writeLine: WriteLine = console.log,
): Promise<void> {
  const command = args[0];
  if (command === "help" || command === "--help" || command === "-h") {
    showHelp(writeLine);
    return;
  }
  if (command === "version" || command === "--version" || command === "-v") {
    writeLine("Version: 0.1.0");
    return;
  }
  if (command === "setup") {
    const options = parseSetupArguments(args.slice(1));
    const serviceUrl = readServiceUrl(environment.QUALMS_SERVICE_URL);
    const result = await setupRepository(
      options.repository,
      createHttpSetupClient(serviceUrl, environment.QUALMS_ACCESS_TOKEN),
    );
    writeSetupResult(result, writeLine);
    return;
  }

  throw new Error(`Unknown command: ${command ?? ""}`);
}

function showHelp(writeLine: WriteLine): void {
  writeLine("Usage: qualms <command>");
  writeLine("");
  writeLine("Commands:");
  writeLine("  setup <repository-url>  Register a Git repository");
  writeLine("  help                    Show this help message");
  writeLine("  version                 Show the version");
  writeLine("  exit, quit              Exit interactive mode");
}

function readServiceUrl(configuredValue: string | undefined): string {
  if (!configuredValue) {
    throw new Error("QUALMS_SERVICE_URL must be configured");
  }

  let url: URL;
  try {
    url = new URL(configuredValue);
  } catch {
    throw new Error("QUALMS_SERVICE_URL must be a valid URL");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("QUALMS_SERVICE_URL must not contain credentials, a query, or a fragment");
  }
  if (url.protocol !== "https:" && !isLocalHttp(url)) {
    throw new Error(
      "QUALMS_SERVICE_URL must use HTTPS (HTTP is only allowed for localhost)",
    );
  }
  return url.toString();
}

function writeSetupResult(result: SetupResult, writeLine: WriteLine): void {
  switch (result.status) {
    case "pending_auth":
      writeLine(`Setup ${result.setupId} needs ${formatReason(result.reason)}.`);
      writeLine(`Continue in your browser: ${result.browserUrl}`);
      return;
    case "provisioning":
      writeLine(`Setup ${result.setupId} is provisioning.`);
      return;
    case "ready":
      writeLine(`Project ${result.projectId} is ready (setup ${result.setupId}).`);
      return;
    case "failed":
      throw new Error(`${result.message} Setup: ${result.setupId}`);
  }
}

function formatReason(reason: Extract<SetupResult, { status: "pending_auth" }>["reason"]): string {
  switch (reason) {
    case "login":
      return "login";
    case "repository_credentials":
      return "repository credentials";
    case "ssh_public_key":
      return "SSH public-key installation";
  }
}

function isLocalHttp(url: URL): boolean {
  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]")
  );
}
