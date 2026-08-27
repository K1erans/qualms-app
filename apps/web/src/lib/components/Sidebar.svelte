<script lang="ts">
	import { page } from "$app/state";
	import settingsIcon from "$lib/assets/settings_icon.svg";
	import PanelToggle from "./PanelToggle.svelte";
	import { getWorkspace } from "$lib/shell/context";
	import { ACCOUNT } from "$lib/shell/fixtures";

	const workspace = getWorkspace();
	const identity = $derived(page.data.identity ?? ACCOUNT);
</script>

<aside id="repo-sidebar" class={{ sidebar: true, open: workspace.sidebarOpen }}>
	<div class="brand">
		<p class="name">Qualms</p>
		<PanelToggle
			side="left"
			expanded={true}
			controls="repo-sidebar"
			onclick={() => workspace.toggleSidebar()}
		/>
	</div>

	<div class="repos">
		<p class="label" id="repo-list-label">Repositories</p>
		<ul class="menu menu-sm" aria-labelledby="repo-list-label">
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
		<div class="add">
			<button type="button" class="btn btn-primary btn-sm" onclick={() => workspace.openAddModal()}>
				Add repository
			</button>
		</div>
	</div>

	<div class="footer">
		<button
			type="button"
			class={{
				btn: true,
				"btn-ghost": true,
				"btn-sm": true,
				account: true,
				active: workspace.settingsOpen,
			}}
			aria-current={workspace.settingsOpen ? "page" : undefined}
			onclick={() => workspace.openSettings()}
		>
			<span class="who">{identity.displayName}</span>
			<img class="gear" src={settingsIcon} alt="" width="16" height="16" />
		</button>
	</div>
</aside>
