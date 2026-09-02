<script lang="ts">
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleDot from "@lucide/svelte/icons/circle-dot";
	import { getWorkspace } from "$lib/shell/context";
	import { formatCompactTime, formatTrigger } from "$lib/shell/time";

	const workspace = getWorkspace();
	const now = Date.now();
	const issue = $derived(workspace.selectedIssue);
	const issueTest = $derived(workspace.selectedIssueTest);
	const thread = $derived(workspace.selectedIssueThread);
</script>

<main class="page issues">
	{#if issue}
		<div class="detail">
			<div class="body">
				<div>
					<div class="headline">
						<span class="status open">Open</span>
						<span class="mono muted" style="font-size: 12.5px;">#{issue.number}</span>
					</div>
					<h1>{issue.title}</h1>
					<p class="sub">
						Opened {formatCompactTime(issue.foundAt, now)} by a failed run of T-{issue.testNumber}
						{issueTest ? issueTest.name : ""}
					</p>
				</div>
				<div class="card prose">{issue.body}</div>
			</div>

			<aside class="side">
				<div class="card">
					<dl class="kv">
						<dt>Status</dt>
						<dd><span class="status open">Open</span></dd>
						<dt>Test</dt>
						<dd>
							<button type="button" class="link" onclick={() => workspace.openTest(issue.testId)}>
								T-{issue.testNumber} {issueTest ? issueTest.name : ""}
							</button>
						</dd>
						<dt>Started by</dt>
						<dd>{issueTest ? formatTrigger(issueTest.lastTrigger) : "—"}</dd>
						<dt>Found</dt>
						<dd>{formatCompactTime(issue.foundAt, now)}</dd>
						<dt>Chat</dt>
						<dd>
							<button
								type="button"
								class="link"
								onclick={() => workspace.openIssueConversation(issue.id)}
							>
								{thread ? thread.title : "Chat"}
							</button>
						</dd>
					</dl>
				</div>
			</aside>
		</div>
	{:else}
		<div class="page-inner">
			<div class="list">
				<div class="list-head">
					<CircleDot size={16} strokeWidth={2} class="ico-fail" />
					<span class="head-count">{workspace.repoIssues.length} open</span>
					<span class="head-note">Opened by failed test runs. Not GitHub Issues.</span>
				</div>
				{#each workspace.repoIssues as item (item.id)}
					{@const itemTest = workspace.testForIssue(item)}
					<button type="button" class="lrow" onclick={() => workspace.openIssue(item.id)}>
						<CircleDot size={18} strokeWidth={2} class="ico-fail" />
						<span class="lrow-main">
							<span class="lrow-title">{item.title}</span>
							<span class="lrow-sub">
								#{item.number} opened {formatCompactTime(item.foundAt, now)} by T-{item.testNumber}
								{itemTest ? itemTest.name : ""}
							</span>
						</span>
						<span class="lrow-end">
							{#if itemTest}
								<span class="chip">{formatTrigger(itemTest.lastTrigger)}</span>
							{/if}
							<ChevronRight size={16} strokeWidth={2} />
						</span>
					</button>
				{/each}
				{#if workspace.repoIssues.length === 0}
					<div class="clear">
						<CircleCheck size={24} strokeWidth={2} />
						<p style="font-weight: 500;">Nothing open</p>
						<p>Every test's last run passed.</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</main>
