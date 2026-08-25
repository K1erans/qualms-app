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
		<button type="button" class="btn btn-sm" onclick={() => workspace.leaveSettings()}>
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
