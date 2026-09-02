import type {
	AccountIdentity,
	ChatThread,
	ConnectableRepository,
	QualmsIssue,
	QualmsTest,
	RegisteredRepository,
} from "./types";

export const ACCOUNT: AccountIdentity = {
	displayName: "Mara Okonkwo",
	handle: "mara",
	email: "mara@acme.example",
	organization: "Acme",
	organizationKind: "organisation",
};

export const SEED_REPOSITORIES: RegisteredRepository[] = [
	{
		id: "repo-checkout",
		owner: "acme",
		name: "checkout-api",
		fullName: "acme/checkout-api",
		description: "Payment capture, refunds, and decline handling.",
	},
	{
		id: "repo-storefront",
		owner: "acme",
		name: "storefront",
		fullName: "acme/storefront",
		description: "Customer-facing catalog, cart, and checkout UI.",
	},
	{
		id: "repo-notes",
		owner: "mara",
		name: "notes-cli",
		fullName: "mara/notes-cli",
		description: "Local-first notes tool with sync to a personal vault.",
	},
];

export const CONNECTABLE_REPOSITORIES: ConnectableRepository[] = [
	{
		id: "repo-notes",
		owner: "mara",
		name: "notes-cli",
		fullName: "mara/notes-cli",
		description: "Local-first notes tool with sync to a personal vault.",
		kind: "personal",
		orgLabel: null,
	},
	{
		id: "repo-dotfiles",
		owner: "mara",
		name: "dotfiles",
		fullName: "mara/dotfiles",
		description: "Shell, editor, and machine setup.",
		kind: "personal",
		orgLabel: null,
	},
	{
		id: "repo-garden",
		owner: "mara",
		name: "garden",
		fullName: "mara/garden",
		description: "Personal site and writing garden.",
		kind: "personal",
		orgLabel: null,
	},
	{
		id: "repo-checkout",
		owner: "acme",
		name: "checkout-api",
		fullName: "acme/checkout-api",
		description: "Payment capture, refunds, and decline handling.",
		kind: "org",
		orgLabel: "Acme",
	},
	{
		id: "repo-storefront",
		owner: "acme",
		name: "storefront",
		fullName: "acme/storefront",
		description: "Customer-facing catalog, cart, and checkout UI.",
		kind: "org",
		orgLabel: "Acme",
	},
	{
		id: "repo-billing",
		owner: "acme",
		name: "billing-worker",
		fullName: "acme/billing-worker",
		description: "Invoice generation and dunning jobs.",
		kind: "org",
		orgLabel: "Acme",
	},
	{
		id: "repo-inventory",
		owner: "acme",
		name: "inventory",
		fullName: "acme/inventory",
		description: "Stock levels and warehouse events.",
		kind: "org",
		orgLabel: "Acme",
	},
];

export const QUALMS_TESTS: QualmsTest[] = [
	{
		id: "test-refund-idempotency",
		number: 12,
		repositoryId: "repo-checkout",
		name: "Refund idempotency",
		summary: "A repeated refund request must not capture twice or leave the ledger split.",
		lastRunAt: "2026-08-25T16:10:00.000Z",
		lastOutcome: "failed",
		lastTrigger: "ci",
		threadId: "thread-refunds",
	},
	{
		id: "test-card-declines",
		number: 14,
		repositoryId: "repo-checkout",
		name: "Card decline paths",
		summary: "Soft and hard declines must surface the right retry and customer copy.",
		lastRunAt: "2026-08-25T09:42:00.000Z",
		lastOutcome: "passed",
		lastTrigger: "app",
		threadId: "thread-declines",
	},
	{
		id: "test-webhook-replay",
		number: 18,
		repositoryId: "repo-checkout",
		name: "Processor webhook replay",
		summary: "Out-of-order webhook delivery must still settle the payment correctly.",
		lastRunAt: "2026-08-24T21:05:00.000Z",
		lastOutcome: "passed",
		lastTrigger: "ci",
		threadId: "thread-webhooks",
	},
	{
		id: "test-cart-hold",
		number: 7,
		repositoryId: "repo-storefront",
		name: "Cart inventory hold",
		summary: "Adding the last unit to a cart must hold stock until checkout or expiry.",
		lastRunAt: "2026-08-25T18:02:00.000Z",
		lastOutcome: "failed",
		lastTrigger: "app",
		threadId: "thread-cart",
	},
	{
		id: "test-guest-checkout",
		number: 9,
		repositoryId: "repo-storefront",
		name: "Guest checkout",
		summary: "A guest can complete purchase without creating an account mid-flow.",
		lastRunAt: "2026-08-23T11:30:00.000Z",
		lastOutcome: "passed",
		lastTrigger: "ci",
		threadId: "thread-guest",
	},
	{
		id: "test-sync-conflict",
		number: 3,
		repositoryId: "repo-notes",
		name: "Offline sync conflict",
		summary: "Two devices editing the same note offline must not drop either version.",
		lastRunAt: "2026-08-25T12:15:00.000Z",
		lastOutcome: "failed",
		lastTrigger: "app",
		threadId: "thread-sync",
	},
	{
		id: "test-export-markdown",
		number: 4,
		repositoryId: "repo-notes",
		name: "Markdown export",
		summary: "Export writes a vault that round-trips wiki links and front matter.",
		lastRunAt: "2026-08-22T08:00:00.000Z",
		lastOutcome: "passed",
		lastTrigger: "ci",
		threadId: "thread-export",
	},
];

export const QUALMS_ISSUES: QualmsIssue[] = [
	{
		id: "issue-double-refund",
		number: 41,
		repositoryId: "repo-checkout",
		testId: "test-refund-idempotency",
		testNumber: 12,
		title: "Second refund POST credits the customer twice",
		body: "When the client retries /refunds with the same idempotency key after a 502, checkout-api writes a second credit. Ledger shows −$48 then −$48 against payment pay_9f2. The processor captured once.\n\nQualms ran T-12 from CI on main after the webhook timeout fix. The retry window in RefundService still treats a missing processor receipt as a new refund.",
		foundAt: "2026-08-25T16:10:00.000Z",
	},
	{
		id: "issue-hold-race",
		number: 17,
		repositoryId: "repo-storefront",
		testId: "test-cart-hold",
		testNumber: 7,
		title: "Last unit can sit in two carts at once",
		body: "Two browsers add sku_oak_chair while stock is 1. Both carts show the item. Checkout for the first succeeds; the second fails only at payment, after the customer has entered a card.\n\nT-7 is a Qualms-defined check. Last App run failed on the hold expiry path: the hold row is written after the cart response, not before.",
		foundAt: "2026-08-25T18:02:00.000Z",
	},
	{
		id: "issue-sync-drop",
		number: 8,
		repositoryId: "repo-notes",
		testId: "test-sync-conflict",
		testNumber: 3,
		title: "Losing side of a conflict is deleted, not kept",
		body: "Device A edits the body offline. Device B edits the title offline. After both sync, the body from A is gone. The conflict file is never written.\n\nT-3 failed on the App run this afternoon. MergeNotes still picks last-write-wins on the whole document instead of per-field or a conflict copy.",
		foundAt: "2026-08-25T12:15:00.000Z",
	},
];

export const SEED_THREADS: ChatThread[] = [
	{
		id: "thread-refunds",
		repositoryId: "repo-checkout",
		title: "Refund retries",
		testId: "test-refund-idempotency",
		testNumber: 12,
		updatedAt: "2026-08-25T16:22:00.000Z",
		messages: [
			{
				id: "m-ref-1",
				role: "user",
				body: "Write a Qualms test an agent can take for refund retries: same refund twice after a 502 must not credit twice.",
				sentAt: "2026-08-25T16:12:00.000Z",
			},
			{
				id: "m-ref-2",
				role: "assistant",
				body: "I’ll define T-12 Refund idempotency. The agent sends a refund, then retries with the same idempotency key after a simulated 502. Pass if the ledger has a single −$48 against pay_9f2.",
				sentAt: "2026-08-25T16:12:40.000Z",
			},
			{
				id: "m-ref-3",
				role: "user",
				body: "Should the agent also assert the processor captured once?",
				sentAt: "2026-08-25T16:20:00.000Z",
			},
			{
				id: "m-ref-4",
				role: "assistant",
				body: "Yes. I’ll add that to T-12. Qualms owns the definition; CI can kick it on main. Finding #41 is what a failed run of this test would open.",
				sentAt: "2026-08-25T16:22:00.000Z",
			},
		],
	},
	{
		id: "thread-checkout-general",
		repositoryId: "repo-checkout",
		title: "What should we cover next",
		testId: null,
		testNumber: null,
		updatedAt: "2026-08-24T19:40:00.000Z",
		messages: [
			{
				id: "m-gen-1",
				role: "user",
				body: "We added 3-D Secure last week. Write a Qualms test an agent can take for challenge vs frictionless.",
				sentAt: "2026-08-24T19:30:00.000Z",
			},
			{
				id: "m-gen-2",
				role: "assistant",
				body: "Nothing in this repo’s tests covers the challenge window yet. I’ll add a Qualms test: the agent completes frictionless 3DS and a challenge flow. CI can kick it on the payments folder. T-14 still stops at the processor decline code.",
				sentAt: "2026-08-24T19:40:00.000Z",
			},
		],
	},
	{
		id: "thread-declines",
		repositoryId: "repo-checkout",
		title: "Card decline paths",
		testId: "test-card-declines",
		testNumber: 14,
		updatedAt: "2026-08-25T09:50:00.000Z",
		messages: [
			{
				id: "m-dec-1",
				role: "user",
				body: "Create a Qualms test for card declines an agent can run — soft vs hard.",
				sentAt: "2026-08-25T09:45:00.000Z",
			},
			{
				id: "m-dec-2",
				role: "assistant",
				body: "T-14 Card decline paths. The agent presents insufficient funds (retryable) and stolen card (stop, stolen-card copy). Last App run passed; no finding was opened.",
				sentAt: "2026-08-25T09:50:00.000Z",
			},
		],
	},
	{
		id: "thread-webhooks",
		repositoryId: "repo-checkout",
		title: "Processor webhook replay",
		testId: "test-webhook-replay",
		testNumber: 18,
		updatedAt: "2026-08-24T21:10:00.000Z",
		messages: [
			{
				id: "m-wh-1",
				role: "assistant",
				body: "I drafted T-18 Processor webhook replay. An agent delivers capture then authorize out of order; the payment must still settle. CI can kick this on the webhooks folder.",
				sentAt: "2026-08-24T21:10:00.000Z",
			},
		],
	},
	{
		id: "thread-cart",
		repositoryId: "repo-storefront",
		title: "Cart inventory hold",
		testId: "test-cart-hold",
		testNumber: 7,
		updatedAt: "2026-08-25T18:08:00.000Z",
		messages: [
			{
				id: "m-cart-1",
				role: "user",
				body: "Write a test an agent can take: two carts must not both hold the last oak chair.",
				sentAt: "2026-08-25T18:04:00.000Z",
			},
			{
				id: "m-cart-2",
				role: "assistant",
				body: "T-7 Cart inventory hold. The agent adds the last sku_oak_chair from two sessions. Pass if only one cart gets the hold, written before the add-to-cart response. Finding #17 is what a failed run of this test would open.",
				sentAt: "2026-08-25T18:08:00.000Z",
			},
		],
	},
	{
		id: "thread-storefront-general",
		repositoryId: "repo-storefront",
		title: "Guest vs account",
		testId: null,
		testNumber: null,
		updatedAt: "2026-08-23T15:00:00.000Z",
		messages: [
			{
				id: "m-sf-1",
				role: "user",
				body: "Should guest checkout be a Qualms test an agent takes, or just product copy?",
				sentAt: "2026-08-23T14:50:00.000Z",
			},
			{
				id: "m-sf-2",
				role: "assistant",
				body: "Keep it as a test. T-9: the agent completes purchase as a guest without an account being created mid-flow. Qualms owns the definition; CI only kicks it. Marketing copy is not a test.",
				sentAt: "2026-08-23T15:00:00.000Z",
			},
		],
	},
	{
		id: "thread-guest",
		repositoryId: "repo-storefront",
		title: "Guest checkout",
		testId: "test-guest-checkout",
		testNumber: 9,
		updatedAt: "2026-08-23T11:35:00.000Z",
		messages: [
			{
				id: "m-guest-1",
				role: "assistant",
				body: "T-9 Guest checkout is defined. An agent checks out as a guest; no account is created mid-flow. CI can kick this on the checkout folder.",
				sentAt: "2026-08-23T11:35:00.000Z",
			},
		],
	},
	{
		id: "thread-sync",
		repositoryId: "repo-notes",
		title: "Offline sync conflict",
		testId: "test-sync-conflict",
		testNumber: 3,
		updatedAt: "2026-08-25T12:20:00.000Z",
		messages: [
			{
				id: "m-sync-1",
				role: "user",
				body: "Create a test for an agent: two devices edit the same note offline and neither version is dropped.",
				sentAt: "2026-08-25T12:16:00.000Z",
			},
			{
				id: "m-sync-2",
				role: "assistant",
				body: "T-3 Offline sync conflict. The agent edits the body on device A and the title on device B offline, then both sync. Pass if both changes survive — conflict copy or per-field merge, not last-write-wins on the whole file.",
				sentAt: "2026-08-25T12:20:00.000Z",
			},
		],
	},
	{
		id: "thread-notes-general",
		repositoryId: "repo-notes",
		title: "What are we testing today",
		testId: null,
		testNumber: null,
		updatedAt: "2026-08-21T10:00:00.000Z",
		messages: [
			{
				id: "m-notes-1",
				role: "user",
				body: "I only want Qualms tests an agent can take for sync and export. Don’t bother with UI chrome.",
				sentAt: "2026-08-21T09:50:00.000Z",
			},
			{
				id: "m-notes-2",
				role: "assistant",
				body: "Then I’ll keep T-3 (offline conflict) and T-4 (markdown export) for an agent to take. Both are defined here; CI already kicks T-4. T-3 is App-triggered for now.",
				sentAt: "2026-08-21T10:00:00.000Z",
			},
		],
	},
	{
		id: "thread-export",
		repositoryId: "repo-notes",
		title: "Markdown export",
		testId: "test-export-markdown",
		testNumber: 4,
		updatedAt: "2026-08-22T08:05:00.000Z",
		messages: [
			{
				id: "m-ex-1",
				role: "assistant",
				body: "T-4 Markdown export is defined. An agent exports a vault; wiki links and front matter must round-trip. CI can kick this on the export path.",
				sentAt: "2026-08-22T08:05:00.000Z",
			},
		],
	},
];

const SUGGESTIONS = {
	"repo-checkout": [
		"Write a test for 3-D Secure challenge vs frictionless",
		"What isn't covered by T-12, T-14 and T-18 yet?",
		"Explain finding #41 and how to reproduce it",
	],
	"repo-storefront": [
		"Write a test for cart expiry after 15 minutes",
		"What isn't covered by T-7 and T-9 yet?",
		"Explain finding #17 and how to reproduce it",
	],
	"repo-notes": [
		"Write a test for renaming a note while offline",
		"What isn't covered by T-3 and T-4 yet?",
		"Explain finding #8 and how to reproduce it",
	],
} satisfies Record<string, string[]>;

const DEFAULT_SUGGESTIONS = [
	"Write a test for the main user flow",
	"What should we cover first?",
	"What can an agent check in this repository?",
];

function hasSuggestions(repositoryId: string): repositoryId is keyof typeof SUGGESTIONS {
	return Object.hasOwn(SUGGESTIONS, repositoryId);
}

export function suggestionsForRepository(repositoryId: string): string[] {
	return hasSuggestions(repositoryId) ? SUGGESTIONS[repositoryId] : DEFAULT_SUGGESTIONS;
}

export function findingForTest(testId: string): QualmsIssue | null {
	return QUALMS_ISSUES.find((issue) => issue.testId === testId) ?? null;
}

export function testsForRepository(repositoryId: string): QualmsTest[] {
	return QUALMS_TESTS.filter((test) => test.repositoryId === repositoryId);
}

export function issuesForRepository(repositoryId: string): QualmsIssue[] {
	return QUALMS_ISSUES.filter((issue) => issue.repositoryId === repositoryId);
}

export function testById(testId: string): QualmsTest | null {
	return QUALMS_TESTS.find((test) => test.id === testId) ?? null;
}

export function connectableById(connectableId: string): ConnectableRepository | null {
	return CONNECTABLE_REPOSITORIES.find((repo) => repo.id === connectableId) ?? null;
}

export function toRegisteredRepository(
	connectable: ConnectableRepository,
): RegisteredRepository {
	return {
		id: connectable.id,
		owner: connectable.owner,
		name: connectable.name,
		fullName: connectable.fullName,
		description: connectable.description,
	};
}
