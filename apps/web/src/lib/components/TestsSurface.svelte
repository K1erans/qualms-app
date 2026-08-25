<script lang="ts">
	import { getWorkspace } from "$lib/shell/context";
	import { formatOutcome, formatRelativeTime, formatTrigger } from "$lib/shell/time";

	const workspace = getWorkspace();
	const now = Date.now();
	const test = $derived(workspace.selectedTest);
</script>

<div class="tests">
	{#if test}
		<div class="detail">
			<button type="button" class="back" onclick={() => workspace.leaveTest()}>
				Back to tests
			</button>
			<h2>{test.name}</h2>
			<p class="id">T-{test.number}</p>
			<p class="summary">{test.summary}</p>
			<p class="run">
				Last run {formatRelativeTime(test.lastRunAt, now)} from {formatTrigger(
					test.lastTrigger,
				)}
				— {formatOutcome(test.lastOutcome)}.
			</p>
			<p class="note">This check is defined in Qualms. App or CI can kick it off.</p>
			<button type="button" class="chat" onclick={() => workspace.openTestConversation(test.id)}>
				Open conversation
			</button>
		</div>
	{:else}
		<div class="list">
			<p class="intro">
				Qualms-defined checks for this repository. CI only kicks these off — they are not
				authored outside Qualms.
			</p>
			{#if workspace.repoTests.length === 0}
				<p class="none">No tests in this repository yet.</p>
			{:else}
				<table>
					<thead>
						<tr>
							<th>Test</th>
							<th>Last run</th>
							<th>Trigger</th>
						</tr>
					</thead>
					<tbody>
						{#each workspace.repoTests as item (item.id)}
							<tr>
								<td>
									<button
										type="button"
										class="row"
										onclick={() => workspace.openTest(item.id)}
									>
										<span class="name">{item.name}</span>
										<span class="num">T-{item.number}</span>
									</button>
								</td>
								<td>
									<span class={item.lastOutcome}>
										{formatOutcome(item.lastOutcome)}
									</span>
									<span class="when">
										{formatRelativeTime(item.lastRunAt, now)}
									</span>
								</td>
								<td>{formatTrigger(item.lastTrigger)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/if}
</div>

<style>
	.tests {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}

	.list,
	.detail {
		max-width: 860px;
		padding: 20px;
	}

	.intro,
	.none,
	.summary,
	.run,
	.note,
	.id,
	.when,
	.num {
		color: var(--muted);
	}

	.intro,
	.none {
		margin-bottom: 16px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		padding: 0 8px 8px 0;
		color: var(--muted);
		font-size: 12px;
		font-weight: 500;
		text-align: left;
	}

	td {
		padding: 10px 12px 10px 0;
		border-top: 1px solid var(--border);
		vertical-align: top;
	}

	.row {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0;
		border: 0;
		background: transparent;
		text-align: left;
	}

	.name {
		font-weight: 500;
	}

	.passed {
		color: var(--ok);
	}

	.failed {
		color: var(--fail);
	}

	.when {
		display: block;
		font-size: 12px;
	}

	h2 {
		margin: 8px 0 4px;
		font-size: 18px;
	}

	.summary {
		margin: 12px 0;
	}

	.note {
		margin: 8px 0 16px;
	}

	.back,
	.chat {
		height: 36px;
		padding: 0 12px;
		border-radius: var(--radius);
	}

	.back {
		border: 1px solid var(--border);
		background: var(--surface);
	}

	.chat {
		border: 0;
		background: var(--text);
		color: var(--surface);
	}
</style>
