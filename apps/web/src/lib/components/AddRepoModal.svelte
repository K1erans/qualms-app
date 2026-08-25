<script lang="ts">
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
		<h1 id="add-repo-title">Add repository</h1>
		<p class="hint">Pick a GitHub repository from this dummy account.</p>

		<label class="search">
			<span class="sr">Search repositories</span>
			<input
				class="input"
				type="search"
				placeholder="Search repositories"
				bind:value={query}
				aria-label="Search repositories"
			/>
		</label>

		<div class="list" role="listbox" aria-label="Connectable repositories">
			{#if personal.length > 0}
				<p class="group">Personal</p>
				{#each personal as repo (repo.id)}
					{@render row(repo)}
				{/each}
			{/if}
			{#each orgs as group (group.label)}
				<p class="group">{group.label}</p>
				{#each group.repos as repo (repo.id)}
					{@render row(repo)}
				{/each}
			{/each}
			{#if filtered.length === 0}
				<p class="none">No repositories match.</p>
			{/if}
		</div>

		<div class="actions">
			<button type="button" class="btn btn-ghost btn-sm" onclick={() => workspace.closeAddModal()}>
				Cancel
			</button>
			<button type="submit" class="btn btn-neutral btn-sm" disabled={pickedId === null}>
				Add
			</button>
		</div>
	</form>
</dialog>

{#snippet row(repo: ConnectableRepository)}
	<button
		type="button"
		role="option"
		aria-selected={pickedId === repo.id}
		class={["btn btn-ghost option", { picked: pickedId === repo.id }]}
		onclick={() => {
			pickedId = repo.id;
		}}
	>
		<span class="full">{repo.fullName}</span>
		<span class="desc">{repo.description}</span>
	</button>
{/snippet}
