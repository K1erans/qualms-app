import type {
  RepositoryAuthentication,
  RepositoryRemote,
  SetupCliOptions,
  SetupRequest,
} from "./types.js";

const SUPPORTED_REMOTE_MESSAGE =
  "Repository URL must use HTTPS, ssh://, or SCP-style SSH";

export function parseSetupArguments(args: string[]): SetupCliOptions {
  const repositoryUrl = args[0];
  if (repositoryUrl === undefined) {
    throw new Error(
      "Repository URL is required. Usage: qualms setup <repository-url>",
    );
  }
  if (repositoryUrl.startsWith("-")) {
    throw new Error("Unknown setup option");
  }
  if (args[1] !== undefined) {
    if (args[1].startsWith("-")) {
      throw new Error("Unknown setup option");
    }
    throw new Error("Unexpected setup argument");
  }

  return { repository: parseRepositoryUrl(repositoryUrl) };
}

export function parseRepositoryUrl(input: string): RepositoryRemote {
  const url = input.trim();
  if (url.length === 0) {
    throw new Error(SUPPORTED_REMOTE_MESSAGE);
  }
  if (/^[A-Za-z]:[\\/]/.test(url) || url.startsWith("\\\\")) {
    throw new Error(SUPPORTED_REMOTE_MESSAGE);
  }

  if (url.startsWith("https://")) {
    return parseStandardRemote(url, "https");
  }
  if (url.startsWith("ssh://")) {
    return parseStandardRemote(url, "ssh");
  }

  const scpMatch = url.match(
    /^(?:[A-Za-z0-9._-]+@)?(\[[0-9A-Fa-f:]+\]|[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?):([^\s/:][^\s:]*)$/,
  );
  if (scpMatch?.[1]) {
    return {
      url,
      host: stripIpv6Brackets(scpMatch[1]).toLowerCase(),
      transport: "ssh",
    };
  }

  throw new Error(SUPPORTED_REMOTE_MESSAGE);
}

export function inferRepositoryAuthentication(
  repository: RepositoryRemote,
): RepositoryAuthentication {
  if (repository.transport === "https") {
    return { method: "https_credentials" };
  }
  return {
    method: "project_ssh_key",
    hostKeyVerification: "pending_service_enrollment",
  };
}

export function createSetupRequest(
  repository: RepositoryRemote,
): SetupRequest {
  return {
    version: 1,
    repository,
    authentication: inferRepositoryAuthentication(repository),
  };
}

function parseStandardRemote(
  remote: string,
  transport: RepositoryRemote["transport"],
): RepositoryRemote {
  let parsed: URL;
  try {
    parsed = new URL(remote);
  } catch {
    throw new Error(SUPPORTED_REMOTE_MESSAGE);
  }

  if (parsed.protocol !== `${transport}:` || !parsed.hostname || parsed.pathname === "/") {
    throw new Error(SUPPORTED_REMOTE_MESSAGE);
  }
  if (transport === "https" && (parsed.username || parsed.password)) {
    throw new Error("HTTPS repository URLs must not contain credentials");
  }
  if (transport === "ssh" && parsed.password) {
    throw new Error("SSH repository URLs must not contain a password");
  }
  if (parsed.search || parsed.hash) {
    throw new Error("Repository URLs must not contain a query or fragment");
  }

  return {
    url: remote,
    host: parsed.hostname.toLowerCase(),
    transport,
  };
}

function stripIpv6Brackets(host: string): string {
  return host.startsWith("[") && host.endsWith("]") ? host.slice(1, -1) : host;
}
