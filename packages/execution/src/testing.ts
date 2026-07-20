import type {
  ExecutionMode,
  ExecutionRequest,
  ExecutionSession,
} from '@qualms/contracts';

import type { ExecutionRunner } from './index.js';

abstract class FakeRunner implements ExecutionRunner {
  readonly #activeSessions = new Set<string>();

  abstract readonly mode: ExecutionMode;

  async start(request: ExecutionRequest): Promise<ExecutionSession> {
    const session = this.createSession(request);
    this.#activeSessions.add(session.id);
    return session;
  }

  async stop(sessionId: string): Promise<void> {
    this.#activeSessions.delete(sessionId);
  }

  isActive(sessionId: string): boolean {
    return this.#activeSessions.has(sessionId);
  }

  protected abstract createSession(request: ExecutionRequest): ExecutionSession;
}

export class FakeLocalRunner extends FakeRunner {
  readonly mode = 'local' as const;

  protected createSession(request: ExecutionRequest): ExecutionSession {
    return {
      id: `local-${request.runId}`,
      mode: this.mode,
      state: 'ready',
      tools: {
        transport: 'stdio',
        command: 'qualms-browser-local',
        args: ['--target', request.targetUrl],
      },
    };
  }
}

export class FakeVmRunner extends FakeRunner {
  readonly mode = 'vm' as const;

  protected createSession(request: ExecutionRequest): ExecutionSession {
    return {
      id: `vm-${request.runId}`,
      mode: this.mode,
      state: 'ready',
      tools: {
        transport: 'http',
        url: `https://vm.invalid/sessions/${request.runId}/mcp`,
        bearerToken: `fake-token-${request.runId}`,
      },
      expiresAt: '2099-01-01T00:00:00.000Z',
    };
  }
}
