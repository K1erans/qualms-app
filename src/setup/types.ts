export interface Payload {
  version: number ;
  source: {
    repository: string;
    commit: string;
  };
}

export interface SetupCliOptions {
  runnerBaseUrl?: string;
}
