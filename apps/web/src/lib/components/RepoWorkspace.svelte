<script lang="ts">
	import ChatSurface from "./ChatSurface.svelte";
	import IssuesSurface from "./IssuesSurface.svelte";
	import TestsSurface from "./TestsSurface.svelte";
	import { getWorkspace } from "$lib/shell/context";
	import type { WorkspaceSurface } from "$lib/shell/types";

	const workspace = getWorkspace();
	const repo = $derived(workspace.selectedRepo);

	const surfaces: { id: WorkspaceSurface; label: string }[] = [
		{ id: "chat", label: "Chat" },
		{ id: "tests", label: "Tests" },
		{ id: "issues", label: "Issues" },
	];
</script>

{#if repo}
	<div class="workspace">
		<header class="repo-header">
			<div class="meta">
				<h1>{repo.fullName}</h1>
				<p>{repo.description}</p>
			</div>
			<div class="tabs" role="tablist" aria-label="Repository surfaces">
				{#each surfaces as item (item.id)}
					<button
						type="button"
						role="tab"
						id={`tab-${item.id}`}
						aria-selected={workspace.surface === item.id}
						aria-controls={`panel-${item.id}`}
						onclick={() => workspace.openSurface(item.id)}
					>
						{item.label}
					</button>
				{/each}
			</div>
		</header>

		<div
			class="pane"
			role="tabpanel"
			id={`panel-${workspace.surface}`}
			aria-labelledby={`tab-${workspace.surface}`}
		>
			{#if workspace.surface === "chat"}
				<ChatSurface />
			{:else if workspace.surface === "tests"}
				<TestsSurface />
			{:else}
				<IssuesSurface />
			{/if}
		</div>
	</div>
{/if}

<style>
	.workspace {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
	}

	.repo-header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 12px 24px;
		padding: 16px 20px 0;
		border-bottom: 1px solid var(--border);
	}

	.meta {
		padding-bottom: 12px;
	}

	h1 {
		font-size: 16px;
		font-weight: 600;
		font-family: var(--mono);
	}

	p {
		margin-top: 2px;
		color: var(--muted);
	}

	.tabs {
		display: flex;
		gap: 16px;
	}

	.tabs button {
		padding: 0 0 10px;
		border: 0;
		border-bottom: 2px solid transparent;
		background: transparent;
		color: var(--muted);
	}

	.tabs button[aria-selected="true"] {
		border-bottom-color: var(--text);
		color: var(--text);
		font-weight: 500;
	}

	.pane {
		display: flex;
		flex: 1;
		min-height: 0;
	}

	@media (max-width: 799px) {
		.repo-header .meta {
			display: none;
		}

		.repo-header {
			padding: 0 16px;
		}

		.tabs button {
			padding-top: 12px;
		}
	}
</style>
