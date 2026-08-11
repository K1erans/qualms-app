#!/usr/bin/env node

import { greeting } from "./greeting.js";
import { createHttpRunnerClient } from "./runner-client.js";
import {
  createSetupPayload,
  parseSetupArguments,
  resolveGitSource,
} from "./setup-job.js";
import { setupWithHelloWorldTest } from "./setup-workflow.js";

function showHelp(): void {
  console.log("Usage: qualms [options]");
  console.log("");
  console.log("Options:");
  console.log("  -s, --setup            Set up the current repository");
  console.log("      --endpoint <url>   Runner base URL; otherwise print the setup payload");
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
    const options = parseSetupArguments(args.slice(1));
    const source = resolveGitSource();

    if (options.runnerBaseUrl) {
      const result = await setupWithHelloWorldTest(
        source,
        createHttpRunnerClient(options.runnerBaseUrl),
      );
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify(createSetupPayload(source), null, 2));
    }
    return;
  }

  throw new Error(`Unknown option: ${command}`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
