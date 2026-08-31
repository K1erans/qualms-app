import type { RequestEvent } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { deriveAccountProfile, type AuthProfile } from "@qualms/core";
import type { OrganizationKind } from "$lib/shell/types";
import { getDb, type Database } from "./db";
import { organisationMembers, organisations, users } from "./schema";

export type ProvisionedAccount = {
	userId: string;
	organisationId: string;
	organisationName: string;
	organisationKind: OrganizationKind;
	role: string;
	email: string;
	name: string | null;
};

type AuthUser = AuthProfile & { id: string };

type AccountRow = {
	userId: bigint;
	email: string;
	name: string | null;
	organisationId: bigint;
	organisationName: string;
	personalOwnerUserId: bigint | null;
	role: string;
};

function organisationKindFromOwner(personalOwnerUserId: bigint | null): OrganizationKind {
	return personalOwnerUserId === null ? "organisation" : "personal";
}

function toAccount(row: AccountRow): ProvisionedAccount {
	return {
		userId: row.userId.toString(),
		organisationId: row.organisationId.toString(),
		organisationName: row.organisationName,
		organisationKind: organisationKindFromOwner(row.personalOwnerUserId),
		role: row.role,
		email: row.email,
		name: row.name,
	};
}

async function findAccount(db: Database, workosUserId: string): Promise<AccountRow | null> {
	const rows = await db
		.select({
			userId: users.userId,
			email: users.email,
			name: users.name,
			organisationId: organisations.organisationId,
			organisationName: organisations.organisationName,
			personalOwnerUserId: organisations.personalOwnerUserId,
			role: organisationMembers.role,
		})
		.from(users)
		.innerJoin(organisations, eq(organisations.personalOwnerUserId, users.userId))
		.innerJoin(
			organisationMembers,
			and(
				eq(organisationMembers.organisationId, organisations.organisationId),
				eq(organisationMembers.userId, users.userId),
			),
		)
		.where(eq(users.workosUserId, workosUserId))
		.limit(1);
	return rows[0] ?? null;
}

async function upsertAccount(
	db: Database,
	user: AuthUser,
	cachedName: string | null,
	workspaceName: string,
): Promise<AccountRow> {
	return db.transaction(async (tx) => {
		const [userRow] = await tx
			.insert(users)
			.values({
				workosUserId: user.id,
				email: user.email,
				name: cachedName,
			})
			.onConflictDoUpdate({
				target: users.workosUserId,
				set: {
					email: user.email,
					name: cachedName,
				},
			})
			.returning({
				userId: users.userId,
				email: users.email,
				name: users.name,
			});
		if (!userRow) {
			throw new Error("Failed to persist user");
		}

		const [organisationRow] = await tx
			.insert(organisations)
			.values({
				organisationName: workspaceName,
				personalOwnerUserId: userRow.userId,
			})
			.onConflictDoUpdate({
				target: organisations.personalOwnerUserId,
				set: {
					organisationName: workspaceName,
				},
			})
			.returning({
				organisationId: organisations.organisationId,
				organisationName: organisations.organisationName,
			});
		if (!organisationRow) {
			throw new Error("Failed to persist organisation");
		}

		await tx
			.insert(organisationMembers)
			.values({
				organisationId: organisationRow.organisationId,
				userId: userRow.userId,
				role: "owner",
			})
			.onConflictDoNothing({
				target: [organisationMembers.organisationId, organisationMembers.userId],
			});

		return {
			userId: userRow.userId,
			email: userRow.email,
			name: userRow.name,
			organisationId: organisationRow.organisationId,
			organisationName: organisationRow.organisationName,
			personalOwnerUserId: userRow.userId,
			role: "owner",
		};
	});
}

export async function ensureAccount(event: RequestEvent): Promise<ProvisionedAccount | null> {
	const existing = event.locals.account;
	if (existing) return existing;

	const user = event.locals.auth?.user ?? null;
	if (!user) return null;

	const profile = deriveAccountProfile({
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
	});
	const db = getDb(event);
	const found = await findAccount(db, user.id);
	if (found && found.email === user.email && found.name === profile.cachedName) {
		const account = toAccount(found);
		event.locals.account = account;
		return account;
	}

	const written = await upsertAccount(db, user, profile.cachedName, profile.workspaceName);
	const account = toAccount(written);
	event.locals.account = account;
	return account;
}
