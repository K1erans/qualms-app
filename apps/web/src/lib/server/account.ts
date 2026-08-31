import type { RequestEvent } from "@sveltejs/kit";
import { deriveAccountProfile, type AuthProfile } from "@qualms/core";
import { getDb, type Sql } from "./db";

export type ProvisionedAccount = {
	userId: string;
	organisationId: string;
	organisationName: string;
	role: string;
	email: string;
	name: string | null;
};

type AuthUser = AuthProfile & { id: string };

type AccountRow = {
	user_id: string;
	email: string;
	name: string | null;
	organisation_id: string;
	organisation_name: string;
	role: string;
};

type UserRow = {
	user_id: string;
	email: string;
	name: string | null;
};

type OrganisationRow = {
	organisation_id: string;
	organisation_name: string;
};

function toAccount(row: AccountRow): ProvisionedAccount {
	return {
		userId: row.user_id,
		organisationId: row.organisation_id,
		organisationName: row.organisation_name,
		role: row.role,
		email: row.email,
		name: row.name,
	};
}

async function findAccount(sql: Sql, workosUserId: string): Promise<AccountRow | null> {
	const rows = await sql<AccountRow[]>`
		SELECT
			u.user_id::text AS user_id,
			u.email,
			u.name,
			o.organisation_id::text AS organisation_id,
			o.organisation_name,
			m.role
		FROM users u
		JOIN organisations o ON o.personal_owner_user_id = u.user_id
		JOIN organisation_members m
			ON m.organisation_id = o.organisation_id AND m.user_id = u.user_id
		WHERE u.workos_user_id = ${workosUserId}
	`;
	return rows[0] ?? null;
}

async function upsertAccount(
	sql: Sql,
	user: AuthUser,
	cachedName: string | null,
	workspaceName: string,
): Promise<AccountRow> {
	return sql.begin(async (tx) => {
		const [userRow] = await tx<UserRow[]>`
			INSERT INTO users (workos_user_id, email, name)
			VALUES (${user.id}, ${user.email}, ${cachedName})
			ON CONFLICT (workos_user_id) DO UPDATE SET
				email = EXCLUDED.email,
				name = EXCLUDED.name
			RETURNING user_id::text AS user_id, email, name
		`;
		if (!userRow) {
			throw new Error("Failed to persist user");
		}

		const [organisationRow] = await tx<OrganisationRow[]>`
			INSERT INTO organisations (organisation_name, personal_owner_user_id)
			VALUES (${workspaceName}, ${userRow.user_id}::bigint)
			ON CONFLICT (personal_owner_user_id) DO UPDATE SET
				organisation_name = EXCLUDED.organisation_name
			RETURNING organisation_id::text AS organisation_id, organisation_name
		`;
		if (!organisationRow) {
			throw new Error("Failed to persist organisation");
		}

		await tx`
			INSERT INTO organisation_members (organisation_id, user_id, role)
			VALUES (${organisationRow.organisation_id}::bigint, ${userRow.user_id}::bigint, 'owner')
			ON CONFLICT (organisation_id, user_id) DO NOTHING
		`;

		return {
			user_id: userRow.user_id,
			email: userRow.email,
			name: userRow.name,
			organisation_id: organisationRow.organisation_id,
			organisation_name: organisationRow.organisation_name,
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
	const sql = getDb(event);
	const found = await findAccount(sql, user.id);
	if (
		found &&
		found.email === user.email &&
		found.name === profile.cachedName
	) {
		const account = toAccount(found);
		event.locals.account = account;
		return account;
	}

	const written = await upsertAccount(sql, user, profile.cachedName, profile.workspaceName);
	const account = toAccount(written);
	event.locals.account = account;
	return account;
}
