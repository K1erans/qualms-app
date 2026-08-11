export interface SetupPayload {
  version: 1;
  source: {
    repository: string;
    commit: string;
  };
}

export interface SetupRequest {
  endpoint?: string;
}
