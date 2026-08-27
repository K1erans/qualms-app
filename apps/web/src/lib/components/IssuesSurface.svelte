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
			<button type="button" class="btn btn-sm" onclick={() => workspace.leaveIssue()}>
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
							<button
								type="button"
								class="btn btn-ghost"
								onclick={() => workspace.openIssue(item.id)}
							>
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
