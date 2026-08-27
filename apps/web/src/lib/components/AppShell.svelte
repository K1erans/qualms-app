<script lang="ts">
	import AddRepoModal from "./AddRepoModal.svelte";
	import EmptyWorkspace from "./EmptyWorkspace.svelte";
	import PanelToggle from "./PanelToggle.svelte";
	import RepoWorkspace from "./RepoWorkspace.svelte";
	import SettingsPage from "./SettingsPage.svelte";
	import Sidebar from "./Sidebar.svelte";
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();
	const chromeToggleVisible = $derived(
		!workspace.sidebarOpen && (workspace.settingsOpen || workspace.selectedRepo === null),
	);
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
		<header class={{ chrome: true, "has-repo-toggle": chromeToggleVisible }}>
			{#if chromeToggleVisible}
				<PanelToggle
					side="left"
					expanded={false}
					controls="repo-sidebar"
					onclick={() => workspace.toggleSidebar()}
				/>
			{/if}
			<p class="chrome-title">
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
