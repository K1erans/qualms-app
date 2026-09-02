<script lang="ts">
	import MessageSquare from "@lucide/svelte/icons/message-square";
	import Play from "@lucide/svelte/icons/play";
	import PanelToggle from "./PanelToggle.svelte";
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();

	type Crumb = {
		parent: string | null;
		up: (() => void) | null;
		title: string;
		tag: string | null;
	};

	const crumb = $derived.by((): Crumb => {
		if (workspace.settingsOpen) return { parent: null, up: null, title: "Settings", tag: null };
		const repo = workspace.selectedRepo;
		if (repo === null) return { parent: null, up: null, title: "Qualms", tag: null };

		if (workspace.surface === "chat") {
			const thread = workspace.selectedThread;
			return {
				parent: null,
				up: null,
				title: thread ? thread.title : "New chat",
				tag: thread && thread.testNumber !== null ? `T-${thread.testNumber}` : null,
			};
		}

		if (workspace.surface === "tests") {
			const test = workspace.selectedTest;
			if (test === null) return { parent: null, up: null, title: "Tests", tag: null };
			return {
				parent: "Tests",
				up: () => workspace.leaveTest(),
				title: test.name,
				tag: `T-${test.number}`,
			};
		}

		const issue = workspace.selectedIssue;
		if (issue === null) return { parent: null, up: null, title: "Findings", tag: null };
		return {
			parent: "Findings",
			up: () => workspace.leaveIssue(),
			title: issue.title,
			tag: `#${issue.number}`,
		};
	});

	const test = $derived(
		!workspace.settingsOpen && workspace.surface === "tests" ? workspace.selectedTest : null,
	);
	const issue = $derived(
		!workspace.settingsOpen && workspace.surface === "issues" ? workspace.selectedIssue : null,
	);
	const queued = $derived(test !== null && workspace.isRunQueued(test.id));
</script>

<header class="topbar">
	<div class="start">
		<PanelToggle
			side="left"
			expanded={workspace.sidebarOpen}
			controls="app-sidebar"
			onclick={() => workspace.toggleSidebar()}
		/>
		<div class="crumb">
			{#if crumb.parent !== null && crumb.up !== null}
				<button type="button" class="up" onclick={crumb.up}>{crumb.parent}</button>
				<span class="sep">/</span>
			{/if}
			<span class="title">{crumb.title}</span>
			{#if crumb.tag !== null}
				<span class="chip">{crumb.tag}</span>
			{/if}
		</div>
	</div>

	<div class="end">
		{#if test}
			<button
				type="button"
				class="btn"
				onclick={() => workspace.openTestConversation(test.id)}
			>
				<MessageSquare size={15} strokeWidth={1.75} />
				<span class="label">Open chat</span>
			</button>
			<button
				type="button"
				class="btn btn-primary"
				disabled={queued}
				onclick={() => workspace.queueRun(test.id)}
			>
				<Play size={14} strokeWidth={2} />
				<span class="label">{queued ? "Queued" : "Run now"}</span>
			</button>
		{:else if issue}
			<button type="button" class="btn" onclick={() => workspace.openTest(issue.testId)}>
				<span class="label">View test</span>
			</button>
			<button
				type="button"
				class="btn btn-primary"
				onclick={() => workspace.openIssueConversation(issue.id)}
			>
				<MessageSquare size={15} strokeWidth={1.75} />
				<span class="label">Discuss in chat</span>
			</button>
		{/if}
	</div>
</header>
