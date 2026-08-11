import { execFileSync } from "node:child_process";

import type { SetupJobPayload, SetupRequest } from "./types/setup-job.js";

export function parseSetupArguments(args: string[]): SetupRequest {
  let goal: string | undefined;
  let endpoint: string | undefined;
  let timeoutMinutes = 30;
  const subtests: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    switch (argument) {
      case "--goal":
        goal = readValue(args, ++index, "--goal");
        break;
      case "--test":
      case "--subtest":
        subtests.push(readValue(args, ++index, argument));
        break;
      case "--tests":
        subtests.push(...parseSubtests(readValue(args, ++index, "--tests")));
        break;
      case "--timeout": {
        const value = readValue(args, ++index, "--timeout");
        timeoutMinutes = Number(value);
        if (!Number.isInteger(timeoutMinutes) || timeoutMinutes <= 0) {
          throw new Error("--timeout must be a positive whole number of minutes");
        }
        break;
      }
      case "--endpoint":
        endpoint = validateEndpoint(readValue(args, ++index, "--endpoint"));
        break;
      default:
        if (argument?.startsWith("-")) {
          throw new Error(`Unknown setup option: ${argument}`);
        }
        if (argument !== undefined && goal === undefined) {
          goal = argument.trim();
        } else if (argument !== undefined) {
          throw new Error(`Unexpected argument: ${argument}`);
        }
    }
  }

  if (!goal) {
    throw new Error("A goal is required. Pass it with --goal or after -s.");
  }
  if (subtests.length === 0) {
    throw new Error("At least one subtest is required. Add one or more --test options.");
  }

  const request: SetupRequest = { goal, subtests, timeoutMinutes };
  if (endpoint !== undefined) {
    request.endpoint = endpoint;
  }
  return request;
}

function parseSubtests(value: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("--tests must be a valid JSON array of non-empty strings");
  }

  if (
    !Array.isArray(parsed) ||
    parsed.length === 0 ||
    !parsed.every((item): item is string => typeof item === "string" && item.trim().length > 0)
  ) {
    throw new Error("--tests must be a non-empty JSON array of non-empty strings");
  }

  return parsed.map((item) => item.trim());
}

export function resolveGitSource(cwd: string = process.cwd()): SetupJobPayload["source"] {
  const repositoryUrl = runGit(["remote", "get-url", "origin"], cwd);
  const commit = runGit(["rev-parse", "HEAD"], cwd);

  return {
    repository: normalizeRepository(repositoryUrl),
    commit,
  };
}

export function createSetupPayload(
  source: SetupJobPayload["source"],
  request: SetupRequest,
): SetupJobPayload {
  const usedIds = new Set<string>();

  return {
    version: 1,
    source,
    goal: request.goal,
    subtests: request.subtests.map((objective, index) => ({
      id: uniqueId(slugify(objective) || `test-${index + 1}`, usedIds),
      objective,
    })),
    limits: {
      timeoutMinutes: request.timeoutMinutes,
    },
  };
}

export async function submitSetupPayload(
  endpoint: string,
  payload: SetupJobPayload,
  token: string | undefined = process.env.QUALMS_RUNNER_TOKEN,
): Promise<string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Runner rejected the job (${response.status}): ${body || response.statusText}`);
  }

  return body;
}

function readValue(args: string[], index: number, option: string): string {
  const value = args[index]?.trim();
  if (!value) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function validateEndpoint(value: string): string {
  const url = new URL(value);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal)) {
    throw new Error("--endpoint must use HTTPS (HTTP is only allowed for localhost)");
  }
  return url.toString();
}

function runGit(args: string[], cwd: string): string {
  try {
    return execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    throw new Error("The current directory must be a Git repository with an origin remote and a commit");
  }
}

export function normalizeRepository(remote: string): string {
  const githubMatch = remote.match(/^(?:https?:\/\/github\.com\/|git@github\.com:)([^/]+\/[^/]+?)(?:\.git)?$/);
  return githubMatch?.[1] ?? remote;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)
    .replace(/-$/g, "");
}

function uniqueId(base: string, usedIds: Set<string>): string {
  let id = base;
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);
  return id;
}
