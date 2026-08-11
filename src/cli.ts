#!/usr/bin/env node

import { greeting } from "./greeting.js";
import {
  createSetupPayload,
  parseSetupArguments,
  resolveGitSource,
  submitSetupPayload,
} from "./setup-job.js";

function showHelp(): void {
  console.log("Usage: qualms [options]");
  console.log("");
  console.log("Options:");
  console.log("  -s, --setup <goal>     Create a remote testing job");
  console.log("      --goal <goal>      Testing goal (alternative to positional goal)");
  console.log("      --test <objective> Add a subtest; may be repeated");
  console.log("      --tests <json>      Add subtests from a JSON string array");
  console.log("      --timeout <mins>   Job timeout in minutes (default: 30)");
  console.log("      --endpoint <url>   POST the job; otherwise print its JSON payload");
  console.log("  -h, --help             Show this help message");
  console.log("  -v, --version          Show the version");
  console.log("");
}

async function main(args: string[]): Promise<void> {
  if (args.length === 0) {
    console.log(greeting());
    return;
  }

  const command = args[0];
  if (command === "--help" || command === "-h") {
    showHelp();
    return;
  }
  if (command === "--version" || command === "-v") {
    console.log("Version: 0.1.0");
    return;
  }
  if (command === "--setup" || command === "-s") {
    const request = parseSetupArguments(args.slice(1));
    const payload = createSetupPayload(resolveGitSource(), request);

    if (request.endpoint) {
      const responseBody = await submitSetupPayload(request.endpoint, payload);
      console.log(responseBody || JSON.stringify({ accepted: true }));
    } else {
      console.log(JSON.stringify(payload, null, 2));
    }
    return;
  }

  throw new Error(`Unknown option: ${command}`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
