import { execFileSync } from "node:child_process";

import type { SetupCliOptions, SetupPayload } from "./types.js";

export function parseSetupArguments(args: string[]): SetupCliOptions {
  let runnerBaseUrl: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    switch (argument) {
      case "--endpoint":
        runnerBaseUrl = validateEndpoint(readValue(args, ++index, "--endpoint"));
        break;
      default:
        if (argument?.startsWith("-")) {
          throw new Error(`Unknown setup option: ${argument}`);
        }
        if (argument !== undefined) {
          throw new Error(`Unexpected setup argument: ${argument}`);
        }
    }
  }

  const options: SetupCliOptions = {};
  if (runnerBaseUrl !== undefined) {
    options.runnerBaseUrl = runnerBaseUrl;
  }
  return options;
}

export function resolveGitSource(cwd: string = process.cwd()): SetupPayload["source"] {
  const repositoryUrl = runGit(["remote", "get-url", "origin"], cwd);
  const commit = runGit(["rev-parse", "HEAD"], cwd);

  return {
    repository: normalizeRepository(repositoryUrl),
    commit,
  };
}

export function createSetupPayload(source: SetupPayload["source"]): SetupPayload {
  return {
    version: 1,
    source,
  };
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
