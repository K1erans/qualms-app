import { createSetupPayload } from "./job.js";
import type { SetupPayload } from "./types.js";

export interface CreateTestPayload {
  version: 1;
  setupId: string;
  objective: string;
}

export interface RunnerClient {
  createSetup(payload: SetupPayload): Promise<{ id: string }>;
  createTest(payload: CreateTestPayload): Promise<{ id: string }>;
}

export interface SetupWorkflowResult {
  setupId: string;
  testId: string;
}

export async function setupWithHelloWorldTest(
  source: SetupPayload["source"],
  runner: RunnerClient,
): Promise<SetupWorkflowResult> {
  const setup = await runner.createSetup(createSetupPayload(source));
  const createdTest = await runner.createTest({
    version: 1,
    setupId: setup.id,
    objective: "Hello World",
  });

  return {
    setupId: setup.id,
    testId: createdTest.id,
  };
}
