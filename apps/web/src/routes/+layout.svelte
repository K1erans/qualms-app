<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { browser } from "$app/environment";
	import { setWorkspace } from "$lib/shell/context";
	import { Workspace } from "$lib/shell/workspace.svelte";
	import "$lib/styles/app.css";

	let { children } = $props();

	const workspace = new Workspace();
	if (browser) workspace.restoreLastUsed();
	setWorkspace(workspace);
</script>

<svelte:head>
	<title>Qualms</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
