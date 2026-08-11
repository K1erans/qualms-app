export interface SetupJobPayload {
  version: 1;
  source: {
    repository: string;
    commit: string;
  };
  goal: string;
  subtests: Array<{
    id: string;
    objective: string;
  }>;
  limits: {
    timeoutMinutes: number;
  };
}

export interface SetupRequest {
  goal: string;
  subtests: string[];
  timeoutMinutes: number;
  endpoint?: string;
}
