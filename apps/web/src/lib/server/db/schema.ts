import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const repositories = pgTable(
	"repositories",
	{
		id: text("id").primaryKey(),
		orgId: text("org_id").notNull(),
		url: text("url").notNull(),
		name: text("name").notNull(),
		description: text("description").notNull().default(""),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("repositories_org_id_url_idx").on(table.orgId, table.url),
	],
);
