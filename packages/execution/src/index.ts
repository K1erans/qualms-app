import type {
  ExecutionMode,
  ExecutionRequest,
  ExecutionSession,
  StopReason,
} from '@qualms/contracts';

export type {
  ExecutionMode,
  ExecutionRequest,
  ExecutionSession,
  StopReason,
} from '@qualms/contracts';

/**
 * Owns the complete lifecycle of one browser execution environment.
 * Implementations must make stop idempotent so cleanup can safely run from
 * success, cancellation, failure, and TTL-expiry paths.
 */
export interface ExecutionRunner {
  readonly mode: ExecutionMode;
  start(request: ExecutionRequest): Promise<ExecutionSession>;
  stop(sessionId: string, reason: StopReason): Promise<void>;
}

/** Developer-only execution using a browser tool on the local machine. */
export interface LocalRunner extends ExecutionRunner {
  readonly mode: 'local';
}

/** Production execution using a short-lived remote browser environment. */
export interface VmRunner extends ExecutionRunner {
  readonly mode: 'vm';
}
