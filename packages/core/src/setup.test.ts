import assert from "node:assert/strict"
import { test } from "node:test"

import { registerRepository } from "./index.ts"
import type { Repository, RepositoryStore } from "./types/repository.ts"

function createInMemoryStore(): RepositoryStore {
	const repositories: Repository[] = []
	return {
		findByOrgAndUrl(orgId, canonicalUrl) {
			for (const repository of repositories) {
				if (repository.orgId === orgId && repository.url === canonicalUrl) {
					return repository
				}
			}
			return null
		},
		save(repository) {
			repositories.push(repository)
		},
	}
}

test("registers a GitHub repository with defaults against an org", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://github.com/acme/widgets", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "created")
	if (result.status !== "created") return

	assert.equal(result.repository.orgId, "org-1")
	assert.equal(result.repository.url, "https://github.com/acme/widgets")
	assert.equal(result.repository.name, "widgets")
	assert.equal(result.repository.description, "")
	assert.equal(result.repository.createdAt, now)
	assert.equal(result.repository.updatedAt, now)
	assert.match(
		result.repository.id,
		/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
	)
	assert.equal(
		store.findByOrgAndUrl("org-1", "https://github.com/acme/widgets"),
		result.repository,
	)
})

test("stores the caller name and description when they are supplied", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{
			url: "https://github.com/acme/widgets",
			orgId: "org-1",
			name: "Acme Widgets",
			description: "Internal dashboard",
		},
		store,
		now,
	)

	assert.equal(result.status, "created")
	if (result.status !== "created") return
	assert.equal(result.repository.name, "Acme Widgets")
	assert.equal(result.repository.description, "Internal dashboard")
})

test("treats a whitespace-only name as omitted and uses the GitHub repo segment", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://github.com/acme/widgets", orgId: "org-1", name: "   " },
		store,
		now,
	)

	assert.equal(result.status, "created")
	if (result.status !== "created") return
	assert.equal(result.repository.name, "widgets")
})

test("canonicalizes an SSH GitHub remote with a .git suffix to https://github.com/{owner}/{repo}", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "git@github.com:acme/widgets.git", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "created")
	if (result.status !== "created") return
	assert.equal(result.repository.url, "https://github.com/acme/widgets")
	assert.equal(result.repository.name, "widgets")
	assert.equal(
		store.findByOrgAndUrl("org-1", "https://github.com/acme/widgets"),
		result.repository,
	)
})

test("accepts www.github.com and strips query strings and fragments", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://www.github.com/acme/widgets?tab=readme#overview", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "created")
	if (result.status !== "created") return
	assert.equal(result.repository.url, "https://github.com/acme/widgets")
})

test("rejects extra path segments after owner/repo as invalid_url", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://github.com/acme/widgets/tree/main", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "invalid_url")
	assert.equal(store.findByOrgAndUrl("org-1", "https://github.com/acme/widgets"), null)
})

test("rejects an owner-only GitHub URL as invalid_url", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://github.com/acme", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "invalid_url")
	assert.equal(store.findByOrgAndUrl("org-1", "https://github.com/acme"), null)
})

test("rejects a non-GitHub remote as invalid_url", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://gitlab.com/acme/widgets", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "invalid_url")
	assert.equal(store.findByOrgAndUrl("org-1", "https://gitlab.com/acme/widgets"), null)
})

test("rejects gist and org-settings GitHub paths as invalid_url", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const gist = registerRepository(
		{ url: "https://gist.github.com/acme/abc123", orgId: "org-1" },
		store,
		now,
	)
	const orgSettings = registerRepository(
		{ url: "https://github.com/organizations/acme/settings", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(gist.status, "invalid_url")
	assert.equal(orgSettings.status, "invalid_url")
	assert.equal(store.findByOrgAndUrl("org-1", "https://github.com/acme/abc123"), null)
	assert.equal(store.findByOrgAndUrl("org-1", "https://github.com/organizations/acme"), null)
})

test("rejects a local path as invalid_url", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "/Users/krk/Projects/widgets", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "invalid_url")
	assert.equal(store.findByOrgAndUrl("org-1", "/Users/krk/Projects/widgets"), null)
})

test("canonicalizes an ssh:// GitHub remote to https://github.com/{owner}/{repo}", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "ssh://git@github.com/acme/widgets.git", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "created")
	if (result.status !== "created") return
	assert.equal(result.repository.url, "https://github.com/acme/widgets")
})

test("rejects github.com/orgs/{name} as a non-repo path", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://github.com/orgs/acme", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "invalid_url")
	assert.equal(store.findByOrgAndUrl("org-1", "https://github.com/orgs/acme"), null)
})

test("rejects a self-hosted git remote as invalid_url", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "git@git.internal.example:acme/widgets.git", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "invalid_url")
})

test("rejects empty path segments after owner/repo rather than truncating", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://github.com/acme//widgets", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "invalid_url")
	assert.equal(store.findByOrgAndUrl("org-1", "https://github.com/acme/widgets"), null)
})


test("rejects an empty or whitespace-only org id as invalid_org_id", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const empty = registerRepository(
		{ url: "https://github.com/acme/widgets", orgId: "" },
		store,
		now,
	)
	const whitespace = registerRepository(
		{ url: "https://github.com/acme/widgets", orgId: "   " },
		store,
		now,
	)

	assert.equal(empty.status, "invalid_org_id")
	assert.equal(whitespace.status, "invalid_org_id")
	assert.equal(store.findByOrgAndUrl("", "https://github.com/acme/widgets"), null)
	assert.equal(store.findByOrgAndUrl("   ", "https://github.com/acme/widgets"), null)
})

test("returns already_exists for the same org and canonical URL without mutating the existing row", () => {
	const store = createInMemoryStore()
	const createdAt = new Date("2026-08-22T20:00:00.000Z")
	const retryAt = new Date("2026-08-23T09:00:00.000Z")
	const first = registerRepository(
		{
			url: "https://github.com/acme/widgets",
			orgId: "org-1",
			name: "Widgets",
			description: "Original",
		},
		store,
		createdAt,
	)
	assert.equal(first.status, "created")
	if (first.status !== "created") return

	const second = registerRepository(
		{
			url: "git@github.com:acme/widgets.git",
			orgId: "org-1",
			name: "Clobber",
			description: "Should not stick",
		},
		store,
		retryAt,
	)

	assert.equal(second.status, "already_exists")
	if (second.status !== "already_exists") return
	assert.equal(second.repository, first.repository)
	assert.equal(second.repository.name, "Widgets")
	assert.equal(second.repository.description, "Original")
	assert.equal(second.repository.createdAt, createdAt)
	assert.equal(second.repository.updatedAt, createdAt)
	assert.equal(
		store.findByOrgAndUrl("org-1", "https://github.com/acme/widgets"),
		first.repository,
	)
})

test("allows two orgs to register the same GitHub remote", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const personal = registerRepository(
		{ url: "https://github.com/acme/widgets", orgId: "personal-1" },
		store,
		now,
	)
	const official = registerRepository(
		{ url: "https://github.com/acme/widgets", orgId: "acme-org" },
		store,
		now,
	)

	assert.equal(personal.status, "created")
	assert.equal(official.status, "created")
	if (personal.status !== "created" || official.status !== "created") return
	assert.notEqual(personal.repository.id, official.repository.id)
	assert.equal(
		store.findByOrgAndUrl("personal-1", "https://github.com/acme/widgets"),
		personal.repository,
	)
	assert.equal(
		store.findByOrgAndUrl("acme-org", "https://github.com/acme/widgets"),
		official.repository,
	)
})

test("canonicalizes owner and repo case so Acme/Widgets matches acme/widgets", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const result = registerRepository(
		{ url: "https://github.com/Acme/Widgets", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(result.status, "created")
	if (result.status !== "created") return
	assert.equal(result.repository.url, "https://github.com/acme/widgets")
	assert.equal(result.repository.name, "Widgets")
})

test("registers two remotes that share a repo segment name in one org", () => {
	const store = createInMemoryStore()
	const now = new Date("2026-08-22T20:00:00.000Z")

	const acme = registerRepository(
		{ url: "https://github.com/acme/widgets", orgId: "org-1" },
		store,
		now,
	)
	const other = registerRepository(
		{ url: "https://github.com/other/widgets", orgId: "org-1" },
		store,
		now,
	)

	assert.equal(acme.status, "created")
	assert.equal(other.status, "created")
	if (acme.status !== "created" || other.status !== "created") return
	assert.equal(acme.repository.name, "widgets")
	assert.equal(other.repository.name, "widgets")
	assert.notEqual(acme.repository.url, other.repository.url)
})


