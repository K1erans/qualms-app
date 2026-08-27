<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { browser } from "$app/environment";
	import { setWorkspace } from "$lib/shell/context";
	import { Workspace } from "$lib/shell/workspace.svelte";
	import "$lib/styles/app.css";
	import "$lib/styles/shell.css";
	import "$lib/styles/chat.css";
	import "$lib/styles/surfaces.css";

	let { children } = $props();

	const workspace = new Workspace();
	if (browser) {
		workspace.restoreLastUsed();
		workspace.restoreColorScheme();
	}
	setWorkspace(workspace);
</script>

<svelte:head>
	<title>Qualms</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
