<script lang="ts">
	import ChatSurface from "./ChatSurface.svelte";
	import IssuesSurface from "./IssuesSurface.svelte";
	import PanelToggle from "./PanelToggle.svelte";
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
			<div class="heading">
				{#if !workspace.sidebarOpen}
					<PanelToggle
						side="left"
						expanded={false}
						controls="repo-sidebar"
						onclick={() => workspace.toggleSidebar()}
					/>
				{/if}
				<div class="meta">
					<h1>{repo.fullName}</h1>
					<p>{repo.description}</p>
				</div>
			</div>
			<div class="header-end">
				<div class="tabs tabs-border" role="tablist" aria-label="Repository surfaces">
					{#each surfaces as item (item.id)}
						<button
							type="button"
							class={{ tab: true, "tab-active": workspace.surface === item.id }}
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
				{#if workspace.surface === "chat"}
					<div class="chats-toggle">
						<PanelToggle
							side="right"
							expanded={workspace.threadRailOpen}
							controls="chat-rail"
							onclick={() => workspace.toggleThreadRail()}
						/>
					</div>
				{/if}
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
