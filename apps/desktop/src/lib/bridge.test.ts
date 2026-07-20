import { describe, expect, it } from 'vitest';

import { parseBridgeMessage } from './bridge.js';

describe('desktop bridge event seam', () => {
  it('translates a valid sidecar event into the shared contract', () => {
    expect(
      parseBridgeMessage({ type: 'bridge.ready', version: '0.0.0' }),
    ).toEqual({ type: 'bridge.ready', version: '0.0.0' });
  });

  it('rejects uncorrelated sidecar responses', () => {
    expect(() =>
      parseBridgeMessage({ ok: true, result: { status: 'ok' } }),
    ).toThrow();
  });
});
