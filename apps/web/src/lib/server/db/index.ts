import { drizzle, type AnyD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Create a Drizzle client from the Worker D1 binding.
 *
 *   getDb(platform.env.DB)
 *
 * `vite dev` and `wrangler dev` both populate `platform.env.DB` via the
 * Cloudflare adapter / Wrangler. There is no connection string.
 */
export function getDb(database: AnyD1Database) {
	return drizzle(database, { schema });
}

export type Database = ReturnType<typeof getDb>;

export { schema };
