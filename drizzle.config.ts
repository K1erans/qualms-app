import { defineConfig } from "drizzle-kit";

function databaseUrl(): string {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is not set");
	}
	return url;
}

export default defineConfig({
	out: "./db/drizzle",
	schema: "./apps/web/src/lib/server/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl(),
	},
});
