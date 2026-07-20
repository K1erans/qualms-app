import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

const cliPath = fileURLToPath(new URL('../dist/index.js', import.meta.url));
const children: ReturnType<typeof spawn>[] = [];

afterEach(() => {
  for (const child of children) child.kill();
  children.length = 0;
});

function startBridge() {
  const child = spawn(process.execPath, [cliPath, 'bridge'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  children.push(child);
  const lines = createInterface({ input: child.stdout });
  const iterator = lines[Symbol.asyncIterator]();

  return {
    child,
    async nextMessage(): Promise<unknown> {
      const next = await iterator.next();
      if (next.done) throw new Error('Bridge closed before sending a message');
      return JSON.parse(next.value) as unknown;
    },
    send(message: unknown): void {
      child.stdin.write(`${JSON.stringify(message)}\n`);
    },
    sendRaw(line: string): void {
      child.stdin.write(`${line}\n`);
    },
  };
}

describe('qualms bridge process', () => {
  it('announces readiness and answers health checks', async () => {
    const bridge = startBridge();

    await expect(bridge.nextMessage()).resolves.toEqual({
      type: 'bridge.ready',
      version: '0.0.0',
    });
    bridge.send({ id: '1', method: 'system.health' });
    await expect(bridge.nextMessage()).resolves.toEqual({
      id: '1',
      ok: true,
      result: { status: 'ok' },
    });
  });

  it('returns a structured error for malformed JSON', async () => {
    const bridge = startBridge();
    await bridge.nextMessage();

    bridge.sendRaw('{not json');

    await expect(bridge.nextMessage()).resolves.toEqual({
      id: null,
      ok: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Request must be valid JSON.',
      },
    });
  });

  it('reports its version and rejects unknown methods', async () => {
    const bridge = startBridge();
    await bridge.nextMessage();

    bridge.send({ id: 'version', method: 'system.version' });
    await expect(bridge.nextMessage()).resolves.toEqual({
      id: 'version',
      ok: true,
      result: { version: '0.0.0' },
    });

    bridge.send({ id: 'unknown', method: 'run.start' });
    await expect(bridge.nextMessage()).resolves.toEqual({
      id: 'unknown',
      ok: false,
      error: {
        code: 'UNKNOWN_METHOD',
        message: 'Unknown bridge method: run.start',
      },
    });
  });

  it('acknowledges shutdown before exiting cleanly', async () => {
    const bridge = startBridge();
    await bridge.nextMessage();

    bridge.send({ id: '2', method: 'system.shutdown' });

    await expect(bridge.nextMessage()).resolves.toEqual({
      id: '2',
      ok: true,
      result: { status: 'shutting-down' },
    });
    await expect(
      new Promise<number | null>((resolve) => {
        bridge.child.once('close', resolve);
      }),
    ).resolves.toBe(0);
  });
});
