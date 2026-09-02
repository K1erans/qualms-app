<script lang="ts">
	import AddRepoModal from "./AddRepoModal.svelte";
	import EmptyWorkspace from "./EmptyWorkspace.svelte";
	import RepoWorkspace from "./RepoWorkspace.svelte";
	import SettingsPage from "./SettingsPage.svelte";
	import Sidebar from "./Sidebar.svelte";
	import TopBar from "./TopBar.svelte";
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();
</script>

<div class="shell">
	{#if workspace.sidebarOpen}
		<button
			type="button"
			class="backdrop"
			aria-label="Close sidebar"
			onclick={() => workspace.closeSidebar()}
		></button>
	{/if}

	<Sidebar />

	<div class="main">
		<TopBar />

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
