<script lang="ts">
	import Check from "@lucide/svelte/icons/check";
	import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
	import CircleDot from "@lucide/svelte/icons/circle-dot";
	import FlaskConical from "@lucide/svelte/icons/flask-conical";
	import MessageSquare from "@lucide/svelte/icons/message-square";
	import Plus from "@lucide/svelte/icons/plus";
	import Settings from "@lucide/svelte/icons/settings";
	import { page } from "$app/state";
	import QualmsMark from "./QualmsMark.svelte";
	import { getWorkspace } from "$lib/shell/context";
	import { ACCOUNT } from "$lib/shell/fixtures";

	const workspace = getWorkspace();
	const identity = $derived(page.data.identity ?? ACCOUNT);
	const initials = $derived(
		identity.displayName
			.split(/\s+/)
			.filter((part: string) => part !== "")
			.slice(0, 2)
			.map((part: string) => part[0]?.toUpperCase() ?? "")
			.join("") || "?",
	);
	const repo = $derived(workspace.selectedRepo);
	const inRepo = $derived(!workspace.settingsOpen && repo !== null);
</script>

<aside id="app-sidebar" class={{ sidebar: true, open: workspace.sidebarOpen }}>
	<div class="switcher-wrap">
		<button
			type="button"
			class={{ switcher: true, open: workspace.switcherOpen }}
			aria-haspopup="listbox"
			aria-expanded={workspace.switcherOpen}
			aria-controls="repo-switcher"
			onclick={() => workspace.toggleSwitcher()}
		>
			<span class="mark"><QualmsMark size={16} /></span>
			<span class="text">
				<span class="title">{repo ? repo.fullName : "Choose a repository"}</span>
				<span class="sub">{repo ? repo.description : "No repository selected"}</span>
			</span>
			<ChevronsUpDown size={16} strokeWidth={2} class="caret" />
		</button>

		{#if workspace.switcherOpen}
			<div id="repo-switcher" class="popover" role="listbox" aria-label="Repositories">
				<p class="section-label">Repositories</p>
				{#each workspace.registeredRepos as item (item.id)}
					{@const open = workspace.openFindingCount(item.id)}
					<button
						type="button"
						role="option"
						class="popitem"
						aria-selected={item.id === workspace.selectedRepoId}
						onclick={() => workspace.selectRepository(item.id)}
					>
						<span class="name">{item.fullName}</span>
						{#if open > 0}
							<span class="open-count">{open} open</span>
						{/if}
						{#if item.id === workspace.selectedRepoId}
							<Check size={16} strokeWidth={2} class="current" />
						{/if}
					</button>
				{/each}
				{#if workspace.registeredRepos.length === 0}
					<p class="chats-empty">No repositories yet.</p>
				{/if}
				<div class="divider"></div>
				<button type="button" class="popitem" onclick={() => workspace.openAddModal()}>
					<Plus size={16} strokeWidth={2} />
					<span>Add repository…</span>
				</button>
			</div>
		{/if}
	</div>

	{#if repo}
		<nav aria-label="Repository">
			<button
				type="button"
				class={{ navitem: true, active: inRepo && workspace.surface === "chat" }}
				aria-current={inRepo && workspace.surface === "chat" ? "page" : undefined}
				onclick={() => workspace.openSurface("chat")}
			>
				<MessageSquare size={16} strokeWidth={1.75} />
				Chat
			</button>
			<button
				type="button"
				class={{ navitem: true, active: inRepo && workspace.surface === "tests" }}
				aria-current={inRepo && workspace.surface === "tests" ? "page" : undefined}
				onclick={() => workspace.openSurface("tests")}
			>
				<FlaskConical size={16} strokeWidth={1.75} />
				Tests
				<span class="count">{workspace.repoTests.length}</span>
			</button>
			<button
				type="button"
				class={{ navitem: true, active: inRepo && workspace.surface === "issues" }}
				aria-current={inRepo && workspace.surface === "issues" ? "page" : undefined}
				onclick={() => workspace.openSurface("issues")}
			>
				<CircleDot size={16} strokeWidth={1.75} />
				Findings
				<span class={{ count: true, fail: workspace.repoIssues.length > 0 }}>
					{workspace.repoIssues.length}
				</span>
			</button>
		</nav>

		<div class="chats">
			<div class="chats-head">
				<p class="section-label" id="chat-list-label">Chats</p>
				<button type="button" class="btn btn-ghost" onclick={() => workspace.newChat()}>
					<Plus size={14} strokeWidth={2} />
					New chat
				</button>
			</div>
			{#if workspace.threadGroups.length === 0}
				<p class="chats-empty">No chats yet.</p>
			{/if}
			{#each workspace.threadGroups as group (group.label)}
				<p class="group-label">{group.label}</p>
				{#each group.threads as thread (thread.id)}
					<button
						type="button"
						class={{
							chatitem: true,
							active:
								inRepo &&
								workspace.surface === "chat" &&
								workspace.selectedThreadId === thread.id,
						}}
						onclick={() => workspace.selectThread(thread.id)}
					>
						<span class="title">{thread.title}</span>
						{#if thread.testNumber !== null}
							<span class="tag">T-{thread.testNumber}</span>
						{/if}
					</button>
				{/each}
			{/each}
		</div>
	{:else}
		<div class="spacer"></div>
	{/if}

	<div class="footer">
		<button
			type="button"
			class={{ account: true, active: workspace.settingsOpen }}
			aria-current={workspace.settingsOpen ? "page" : undefined}
			onclick={() => workspace.openSettings()}
		>
			<span class="avatar">{initials}</span>
			<span class="text">
				<span class="name">{identity.displayName}</span>
				<span class="org">{identity.organization}</span>
			</span>
			<Settings size={16} strokeWidth={1.75} class="gear" />
		</button>
	</div>
</aside>

{#if workspace.switcherOpen}
	<button
		type="button"
		class="switcher-backdrop"
		aria-label="Close repository menu"
		onclick={() => workspace.closeSwitcher()}
	></button>
{/if}
