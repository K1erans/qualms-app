<script lang="ts">
	import PanelLeft from "@lucide/svelte/icons/panel-left";
	import PanelRight from "@lucide/svelte/icons/panel-right";

	let {
		side,
		expanded,
		controls,
		onclick,
	}: {
		side: "left" | "right";
		expanded: boolean;
		controls: string;
		onclick: () => void;
	} = $props();

	const label = $derived(
		side === "left"
			? expanded
				? "Hide repositories"
				: "Show repositories"
			: expanded
				? "Hide chats"
				: "Show chats",
	);
</script>

<button
	type="button"
	class="btn btn-ghost btn-square btn-sm panel-toggle"
	aria-label={label}
	aria-expanded={expanded}
	aria-controls={controls}
	{onclick}
>
	{#if side === "left"}
		<PanelLeft size={18} strokeWidth={1.75} />
	{:else}
		<PanelRight size={18} strokeWidth={1.75} />
	{/if}
</button>
