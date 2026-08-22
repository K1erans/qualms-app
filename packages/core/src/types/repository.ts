export type Repository = {
	id: string
	orgId: string
	url: string
	name: string
	description: string
	createdAt: Date
	updatedAt: Date
}

export type RegisterRepositoryInput = {
	url: string
	orgId: string
	name?: string
	description?: string
}

export type RepositoryStore = {
	findByOrgAndUrl: (orgId: string, canonicalUrl: string) => Repository | null
	save: (repository: Repository) => void
}

export type RegisterRepositoryResult =
	| { status: "created"; repository: Repository }
	| { status: "already_exists"; repository: Repository }
	| { status: "invalid_url" }
	| { status: "invalid_org_id" }
