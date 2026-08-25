const LAST_USED_REPO_KEY = "qualms.last-used-repo-id";

export function readLastUsedRepoId(): string | null {
	const value = localStorage.getItem(LAST_USED_REPO_KEY);
	if (value === null || value === "") return null;
	return value;
}

export function writeLastUsedRepoId(repositoryId: string): void {
	localStorage.setItem(LAST_USED_REPO_KEY, repositoryId);
}
