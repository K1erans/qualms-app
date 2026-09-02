<script lang="ts">
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();
</script>

<main class="empty">
	<div class="inner">
		<h1>Choose a repository</h1>
		<p>
			{#if workspace.registeredRepos.length === 0}
				Add a repository from GitHub to start. Chat, tests and findings belong to a repository.
			{:else}
				Pick one from the switcher at the top of the sidebar, or add one from GitHub.
			{/if}
		</p>
		<button type="button" class="btn btn-primary" onclick={() => workspace.openAddModal()}>
			Add repository
		</button>
	</div>
</main>
