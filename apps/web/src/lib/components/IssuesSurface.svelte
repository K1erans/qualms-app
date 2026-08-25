<script lang="ts">
	import { getWorkspace } from "$lib/shell/context";
	import { formatRelativeTime } from "$lib/shell/time";

	const workspace = getWorkspace();
	const now = Date.now();
	const issue = $derived(workspace.selectedIssue);
</script>

<div class="issues">
	{#if issue}
		<div class="detail">
			<button type="button" class="back" onclick={() => workspace.leaveIssue()}>
				Back to issues
			</button>
			<h2>{issue.title}</h2>
			<p class="meta">
				Finding #{issue.number} · T-{issue.testNumber} ·
				{formatRelativeTime(issue.foundAt, now)}
			</p>
			<p class="body">{issue.body}</p>
			<p class="note">Qualms finding from a Qualms test — not a GitHub issue.</p>
		</div>
	{:else}
		<div class="list">
			<p class="intro">
				Findings Qualms opened from its own tests. This is not a GitHub Issues list.
			</p>
			{#if workspace.repoIssues.length === 0}
				<p class="none">No findings for this repository.</p>
			{:else}
				<ul>
					{#each workspace.repoIssues as item (item.id)}
						<li>
							<button type="button" onclick={() => workspace.openIssue(item.id)}>
								<span class="title">{item.title}</span>
								<span class="meta">
									#{item.number} · T-{item.testNumber} ·
									{formatRelativeTime(item.foundAt, now)}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>

<style>
	.issues {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}

	.list,
	.detail {
		max-width: 720px;
		padding: 20px;
	}

	.intro,
	.none,
	.meta,
	.note {
		color: var(--muted);
	}

	.intro,
	.none {
		margin-bottom: 16px;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li + li {
		border-top: 1px solid var(--border);
	}

	li button {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 100%;
		padding: 12px 0;
		border: 0;
		background: transparent;
		text-align: left;
	}

	.title {
		font-weight: 500;
	}

	h2 {
		margin: 8px 0 8px;
		font-size: 18px;
	}

	.body {
		margin: 16px 0;
		white-space: pre-wrap;
	}

	.note {
		margin-top: 16px;
	}

	.back {
		height: 36px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}
</style>
