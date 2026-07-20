import { z } from 'zod';

export const bridgeRequestSchema = z.object({
  id: z.string().min(1),
  method: z.string().min(1),
  params: z.unknown().optional(),
});

export const bridgeSuccessSchema = z.object({
  id: z.string().min(1),
  ok: z.literal(true),
  result: z.unknown(),
});

export const bridgeErrorCodeSchema = z.enum([
  'INVALID_REQUEST',
  'UNKNOWN_METHOD',
  'INTERNAL_ERROR',
]);

export const bridgeFailureSchema = z.object({
  id: z.string().min(1).nullable(),
  ok: z.literal(false),
  error: z.object({
    code: bridgeErrorCodeSchema,
    message: z.string().min(1),
  }),
});

export const bridgeEventSchema = z.object({
  type: z.literal('bridge.ready'),
  version: z.string().min(1),
});

export const bridgeMessageSchema = z.union([
  bridgeSuccessSchema,
  bridgeFailureSchema,
  bridgeEventSchema,
]);

export const executionModeSchema = z.enum(['local', 'vm']);

export const executionRequestSchema = z.object({
  runId: z.string().min(1),
  targetUrl: z.url(),
});

export const stdioToolEndpointSchema = z.object({
  transport: z.literal('stdio'),
  command: z.string().min(1),
  args: z.array(z.string()),
});

export const httpToolEndpointSchema = z.object({
  transport: z.literal('http'),
  url: z.url(),
  bearerToken: z.string().min(1),
});

export const toolEndpointSchema = z.discriminatedUnion('transport', [
  stdioToolEndpointSchema,
  httpToolEndpointSchema,
]);

export const executionSessionSchema = z.object({
  id: z.string().min(1),
  mode: executionModeSchema,
  state: z.literal('ready'),
  tools: toolEndpointSchema,
  expiresAt: z.iso.datetime().optional(),
});

export const stopReasonSchema = z.enum([
  'completed',
  'cancelled',
  'failed',
  'expired',
]);

const traceStepBase = {
  summary: z.string().min(1),
  timestamp: z.iso.datetime(),
};

export const qaTraceStepSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('action'),
    ...traceStepBase,
  }),
  z.object({
    kind: z.literal('observation'),
    ...traceStepBase,
    screenshot: z.string().min(1).optional(),
  }),
  z.object({
    kind: z.literal('assertion'),
    ...traceStepBase,
    status: z.enum(['passed', 'failed']),
  }),
  z.object({
    kind: z.literal('failure'),
    ...traceStepBase,
    code: z.string().min(1),
  }),
]);

export const qaTraceSchema = z.object({
  id: z.string().min(1),
  targetUrl: z.url(),
  instruction: z.string().min(1),
  status: z.enum(['passed', 'failed', 'cancelled']),
  steps: z.array(qaTraceStepSchema),
  artifacts: z.array(
    z.object({
      kind: z.enum(['screenshot', 'trace', 'log']),
      path: z.string().min(1),
    }),
  ),
});

export type BridgeErrorCode = z.infer<typeof bridgeErrorCodeSchema>;
export type BridgeFailure = z.infer<typeof bridgeFailureSchema>;
export type BridgeMessage = z.infer<typeof bridgeMessageSchema>;
export type BridgeRequest = z.infer<typeof bridgeRequestSchema>;
export type BridgeSuccess = z.infer<typeof bridgeSuccessSchema>;
export type ExecutionMode = z.infer<typeof executionModeSchema>;
export type ExecutionRequest = z.infer<typeof executionRequestSchema>;
export type ExecutionSession = z.infer<typeof executionSessionSchema>;
export type QaTrace = z.infer<typeof qaTraceSchema>;
export type StopReason = z.infer<typeof stopReasonSchema>;
export type ToolEndpoint = z.infer<typeof toolEndpointSchema>;
