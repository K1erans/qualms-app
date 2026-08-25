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
			<button type="button" class="ghost" onclick={() => workspace.closeAddModal()}>
				Cancel
			</button>
			<button type="submit" class="solid" disabled={pickedId === null}>Add</button>
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
		<span class="full">{repo.fullName}</span>
		<span class="desc">{repo.description}</span>
	</button>
{/snippet}

<style>
	dialog {
		width: min(480px, calc(100vw - 32px));
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
	}

	dialog::backdrop {
		background: var(--overlay);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
	}

	h1 {
		font-size: 16px;
		font-weight: 600;
	}

	.hint {
		color: var(--muted);
	}

	.search input {
		width: 100%;
		height: 36px;
		padding: 0 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
	}

	.search input:focus {
		outline: 2px solid var(--text);
		outline-offset: 1px;
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	.list {
		max-height: 280px;
		overflow: auto;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
	}

	.group {
		padding: 8px 10px 4px;
		color: var(--muted);
		font-size: 12px;
		font-weight: 500;
	}

	.option {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 100%;
		padding: 8px 10px;
		border: 0;
		background: transparent;
		text-align: left;
	}

	.option:hover,
	.option.picked {
		background: var(--hover);
	}

	.full {
		font-family: var(--mono);
		font-size: 13px;
	}

	.desc {
		color: var(--muted);
		font-size: 12px;
	}

	.none {
		padding: 16px 10px;
		color: var(--muted);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}

	.ghost,
	.solid {
		height: 36px;
		padding: 0 12px;
		border-radius: var(--radius);
	}

	.ghost {
		border: 1px solid var(--border);
		background: transparent;
	}

	.solid {
		border: 0;
		background: var(--text);
		color: var(--surface);
	}

	.solid:disabled {
		opacity: 0.4;
	}
</style>
