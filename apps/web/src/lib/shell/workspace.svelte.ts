import {
	ACCOUNT,
	CONNECTABLE_REPOSITORIES,
	SEED_REPOSITORIES,
	SEED_THREADS,
	connectableById,
	issuesForRepository,
	testById,
	testsForRepository,
	toRegisteredRepository,
} from "./fixtures";
import { readLastUsedRepoId, writeLastUsedRepoId } from "./persistence";
import type {
	AccountIdentity,
	ChatThread,
	ConnectableRepository,
	QualmsIssue,
	QualmsTest,
	RegisteredRepository,
	WorkspaceSurface,
} from "./types";

function cloneThreads(threads: ChatThread[]): ChatThread[] {
	return threads.map((thread) => ({
		...thread,
		messages: thread.messages.map((message) => ({ ...message })),
	}));
}

function newestThreadId(threads: ChatThread[]): string | null {
	let newest: ChatThread | null = null;
	for (const thread of threads) {
		if (newest === null || thread.updatedAt > newest.updatedAt) newest = thread;
	}
	return newest === null ? null : newest.id;
}

export class Workspace {
	registeredRepos = $state<RegisteredRepository[]>([...SEED_REPOSITORIES]);
	threads = $state<ChatThread[]>(cloneThreads(SEED_THREADS));
	selectedRepoId = $state<string | null>(null);
	surface = $state<WorkspaceSurface>("chat");
	settingsOpen = $state(false);
	addModalOpen = $state(false);
	sidebarOpen = $state(false);
	threadRailOpen = $state(false);
	selectedThreadId = $state<string | null>(null);
	selectedTestId = $state<string | null>(null);
	selectedIssueId = $state<string | null>(null);
	draft = $state("");
	lastUsedRestored = $state(false);

	readonly identity: AccountIdentity = ACCOUNT;
	readonly connectableRepos: ConnectableRepository[] = CONNECTABLE_REPOSITORIES;

	selectedRepo = $derived(
		this.registeredRepos.find((repo) => repo.id === this.selectedRepoId) ?? null,
	);

	repoTests = $derived.by((): QualmsTest[] => {
		if (this.selectedRepoId === null) return [];
		return testsForRepository(this.selectedRepoId);
	});

	repoIssues = $derived.by((): QualmsIssue[] => {
		if (this.selectedRepoId === null) return [];
		return issuesForRepository(this.selectedRepoId);
	});

	repoThreads = $derived.by((): ChatThread[] => {
		if (this.selectedRepoId === null) return [];
		return this.threads
			.filter((thread) => thread.repositoryId === this.selectedRepoId)
			.slice()
			.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0));
	});

	selectedThread = $derived(
		this.repoThreads.find((thread) => thread.id === this.selectedThreadId) ?? null,
	);

	selectedTest = $derived(
		this.repoTests.find((test) => test.id === this.selectedTestId) ?? null,
	);

	selectedIssue = $derived(
		this.repoIssues.find((issue) => issue.id === this.selectedIssueId) ?? null,
	);

	restoreLastUsed(): void {
		if (this.lastUsedRestored) return;
		this.lastUsedRestored = true;
		const lastUsedId = readLastUsedRepoId();
		if (lastUsedId === null) return;
		if (!this.registeredRepos.some((repo) => repo.id === lastUsedId)) return;
		this.selectRepository(lastUsedId);
	}

	selectRepository(repositoryId: string): void {
		this.selectedRepoId = repositoryId;
		this.surface = "chat";
		this.settingsOpen = false;
		this.selectedTestId = null;
		this.selectedIssueId = null;
		this.sidebarOpen = false;
		this.threadRailOpen = false;
		this.draft = "";
		writeLastUsedRepoId(repositoryId);
		const repoThreads = this.threads.filter((thread) => thread.repositoryId === repositoryId);
		this.selectedThreadId = newestThreadId(repoThreads);
	}

	openSurface(next: WorkspaceSurface): void {
		if (this.selectedRepoId === null) return;
		this.surface = next;
		this.settingsOpen = false;
		this.selectedTestId = null;
		this.selectedIssueId = null;
		this.threadRailOpen = false;
	}

	openSettings(): void {
		this.settingsOpen = true;
		this.addModalOpen = false;
		this.sidebarOpen = false;
		this.threadRailOpen = false;
	}

	leaveSettings(): void {
		this.settingsOpen = false;
	}

	openAddModal(): void {
		this.addModalOpen = true;
		this.sidebarOpen = false;
	}

	closeAddModal(): void {
		this.addModalOpen = false;
	}

	addConnectableRepository(connectableId: string): void {
		const connectable = connectableById(connectableId);
		if (connectable === null) return;

		const existing = this.registeredRepos.find((repo) => repo.id === connectable.id);
		if (existing !== undefined) {
			this.selectRepository(existing.id);
			this.closeAddModal();
			return;
		}

		this.registeredRepos.push(toRegisteredRepository(connectable));
		this.selectRepository(connectable.id);
		this.closeAddModal();
	}

	selectThread(threadId: string): void {
		this.selectedThreadId = threadId;
		this.surface = "chat";
		this.settingsOpen = false;
		this.threadRailOpen = false;
	}

	openTest(testId: string): void {
		this.surface = "tests";
		this.selectedTestId = testId;
		this.settingsOpen = false;
	}

	leaveTest(): void {
		this.selectedTestId = null;
	}

	openIssue(issueId: string): void {
		this.surface = "issues";
		this.selectedIssueId = issueId;
		this.settingsOpen = false;
	}

	leaveIssue(): void {
		this.selectedIssueId = null;
	}

	openTestConversation(testId: string): void {
		const test = testById(testId);
		if (test === null) return;
		this.selectRepository(test.repositoryId);
		this.selectThread(test.threadId);
	}

	openSidebar(): void {
		this.sidebarOpen = true;
	}

	closeSidebar(): void {
		this.sidebarOpen = false;
	}

	openThreadRail(): void {
		this.threadRailOpen = true;
	}

	closeThreadRail(): void {
		this.threadRailOpen = false;
	}

	sendDraft(): void {
		const text = this.draft.trim();
		if (text === "" || this.selectedRepoId === null) return;

		const now = new Date().toISOString();
		let thread = this.selectedThread;
		if (thread === null) {
			const created: ChatThread = {
				id: `thread-${crypto.randomUUID()}`,
				repositoryId: this.selectedRepoId,
				title: titleFromDraft(text),
				testId: null,
				testNumber: null,
				updatedAt: now,
				messages: [],
			};
			this.threads.push(created);
			this.selectedThreadId = created.id;
			thread = created;
		}

		thread.messages.push({
			id: `m-${crypto.randomUUID()}`,
			role: "user",
			body: text,
			sentAt: now,
		});
		thread.messages.push({
			id: `m-${crypto.randomUUID()}`,
			role: "assistant",
			body: assistantReply(thread),
			sentAt: now,
		});
		thread.updatedAt = now;
		this.draft = "";
	}
}

function titleFromDraft(text: string): string {
	const firstLine = text.split("\n")[0]?.trim() ?? "New chat";
	if (firstLine.length <= 48) return firstLine;
	return `${firstLine.slice(0, 45)}…`;
}

function assistantReply(thread: ChatThread): string {
	if (thread.testNumber !== null) {
		return `I’ll keep this on T-${thread.testNumber}. This is dummy Qualms chat — nothing is running yet.`;
	}
	return "I’ll keep this on the repo. Ask about a Qualms test or a finding and I can pull the dummy thread for it.";
}
