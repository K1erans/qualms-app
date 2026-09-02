<script lang="ts">
	import ChatSurface from "./ChatSurface.svelte";
	import IssuesSurface from "./IssuesSurface.svelte";
	import TestsSurface from "./TestsSurface.svelte";
	import { getWorkspace } from "$lib/shell/context";

	const workspace = getWorkspace();
</script>

{#if workspace.selectedRepo}
	{#if workspace.surface === "chat"}
		<ChatSurface />
	{:else if workspace.surface === "tests"}
		<TestsSurface />
	{:else}
		<IssuesSurface />
	{/if}
{/if}
