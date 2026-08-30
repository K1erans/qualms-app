import postgres, { type Sql } from "postgres";
import { env } from "$env/dynamic/private";

export type { Sql };

export function getDb(platform: App.Platform | undefined): Sql {
	const connectionString =
		platform?.env.HYPERDRIVE?.connectionString || env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("Database connection is not configured");
	}

	return postgres(connectionString, {
		max: 5,
		fetch_types: false,
	});
}
