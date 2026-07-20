import { Command } from 'commander';

import { runBridge } from './bridge.js';

async function main(): Promise<void> {
  const program = new Command()
    .name('qualms')
    .description(
      'Turn natural-language QA intent into durable automated tests.',
    )
    .version(__CLI_VERSION__)
    .showSuggestionAfterError();

  program
    .command('bridge', { hidden: true })
    .description('Run the internal desktop bridge over NDJSON')
    .action(async () => {
      await runBridge();
    });

  await program.parseAsync(process.argv);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  process.stderr.write(`qualms: ${message}\n`);
  process.exitCode = 1;
});
