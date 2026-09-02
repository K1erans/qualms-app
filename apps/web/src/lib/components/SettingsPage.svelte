<script lang="ts">
	import { page } from "$app/state";
	import { COLOR_SCHEME_OPTIONS } from "$lib/shell/color-scheme";
	import { getWorkspace } from "$lib/shell/context";
	import { ACCOUNT } from "$lib/shell/fixtures";

	const workspace = getWorkspace();
	const identity = $derived(page.data.identity ?? ACCOUNT);
</script>

<main class="page settings">
	<div class="page-inner">
		<section class="card">
			<h2>Appearance</h2>
			<p>Light, dark, or match the system. Kept on this browser.</p>
			<div class="seg" role="radiogroup" aria-label="Colour scheme">
				{#each COLOR_SCHEME_OPTIONS as option (option.value)}
					<button
						type="button"
						role="radio"
						class={{ active: workspace.colorScheme === option.value }}
						aria-checked={workspace.colorScheme === option.value}
						onclick={() => workspace.setColorScheme(option.value)}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</section>

		<section class="card">
			<h2>Profile</h2>
			<dl class="kv">
				<dt>Name</dt>
				<dd>{identity.displayName}</dd>
				<dt>Email</dt>
				<dd>{identity.email}</dd>
				<dt>GitHub</dt>
				<dd class="mono" style="font-size: 12.5px;">@{identity.handle}</dd>
				<dt>Organization</dt>
				<dd>
					{identity.organization}
					{#if identity.organizationKind === "personal"}
						<span class="muted">(personal)</span>
					{/if}
				</dd>
			</dl>
		</section>

		<section class="card">
			<h2>Notifications</h2>
			<p>Findings and test runs will land here. Delivery isn't wired yet.</p>
		</section>

		<section class="card session">
			<div>
				<h2>Session</h2>
				<p>Signed in on this browser as {identity.displayName}.</p>
			</div>
			<form method="POST" action="/logout">
				<button type="submit" class="btn">Sign out</button>
			</form>
		</section>
	</div>
</main>
