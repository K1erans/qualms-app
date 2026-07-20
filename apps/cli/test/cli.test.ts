import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const cliPath = fileURLToPath(new URL('../dist/index.js', import.meta.url));

async function runCli(args: string[]): Promise<{
  exitCode: number;
  stderr: string;
  stdout: string;
}> {
  const child = spawn(process.execPath, [cliPath, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
    stdout += chunk;
  });
  child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
    stderr += chunk;
  });
  const [exitCode] = (await once(child, 'close')) as [number];
  return { exitCode, stderr, stdout };
}

describe('qualms process', () => {
  it('prints help', async () => {
    const result = await runCli(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage: qualms');
    expect(result.stderr).toBe('');
  });

  it('prints its package version', async () => {
    const result = await runCli(['--version']);

    expect(result).toEqual({ exitCode: 0, stderr: '', stdout: '0.0.0\n' });
  });

  it('rejects unknown commands', async () => {
    const result = await runCli(['unknown']);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("unknown command 'unknown'");
  });
});
