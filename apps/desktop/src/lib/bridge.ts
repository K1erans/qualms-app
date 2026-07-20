import {
  bridgeMessageSchema,
  bridgeRequestSchema,
  type BridgeMessage,
  type BridgeRequest,
} from '@qualms/contracts';
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export function parseBridgeMessage(payload: unknown): BridgeMessage {
  return bridgeMessageSchema.parse(payload);
}

export async function startBridge(): Promise<void> {
  await invoke('bridge_start');
}

export async function sendBridgeRequest(request: BridgeRequest): Promise<void> {
  await invoke('bridge_request', {
    request: bridgeRequestSchema.parse(request),
  });
}

export async function stopBridge(): Promise<void> {
  await invoke('bridge_stop');
}

export async function onBridgeMessage(
  listener: (message: BridgeMessage) => void,
): Promise<UnlistenFn> {
  return listen<unknown>('qualms://bridge-message', (event) => {
    listener(parseBridgeMessage(event.payload));
  });
}
