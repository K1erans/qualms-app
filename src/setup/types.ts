export type RepositoryTransport = "https" | "ssh";

export interface RepositoryRemote {
  url: string;
  host: string;
  transport: RepositoryTransport;
}

export type RepositoryAuthentication =
  | { method: "https_credentials" }
  | {
      method: "project_ssh_key";
      hostKeyVerification: "pending_service_enrollment";
    };

export interface SetupRequest {
  version: 1;
  repository: RepositoryRemote;
  authentication: RepositoryAuthentication;
}

export interface SetupCliOptions {
  repository: RepositoryRemote;
}

export type SetupResult =
  | {
      status: "pending_auth";
      setupId: string;
      browserUrl: string;
      reason: "login" | "repository_credentials" | "ssh_public_key";
    }
  | { status: "provisioning"; setupId: string }
  | { status: "ready"; setupId: string; projectId: string }
  | { status: "failed"; setupId: string; message: string };
