import type { RunnerClient } from "./setup-workflow.js";

interface CreatedResource {
  id: string;
}

export function createHttpRunnerClient(
  endpoint: string,
  token: string | undefined = process.env.QUALMS_RUNNER_TOKEN,
): RunnerClient {
  const baseUrl = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;

  return {
    createSetup: (payload) => postJson(new URL("setups", baseUrl), payload, token, "setup"),
    createTest: (payload) => postJson(new URL("tests", baseUrl), payload, token, "test"),
  };
}

async function postJson(
  url: URL,
  payload: unknown,
  token: string | undefined,
  resourceName: string,
): Promise<CreatedResource> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Runner rejected the ${resourceName} (${response.status}): ${body || response.statusText}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error(`Runner returned an invalid ${resourceName} response`);
  }
  if (!isCreatedResource(parsed)) {
    throw new Error(`Runner ${resourceName} response must contain a non-empty id`);
  }

  return parsed;
}

function isCreatedResource(value: unknown): value is CreatedResource {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    value.id.length > 0
  );
}
