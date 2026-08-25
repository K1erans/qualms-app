<script lang="ts">
	import AddRepoModal from "./AddRepoModal.svelte";
	import EmptyWorkspace from "./EmptyWorkspace.svelte";
	import RepoWorkspace from "./RepoWorkspace.svelte";
	import SettingsPage from "./SettingsPage.svelte";
	import Sidebar from "./Sidebar.svelte";
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();
</script>

<div class="shell">
	{#if workspace.sidebarOpen}
		<button
			type="button"
			class="backdrop"
			aria-label="Close repository menu"
			onclick={() => workspace.closeSidebar()}
		></button>
	{/if}

	<Sidebar />

	<div class="main">
		<header class="mobile-bar">
			<button
				type="button"
				class="menu"
				aria-label="Open repository menu"
				onclick={() => workspace.openSidebar()}
			>
				Menu
			</button>
			<p class="mobile-title">
				{#if workspace.settingsOpen}
					Settings
				{:else if workspace.selectedRepo}
					{workspace.selectedRepo.fullName}
				{:else}
					Qualms
				{/if}
			</p>
		</header>

		{#if workspace.settingsOpen}
			<SettingsPage />
		{:else if workspace.selectedRepo}
			<RepoWorkspace />
		{:else}
			<EmptyWorkspace />
		{/if}
	</div>

	<AddRepoModal />
</div>

<style>
	.shell {
		display: flex;
		height: 100dvh;
		background: var(--bg);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 20;
		border: 0;
		padding: 0;
		background: var(--overlay);
	}

	.main {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		background: var(--surface);
	}

	.mobile-bar {
		display: flex;
		align-items: center;
		gap: 12px;
		height: 48px;
		padding: 0 12px;
		border-bottom: 1px solid var(--border);
		background: var(--surface);
	}

	.menu {
		height: 32px;
		padding: 0 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}

	.mobile-title {
		overflow: hidden;
		font-weight: 500;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (min-width: 800px) {
		.backdrop,
		.mobile-bar {
			display: none;
		}
	}
</style>
