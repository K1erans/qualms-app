import { sql } from "drizzle-orm";
import {
	bigint,
	bigserial,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		userId: bigserial("user_id", { mode: "bigint" }).primaryKey(),
		workosUserId: varchar("workos_user_id", { length: 255 }).notNull().unique(),
		email: varchar("email", { length: 255 }).notNull(),
		name: varchar("name", { length: 255 }),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("idx_users_email").on(table.email)],
);

export const organisations = pgTable("organisations", {
	organisationId: bigserial("organisation_id", { mode: "bigint" }).primaryKey(),
	workosOrganizationId: varchar("workos_organization_id", { length: 255 }).unique(),
	organisationName: varchar("organisation_name", { length: 255 }).notNull(),
	personalOwnerUserId: bigint("personal_owner_user_id", { mode: "bigint" })
		.unique()
		.references(() => users.userId, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow(),
});

export const organisationMembers = pgTable(
	"organisation_members",
	{
		organisationMemberId: bigserial("organisation_member_id", { mode: "bigint" }).primaryKey(),
		organisationId: bigint("organisation_id", { mode: "bigint" })
			.notNull()
			.references(() => organisations.organisationId, { onDelete: "cascade" }),
		userId: bigint("user_id", { mode: "bigint" })
			.notNull()
			.references(() => users.userId, { onDelete: "cascade" }),
		workosMembershipId: varchar("workos_membership_id", { length: 255 }).unique(),
		role: varchar("role", { length: 50 }).notNull(),
		joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique().on(table.organisationId, table.userId),
		index("idx_organisation_members_organisation_id").on(table.organisationId),
		index("idx_organisation_members_user_id").on(table.userId),
	],
);

export const repositories = pgTable(
	"repositories",
	{
		repositoryId: bigserial("repository_id", { mode: "bigint" }).primaryKey(),
		organisationId: bigint("organisation_id", { mode: "bigint" })
			.notNull()
			.references(() => organisations.organisationId, { onDelete: "cascade" }),
		repoUrl: text("repo_url").notNull(),
		repoName: varchar("repo_name", { length: 255 }).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		lastModifiedAt: timestamp("last_modified_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		unique().on(table.organisationId, table.repoUrl),
		index("idx_repositories_organisation_id").on(table.organisationId),
	],
);

export const flows = pgTable(
	"flows",
	{
		flowId: bigserial("flow_id", { mode: "bigint" }).primaryKey(),
		repositoryId: bigint("repository_id", { mode: "bigint" })
			.notNull()
			.references(() => repositories.repositoryId, { onDelete: "cascade" }),
		name: varchar("name", { length: 255 }).notNull(),
		description: text("description"),
		definition: jsonb("definition").notNull().default(sql`'{}'::jsonb`),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		lastModifiedAt: timestamp("last_modified_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
	},
	(table) => [index("idx_flows_repository_id").on(table.repositoryId)],
);

export const testRuns = pgTable(
	"test_runs",
	{
		testRunId: bigserial("test_run_id", { mode: "bigint" }).primaryKey(),
		flowId: bigint("flow_id", { mode: "bigint" })
			.notNull()
			.references(() => flows.flowId, { onDelete: "cascade" }),
		commitSha: varchar("commit_sha", { length: 64 }),
		branch: varchar("branch", { length: 255 }),
		status: varchar("status", { length: 50 }).notNull(),
		triggerType: varchar("trigger_type", { length: 50 }).notNull(),
		startedAt: timestamp("started_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
	},
	(table) => [index("idx_test_runs_flow_id").on(table.flowId)],
);

export const runSteps = pgTable(
	"run_steps",
	{
		runStepId: bigserial("run_step_id", { mode: "bigint" }).primaryKey(),
		testRunId: bigint("test_run_id", { mode: "bigint" })
			.notNull()
			.references(() => testRuns.testRunId, { onDelete: "cascade" }),
		sequenceNumber: integer("sequence_number").notNull(),
		action: text("action").notNull(),
		status: varchar("status", { length: 50 }).notNull(),
		startedAt: timestamp("started_at", { withTimezone: true, mode: "date" })
			.notNull()
			.defaultNow(),
		finishedAt: timestamp("finished_at", { withTimezone: true, mode: "date" }),
	},
	(table) => [
		unique().on(table.testRunId, table.sequenceNumber),
		index("idx_run_steps_test_run_id").on(table.testRunId),
	],
);
