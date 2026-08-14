#!/usr/bin/env node

import { runCommand } from "./cli/command.js";
import { cliLoop } from "./cli/greeting.js";

async function main(args: string[]): Promise<void> {
  if (args.length === 0) {
    await cliLoop(runCommand);
    return;
  }
  await runCommand(args);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
