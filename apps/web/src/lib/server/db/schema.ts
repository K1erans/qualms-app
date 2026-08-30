import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const repositories = sqliteTable(
	"repositories",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		url: text("url").notNull(),
		name: text("name").notNull(),
		description: text("description").notNull().default(""),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.notNull()
			.default(sql`(unixepoch() * 1000)`),
	},
	(table) => [
		uniqueIndex("repositories_org_id_url_idx").on(table.orgId, table.url),
	],
);
