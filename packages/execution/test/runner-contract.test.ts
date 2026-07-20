import { describe, expect, it } from 'vitest';

import type { ExecutionRunner } from '../src/index.js';
import { FakeLocalRunner, FakeVmRunner } from '../src/testing.js';

interface InspectableRunner extends ExecutionRunner {
  isActive(sessionId: string): boolean;
}

function runnerContract(
  name: string,
  createRunner: () => InspectableRunner,
): void {
  describe(name, () => {
    it('starts and stops a session through the lifecycle interface', async () => {
      const runner = createRunner();
      const session = await runner.start({
        runId: 'run-1',
        targetUrl: 'https://example.com',
      });

      expect(session).toMatchObject({
        id: `${name}-run-1`,
        state: 'ready',
      });
      expect(runner.isActive(session.id)).toBe(true);
      await expect(
        runner.stop(session.id, 'completed'),
      ).resolves.toBeUndefined();
      expect(runner.isActive(session.id)).toBe(false);
    });

    it('treats repeated cleanup as a successful no-op', async () => {
      const runner = createRunner();
      const session = await runner.start({
        runId: 'run-2',
        targetUrl: 'https://example.com',
      });

      await runner.stop(session.id, 'cancelled');
      await expect(
        runner.stop(session.id, 'cancelled'),
      ).resolves.toBeUndefined();
    });

    it.each(['completed', 'cancelled', 'failed', 'expired'] as const)(
      'cleans up when a session is %s',
      async (reason) => {
        const runner = createRunner();
        const session = await runner.start({
          runId: `run-${reason}`,
          targetUrl: 'https://example.com',
        });

        await runner.stop(session.id, reason);

        expect(runner.isActive(session.id)).toBe(false);
      },
    );
  });
}

runnerContract('local', () => new FakeLocalRunner());
runnerContract('vm', () => new FakeVmRunner());
