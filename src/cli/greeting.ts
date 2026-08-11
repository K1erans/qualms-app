import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

export type CommandHandler = (args: string[]) => Promise<void>;

export function parseCommandLine(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}

export async function cliLoop(runCommand: CommandHandler): Promise<void> {
  const terminal = createInterface({ input: stdin, output: stdout });

  console.log("Hello, welcome to the Qualms CLI!");
  console.log("Type 'help' for commands or 'exit' to quit.");

  try {
    stdout.write("qualms> ");

    for await (const input of terminal) {
      const args = parseCommandLine(input);

      if (args.length === 0) {
        stdout.write("qualms> ");
        continue;
      }

      if (args[0] === "exit" || args[0] === "quit") {
        console.log("Goodbye!");
        return;
      }

      try {
        await runCommand(args);
      } catch (error: unknown) {
        console.error(error instanceof Error ? error.message : String(error));
      }

      stdout.write("qualms> ");
    }
  } finally {
    terminal.close();
  }
}
