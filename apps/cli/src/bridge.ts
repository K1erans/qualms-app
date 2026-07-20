import {
  bridgeMessageSchema,
  bridgeRequestSchema,
  type BridgeFailure,
  type BridgeMessage,
  type BridgeRequest,
} from '@qualms/contracts';
import { createInterface } from 'node:readline';
import type { Readable, Writable } from 'node:stream';

function writeMessage(output: Writable, message: BridgeMessage): void {
  output.write(`${JSON.stringify(bridgeMessageSchema.parse(message))}\n`);
}

function invalidRequest(message: string): BridgeFailure {
  return {
    id: null,
    ok: false,
    error: { code: 'INVALID_REQUEST', message },
  };
}

function handleRequest(request: BridgeRequest): BridgeMessage {
  switch (request.method) {
    case 'system.health':
      return { id: request.id, ok: true, result: { status: 'ok' } };
    case 'system.version':
      return { id: request.id, ok: true, result: { version: __CLI_VERSION__ } };
    case 'system.shutdown':
      return {
        id: request.id,
        ok: true,
        result: { status: 'shutting-down' },
      };
    default:
      return {
        id: request.id,
        ok: false,
        error: {
          code: 'UNKNOWN_METHOD',
          message: `Unknown bridge method: ${request.method}`,
        },
      };
  }
}

export async function runBridge(
  input: Readable = process.stdin,
  output: Writable = process.stdout,
): Promise<void> {
  const lines = createInterface({ input, crlfDelay: Infinity });
  writeMessage(output, { type: 'bridge.ready', version: __CLI_VERSION__ });

  for await (const line of lines) {
    let decoded: unknown;
    try {
      decoded = JSON.parse(line) as unknown;
    } catch {
      writeMessage(output, invalidRequest('Request must be valid JSON.'));
      continue;
    }

    const parsed = bridgeRequestSchema.safeParse(decoded);
    if (!parsed.success) {
      writeMessage(
        output,
        invalidRequest('Request must contain a non-empty id and method.'),
      );
      continue;
    }

    const response = handleRequest(parsed.data);
    writeMessage(output, response);
    if (parsed.data.method === 'system.shutdown') {
      lines.close();
      break;
    }
  }
}
