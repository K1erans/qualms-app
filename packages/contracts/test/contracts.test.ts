import { describe, expect, it } from 'vitest';

import {
  bridgeMessageSchema,
  bridgeRequestSchema,
  qaTraceSchema,
} from '../src/index.js';

describe('bridge contracts', () => {
  it('accepts a health request at the process seam', () => {
    expect(
      bridgeRequestSchema.parse({ id: 'request-1', method: 'system.health' }),
    ).toEqual({ id: 'request-1', method: 'system.health' });
  });

  it('rejects a response without a correlation id', () => {
    expect(() =>
      bridgeMessageSchema.parse({ ok: true, result: { status: 'ok' } }),
    ).toThrow();
  });
});

describe('QA trace contract', () => {
  it('accepts a semantic observation without requiring a screenshot', () => {
    const trace = qaTraceSchema.parse({
      id: 'trace-1',
      targetUrl: 'https://example.com',
      instruction: 'Check that the account page opens',
      status: 'passed',
      steps: [
        {
          kind: 'observation',
          summary: 'Account heading is visible',
          timestamp: '2026-07-20T12:00:00.000Z',
        },
      ],
      artifacts: [],
    });

    expect(trace.steps[0]).not.toHaveProperty('screenshot');
  });
});
