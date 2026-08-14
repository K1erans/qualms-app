import type { SetupClient } from "../setup/workflow.js";
import type { SetupResult } from "../setup/types.js";

export function createHttpSetupClient(
  endpoint: string,
  accessToken: string | undefined = process.env.QUALMS_ACCESS_TOKEN,
): SetupClient {
  const baseUrl = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;

  return {
    async setup(request) {
      const headers: Record<string, string> = {
        "content-type": "application/json",
      };
      if (accessToken) headers.authorization = `Bearer ${accessToken}`;

      const response = await fetch(new URL("setups", baseUrl), {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Qualms service rejected setup (${response.status})`);
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new Error("Qualms service returned an invalid setup response");
      }
      return parseSetupResult(body);
    },
  };
}

function parseSetupResult(value: unknown): SetupResult {
  if (!isRecord(value) || !isNonEmptyString(value.setupId)) {
    throw new Error("Qualms service returned an invalid setup response");
  }

  switch (value.status) {
    case "pending_auth":
      if (
        isBrowserUrl(value.browserUrl) &&
        (value.reason === "login" ||
          value.reason === "repository_credentials" ||
          value.reason === "ssh_public_key")
      ) {
        return {
          status: value.status,
          setupId: value.setupId,
          browserUrl: value.browserUrl,
          reason: value.reason,
        };
      }
      break;
    case "provisioning":
      return { status: value.status, setupId: value.setupId };
    case "ready":
      if (isNonEmptyString(value.projectId)) {
        return {
          status: value.status,
          setupId: value.setupId,
          projectId: value.projectId,
        };
      }
      break;
    case "failed":
      return {
        status: value.status,
        setupId: value.setupId,
        message: "Repository setup failed. Check the Qualms service for details.",
      };
  }

  throw new Error("Qualms service returned an invalid setup response");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isBrowserUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || isLocalHttp(url);
  } catch {
    return false;
  }
}

function isLocalHttp(url: URL): boolean {
  return (
    url.protocol === "http:" &&
    (url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]")
  );
}
