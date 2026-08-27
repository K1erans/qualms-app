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
			<button type="button" class="btn btn-sm" onclick={() => workspace.leaveTest()}>
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
			<button
				type="button"
				class="btn btn-primary btn-sm"
				onclick={() => workspace.openTestConversation(test.id)}
			>
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
				<table class="table">
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
										class="btn btn-ghost btn-sm row"
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
