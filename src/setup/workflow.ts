import { createSetupRequest } from "./job.js";
import type {
  RepositoryRemote,
  SetupRequest,
  SetupResult,
} from "./types.js";

export interface SetupClient {
  setup(request: SetupRequest): Promise<SetupResult>;
}

export async function setupRepository(
  repository: RepositoryRemote,
  client: SetupClient,
): Promise<SetupResult> {
  return client.setup(createSetupRequest(repository));
}
