<script lang="ts">
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();
	const identity = workspace.identity;
</script>

<main class="settings">
	<header class="top">
		<div>
			<h1>Settings</h1>
			<p class="who">{identity.displayName} · @{identity.handle}</p>
		</div>
		<button type="button" onclick={() => workspace.leaveSettings()}>
			Back to workspace
		</button>
	</header>

	<section>
		<h2>Profile</h2>
		<dl>
			<div>
				<dt>Name</dt>
				<dd>{identity.displayName}</dd>
			</div>
			<div>
				<dt>Email</dt>
				<dd>{identity.email}</dd>
			</div>
			<div>
				<dt>GitHub</dt>
				<dd>@{identity.handle}</dd>
			</div>
		</dl>
	</section>

	<section>
		<h2>Organization</h2>
		<p>{identity.organization} — dummy membership for this shell. No org admin here yet.</p>
	</section>

	<section>
		<h2>Notifications</h2>
		<p>Findings and test runs would land here. Delivery is not wired.</p>
	</section>
</main>

<style>
	.settings {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 24px;
		max-width: 640px;
		padding: 24px;
		overflow: auto;
	}

	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}

	h1 {
		font-size: 18px;
		font-weight: 600;
	}

	h2 {
		margin-bottom: 8px;
		font-size: 14px;
		font-weight: 600;
	}

	.who,
	p {
		color: var(--muted);
	}

	section {
		padding-top: 16px;
		border-top: 1px solid var(--border);
	}

	dl {
		display: grid;
		gap: 12px;
		margin: 0;
	}

	dt {
		color: var(--muted);
		font-size: 12px;
	}

	dd {
		margin: 2px 0 0;
	}

	button {
		height: 36px;
		padding: 0 12px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
	}
</style>
