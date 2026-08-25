<script lang="ts">
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();
</script>

<aside class={{ sidebar: true, open: workspace.sidebarOpen }}>
	<div class="brand">
		<p class="name">Qualms</p>
		<p class="who">{workspace.identity.displayName}</p>
	</div>

	<div class="repos">
		<p class="label" id="repo-list-label">Repositories</p>
		<ul aria-labelledby="repo-list-label">
			{#each workspace.registeredRepos as repo (repo.id)}
				<li>
					<button
						type="button"
						class={{
							repo: true,
							active: !workspace.settingsOpen && workspace.selectedRepoId === repo.id,
						}}
						aria-current={!workspace.settingsOpen && workspace.selectedRepoId === repo.id
							? "page"
							: undefined}
						onclick={() => workspace.selectRepository(repo.id)}
					>
						<span class="full">{repo.fullName}</span>
						<span class="desc">{repo.description}</span>
					</button>
				</li>
			{/each}
		</ul>
		{#if workspace.registeredRepos.length === 0}
			<p class="empty">No repositories yet.</p>
		{/if}
	</div>

	<div class="footer">
		<button type="button" class="add" onclick={() => workspace.openAddModal()}>
			Add repository
		</button>
		<button
			type="button"
			class={{ account: true, active: workspace.settingsOpen }}
			aria-current={workspace.settingsOpen ? "page" : undefined}
			onclick={() => workspace.openSettings()}
		>
			Account
		</button>
	</div>
</aside>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		width: var(--sidebar-width);
		border-right: 1px solid var(--border);
		background: var(--sidebar);
	}

	.brand {
		padding: 16px 16px 12px;
		border-bottom: 1px solid var(--border);
	}

	.name {
		font-size: 16px;
		font-weight: 600;
	}

	.who {
		margin-top: 2px;
		color: var(--muted);
		font-size: 13px;
	}

	.repos {
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding: 12px 8px;
	}

	.label {
		padding: 0 8px 8px;
		color: var(--muted);
		font-size: 12px;
		font-weight: 500;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.repo {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 100%;
		padding: 8px;
		border: 0;
		border-radius: var(--radius);
		background: transparent;
		text-align: left;
	}

	.repo:hover {
		background: var(--hover);
	}

	.repo.active {
		background: var(--hover);
	}

	.full {
		font-family: var(--mono);
		font-size: 13px;
	}

	.desc {
		color: var(--muted);
		font-size: 12px;
		line-height: 1.35;
	}

	.empty {
		padding: 8px;
		color: var(--muted);
	}

	.footer {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border-top: 1px solid var(--border);
	}

	.add,
	.account {
		width: 100%;
		height: 36px;
		border-radius: var(--radius);
		text-align: left;
		padding: 0 10px;
	}

	.add {
		border: 1px solid var(--border);
		background: var(--surface);
	}

	.account {
		border: 0;
		background: transparent;
	}

	.account:hover,
	.add:hover {
		background: var(--hover);
	}

	.account.active {
		background: var(--hover);
	}

	@media (max-width: 799px) {
		.sidebar {
			position: fixed;
			top: 0;
			bottom: 0;
			left: 0;
			z-index: 30;
			display: none;
		}

		.sidebar.open {
			display: flex;
		}
	}
</style>
