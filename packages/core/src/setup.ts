import type {
	RegisterRepositoryInput,
	RegisterRepositoryResult,
	Repository,
	RepositoryStore,
} from "./types/repository.ts"

const NON_REPO_OWNERS: ReadonlySet<string> = new Set([
	"gist",
	"organizations",
	"orgs",
	"settings",
])

export function registerRepository(
	input: RegisterRepositoryInput,
	store: RepositoryStore,
	now: Date,
): RegisterRepositoryResult {
	if (input.orgId.trim() === "") {
		return { status: "invalid_org_id" }
	}

	const parsed = parseGitHubRemote(input.url.trim())
	if (parsed === null) {
		return { status: "invalid_url" }
	}

	const existing = store.findByOrgAndUrl(input.orgId, parsed.canonicalUrl)
	if (existing !== null) {
		return { status: "already_exists", repository: existing }
	}

	const repository: Repository = {
		id: crypto.randomUUID(),
		orgId: input.orgId,
		url: parsed.canonicalUrl,
		name: nameFromInput(input.name, parsed.defaultName),
		description: input.description ?? "",
		createdAt: now,
		updatedAt: now,
	}
	store.save(repository)
	return { status: "created", repository }
}

function parseGitHubRemote(raw: string): { canonicalUrl: string; defaultName: string } | null {
	const ownerRepo = parseGitHubOwnerRepo(raw)
	if (ownerRepo === null) return null
	return {
		canonicalUrl: `https://github.com/${ownerRepo.owner}/${ownerRepo.repo.toLowerCase()}`,
		defaultName: ownerRepo.repo,
	}
}

function parseGitHubOwnerRepo(raw: string): { owner: string; repo: string } | null {
	if (raw === "") return null
	const scp = /^git@(?:www\.)?github\.com:(.+)$/iu.exec(raw)
	if (scp !== null && scp[1] !== undefined) {
		return ownerRepoFromPath(scp[1])
	}
	let parsed: URL
	try {
		parsed = new URL(raw)
	} catch {
		return null
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "ssh:") return null
	const host = parsed.hostname.toLowerCase()
	if (host !== "github.com" && host !== "www.github.com") return null
	return ownerRepoFromPath(parsed.pathname)
}

function ownerRepoFromPath(path: string): { owner: string; repo: string } | null {
	const withoutQuery = path.split("?")[0] ?? path
	const withoutFragment = withoutQuery.split("#")[0] ?? withoutQuery
	const trimmedPath = withoutFragment.replace(/^\/+/u, "").replace(/\/+$/u, "")
	const segments = trimmedPath.split("/")
	if (segments.length !== 2) return null
	const owner = segments[0]
	const rawRepo = segments[1]
	if (owner === undefined || rawRepo === undefined || owner === "" || rawRepo === "") {
		return null
	}
	const repo = stripGitSuffix(rawRepo)
	if (repo === "") return null
	const ownerName = owner.toLowerCase()
	if (NON_REPO_OWNERS.has(ownerName)) return null
	return { owner: ownerName, repo }
}

function stripGitSuffix(repo: string): string {
	if (repo.toLowerCase().endsWith(".git")) return repo.slice(0, -4)
	return repo
}

function nameFromInput(name: string | undefined, repo: string): string {
	if (name === undefined || name.trim() === "") return repo
	return name
}
