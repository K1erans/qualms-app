<script lang="ts">
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();
</script>

<main class="empty">
	<h1>Select a repository</h1>
	<p>
		{#if workspace.registeredRepos.length === 0}
			Add a repository to start a workspace. Chat, Tests, and Issues stay off until one is
			selected.
		{:else}
			Pick a repository in the sidebar, or add another from GitHub. Chat, Tests, and Issues
			stay off until one is selected.
		{/if}
	</p>
	<button type="button" class="btn btn-neutral btn-sm" onclick={() => workspace.openAddModal()}>
		Add repository
	</button>
</main>
