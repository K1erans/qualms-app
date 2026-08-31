import postgres, { type Sql } from "postgres";
import type { RequestEvent } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export type { Sql };

export function getDb(event: RequestEvent): Sql {
	const existing = event.locals.sql;
	if (existing) return existing;

	const connectionString =
		event.platform?.env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("Database connection is not configured");
	}

	const sql = postgres(connectionString, {
		max: 1,
		fetch_types: false,
		prepare: false,
	});
	event.locals.sql = sql;
	return sql;
}

export function closeDb(event: RequestEvent): void {
	const sql = event.locals.sql;
	if (!sql) return;
	event.locals.sql = undefined;
	const closed = sql.end({ timeout: 5 });
	const waitUntil = event.platform?.ctx?.waitUntil;
	if (waitUntil) {
		waitUntil(closed);
		return;
	}
	void closed;
}
