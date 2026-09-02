<script lang="ts">
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import Clock from "@lucide/svelte/icons/clock";
	import Search from "@lucide/svelte/icons/search";
	import { getWorkspace } from "$lib/shell/context";
	import { findingForTest } from "$lib/shell/fixtures";
	import { formatCompactTime, formatOutcome, formatTrigger } from "$lib/shell/time";

	const workspace = getWorkspace();
	const now = Date.now();
	const test = $derived(workspace.selectedTest);
	const finding = $derived(workspace.selectedTestFinding);
	const thread = $derived(workspace.selectedTestThread);
	const queued = $derived(test !== null && workspace.isRunQueued(test.id));
</script>

<main class="page tests">
	{#if test}
		<div class="detail">
			<div class="body">
				<div>
					<div class="headline">
						<span class={{ status: true, [test.lastOutcome]: true }}>
							{formatOutcome(test.lastOutcome)}
						</span>
						<span class="mono muted" style="font-size: 12.5px;">T-{test.number}</span>
					</div>
					<h1>{test.name}</h1>
					<p class="lede">{test.summary}</p>
				</div>

				{#if queued}
					<div class="card callout" role="status">
						<Clock size={16} strokeWidth={2} />
						<span>Run queued. The result will show here when the agent finishes.</span>
					</div>
				{/if}

				<div class="list">
					<div class="list-head"><span style="font-weight: 600;">Runs</span></div>
					<div class="lrow">
						{#if test.lastOutcome === "failed"}
							<CircleX size={18} strokeWidth={2} class="ico-fail" />
						{:else}
							<CircleCheck size={18} strokeWidth={2} class="ico-ok" />
						{/if}
						<span class="lrow-main">
							<span class="lrow-title">{formatOutcome(test.lastOutcome)}</span>
							<span class="lrow-sub">
								Started by {formatTrigger(test.lastTrigger)} · {formatCompactTime(
									test.lastRunAt,
									now,
								)}
							</span>
						</span>
						<span class="lrow-end">
							{#if finding}
								<button
									type="button"
									class="btn"
									style="height: 28px;"
									onclick={() => workspace.openIssue(finding.id)}
								>
									Finding #{finding.number}
								</button>
							{/if}
						</span>
					</div>
				</div>
			</div>

			<aside class="side">
				<div class="card">
					<dl class="kv">
						<dt>Status</dt>
						<dd>
							<span class={{ status: true, [test.lastOutcome]: true }}>
								{formatOutcome(test.lastOutcome)}
							</span>
						</dd>
						<dt>Last run</dt>
						<dd>{formatCompactTime(test.lastRunAt, now)}</dd>
						<dt>Started by</dt>
						<dd>{formatTrigger(test.lastTrigger)}</dd>
						<dt>Defined in</dt>
						<dd>
							<button
								type="button"
								class="link"
								onclick={() => workspace.openTestConversation(test.id)}
							>
								{thread ? thread.title : "Chat"}
							</button>
						</dd>
						<dt>Finding</dt>
						<dd>
							{#if finding}
								<button type="button" class="link" onclick={() => workspace.openIssue(finding.id)}>
									#{finding.number} {finding.title}
								</button>
							{:else}
								<span class="muted">None open</span>
							{/if}
						</dd>
					</dl>
				</div>
			</aside>
		</div>
	{:else}
		<div class="page-inner">
			<div class="toolbar">
				<div class="filters" role="group" aria-label="Filter tests">
					<button
						type="button"
						class={{ ftab: true, active: workspace.testFilter === "all" }}
						aria-pressed={workspace.testFilter === "all"}
						onclick={() => workspace.setTestFilter("all")}
					>
						All <span class="n">{workspace.repoTests.length}</span>
					</button>
					<button
						type="button"
						class={{ ftab: true, active: workspace.testFilter === "failed" }}
						aria-pressed={workspace.testFilter === "failed"}
						onclick={() => workspace.setTestFilter("failed")}
					>
						Failed <span class="n">{workspace.failedCount}</span>
					</button>
					<button
						type="button"
						class={{ ftab: true, active: workspace.testFilter === "passed" }}
						aria-pressed={workspace.testFilter === "passed"}
						onclick={() => workspace.setTestFilter("passed")}
					>
						Passed <span class="n">{workspace.passedCount}</span>
					</button>
				</div>
				<label class="search">
					<span class="sr">Search tests</span>
					<Search size={14} strokeWidth={2} />
					<input
						class="input"
						type="search"
						placeholder="Search tests"
						bind:value={workspace.testSearch}
					/>
				</label>
			</div>

			<div class="list">
				{#each workspace.visibleTests as item (item.id)}
					{@const itemFinding = findingForTest(item.id)}
					<button type="button" class="lrow" onclick={() => workspace.openTest(item.id)}>
						{#if item.lastOutcome === "failed"}
							<CircleX size={18} strokeWidth={2} class="ico-fail" />
						{:else}
							<CircleCheck size={18} strokeWidth={2} class="ico-ok" />
						{/if}
						<span class="lrow-main">
							<span class="lrow-title">
								{item.name}
								<span class="num">T-{item.number}</span>
							</span>
							<span class="lrow-sub">{item.summary}</span>
						</span>
						<span class="lrow-end">
							{#if itemFinding}
								<span class="status open">#{itemFinding.number}</span>
							{/if}
							<span class="chip">{formatTrigger(item.lastTrigger)}</span>
							<span class="when">{formatCompactTime(item.lastRunAt, now)}</span>
							<ChevronRight size={16} strokeWidth={2} />
						</span>
					</button>
				{/each}
				{#if workspace.visibleTests.length === 0}
					<p class="none">
						{#if workspace.repoTests.length === 0}
							No tests in this repository yet. Start a chat to write one.
						{:else}
							No tests match.
						{/if}
					</p>
				{/if}
			</div>
		</div>
	{/if}
</main>
