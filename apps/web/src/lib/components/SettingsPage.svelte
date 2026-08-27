<script lang="ts">
	import { page } from "$app/state";
	import { COLOR_SCHEME_OPTIONS } from "$lib/shell/color-scheme";
	import { getWorkspace } from "$lib/shell/context";
	import { ACCOUNT } from "$lib/shell/fixtures";

	const workspace = getWorkspace();
	const identity = $derived(page.data.identity ?? ACCOUNT);
</script>

<main class="settings" >
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
		<h2>Appearance</h2>
		<p>Light, dark, or match the system. Kept on this browser.</p>
		<div class="join scheme" role="radiogroup" aria-label="Colour scheme">
			{#each COLOR_SCHEME_OPTIONS as option (option.value)}
				<input
					type="radio"
					class="join-item btn btn-sm"
					name="colour-scheme"
					value={option.value}
					aria-label={option.label}
					checked={workspace.colorScheme === option.value}
					onchange={() => workspace.setColorScheme(option.value)}
				/>
			{/each}
		</div>
	</section>

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

	<section>
		<h2>Session</h2>
		<p>Sign out of Qualms on this browser.</p>
		<form method="POST" action="/logout">
			<button type="submit" class="btn btn-sm">Sign out</button>
		</form>
	</section>
</main>
