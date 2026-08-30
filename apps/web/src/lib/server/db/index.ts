import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

function createDb(connectionString: string) {
	const client = postgres(connectionString, {
		max: 5,
		fetch_types: false,
	});
	return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;

let localDb: Database | undefined;

/**
 * Prefer the Hyperdrive binding on Workers; fall back to DATABASE_URL for
 * `vite dev` and drizzle-kit, where `platform.env` is unavailable.
 */
export function resolveConnectionString(hyperdrive?: Hyperdrive): string {
	const connectionString = hyperdrive?.connectionString ?? env.DATABASE_URL;
	if (!connectionString) {
		throw new Error(
			"Database is not configured. Set DATABASE_URL or bind Hyperdrive as HYPERDRIVE.",
		);
	}
	return connectionString;
}

/**
 * Create a Drizzle client. Pass `platform.env.HYPERDRIVE.connectionString`
 * in Workers (new client per request — Hyperdrive owns the pool).
 * Under `vite dev`, the DATABASE_URL client is reused.
 */
export function getDb(connectionString: string): Database {
	if (env.DATABASE_URL && connectionString === env.DATABASE_URL) {
		localDb ??= createDb(connectionString);
		return localDb;
	}

	return createDb(connectionString);
}

export { schema };
