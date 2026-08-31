import postgres, { type Sql } from "postgres";
import type { RequestEvent } from "@sveltejs/kit";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

export type { Sql };
export type Database = PostgresJsDatabase<typeof schema>;

export function getDb(event: RequestEvent): Database {
	const existing = event.locals.db;
	if (existing) return existing;

	const connectionString =
		event.platform?.env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("Database connection is not configured");
	}

	const client = postgres(connectionString, {
		max: 1,
		fetch_types: false,
		prepare: false,
	});
	const db = drizzle(client, { schema });
	event.locals.sql = client;
	event.locals.db = db;
	return db;
}

export async function closeDb(event: RequestEvent): Promise<void> {
	const sql = event.locals.sql;
	if (!sql) return;
	event.locals.sql = undefined;
	event.locals.db = undefined;
	const closed = sql.end({ timeout: 5 });
	const waitUntil = event.platform?.ctx?.waitUntil;
	if (waitUntil) {
		waitUntil(closed);
		return;
	}
	await closed;
}
