export type WorkspaceSurface = "chat" | "tests" | "issues";

export type TestFilter = "all" | "failed" | "passed";

export type RunOutcome = "passed" | "failed";

export type RunTrigger = "app" | "ci";

export type ChatRole = "user" | "assistant";

export type RegisteredRepository = {
	id: string;
	owner: string;
	name: string;
	fullName: string;
	description: string;
};

export type ConnectableKind = "personal" | "org";

export type ConnectableRepository = {
	id: string;
	owner: string;
	name: string;
	fullName: string;
	description: string;
	kind: ConnectableKind;
	orgLabel: string | null;
};

export type QualmsTest = {
	id: string;
	number: number;
	repositoryId: string;
	name: string;
	summary: string;
	lastRunAt: string;
	lastOutcome: RunOutcome;
	lastTrigger: RunTrigger;
	threadId: string;
};

export type QualmsIssue = {
	id: string;
	number: number;
	repositoryId: string;
	testId: string;
	testNumber: number;
	title: string;
	body: string;
	foundAt: string;
};

export type ChatMessage = {
	id: string;
	role: ChatRole;
	body: string;
	sentAt: string;
};

export type ChatThread = {
	id: string;
	repositoryId: string;
	title: string;
	testId: string | null;
	testNumber: number | null;
	messages: ChatMessage[];
	updatedAt: string;
};

export type OrganizationKind = "personal" | "organisation";

export type AccountIdentity = {
	displayName: string;
	handle: string;
	email: string;
	organization: string;
	organizationKind: OrganizationKind;
};
