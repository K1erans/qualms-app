<script lang="ts">
	import Search from "@lucide/svelte/icons/search";
	import { getWorkspace } from "$lib/shell/context";
	import type { ConnectableRepository } from "$lib/shell/types";

	const workspace = getWorkspace();

	let query = $state("");
	let pickedId = $state<string | null>(null);

	let filtered = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		if (needle === "") return workspace.connectableRepos;
		return workspace.connectableRepos.filter((repo) => {
			return (
				repo.fullName.toLowerCase().includes(needle) ||
				repo.description.toLowerCase().includes(needle)
			);
		});
	});

	let personal = $derived(filtered.filter((repo) => repo.kind === "personal"));
	let orgs = $derived.by(() => groupByOrg(filtered.filter((repo) => repo.kind === "org")));

	function isAdded(repo: ConnectableRepository): boolean {
		return workspace.registeredRepos.some((item) => item.id === repo.id);
	}

	function onClose(): void {
		query = "";
		pickedId = null;
		workspace.closeAddModal();
	}

	function confirmPicked(): void {
		if (pickedId === null) return;
		workspace.addConnectableRepository(pickedId);
	}

	type OrgGroup = {
		label: string;
		repos: ConnectableRepository[];
	};

	function groupByOrg(repos: ConnectableRepository[]): OrgGroup[] {
		const groups: OrgGroup[] = [];
		for (const repo of repos) {
			const label = repo.orgLabel ?? repo.owner;
			const existing = groups.find((group) => group.label === label);
			if (existing === undefined) {
				groups.push({ label, repos: [repo] });
			} else {
				existing.repos.push(repo);
			}
		}
		return groups;
	}
</script>

<dialog
	class="add-repo"
	{@attach (node: HTMLDialogElement) => {
		if (workspace.addModalOpen) {
			if (!node.open) node.showModal();
		} else if (node.open) {
			node.close();
		}
	}}
	aria-labelledby="add-repo-title"
	onclose={onClose}
	onkeydown={(event) => {
		if (event.key === "Enter" && pickedId !== null) {
			event.preventDefault();
			confirmPicked();
		}
	}}
>
	<form
		method="dialog"
		onsubmit={(event) => {
			event.preventDefault();
			confirmPicked();
		}}
	>
		<label class="search">
			<Search size={16} strokeWidth={2} />
			<span class="sr" id="add-repo-title">Add repository</span>
			<input
				type="search"
				placeholder="Search your GitHub repositories…"
				bind:value={query}
				aria-label="Search repositories"
			/>
			<span class="chip">esc</span>
		</label>

		<div class="list" role="listbox" aria-label="Repositories you can add">
			{#if personal.length > 0}
				<p class="section-label group">Personal</p>
				{#each personal as repo (repo.id)}
					{@render row(repo)}
				{/each}
			{/if}
			{#each orgs as group (group.label)}
				<p class="section-label group">{group.label}</p>
				{#each group.repos as repo (repo.id)}
					{@render row(repo)}
				{/each}
			{/each}
			{#if filtered.length === 0}
				<p class="none">No repositories match.</p>
			{/if}
		</div>

		<div class="actions">
			<button type="button" class="btn btn-ghost" onclick={() => workspace.closeAddModal()}>
				Cancel
			</button>
			<button type="submit" class="btn btn-primary" disabled={pickedId === null}>
				Add repository
			</button>
		</div>
	</form>
</dialog>

{#snippet row(repo: ConnectableRepository)}
	<button
		type="button"
		role="option"
		aria-selected={pickedId === repo.id}
		class={{ option: true, picked: pickedId === repo.id }}
		onclick={() => {
			pickedId = repo.id;
		}}
	>
		<span class="avatar">{repo.owner[0]?.toUpperCase() ?? "?"}</span>
		<span class="text">
			<span class="full">{repo.fullName}</span>
			<span class="desc">{repo.description}</span>
		</span>
		{#if isAdded(repo)}
			<span class="chip">Added</span>
		{/if}
	</button>
{/snippet}
