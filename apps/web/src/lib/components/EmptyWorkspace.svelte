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
	<button type="button" onclick={() => workspace.openAddModal()}>Add repository</button>
</main>

<style>
	.empty {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		gap: 12px;
		max-width: 420px;
		padding: 24px;
		margin: auto;
	}

	h1 {
		font-size: 18px;
		font-weight: 600;
	}

	p {
		color: var(--muted);
	}

	button {
		width: fit-content;
		height: 36px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--text);
		color: var(--surface);
	}
</style>
