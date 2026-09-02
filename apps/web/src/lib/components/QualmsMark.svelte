<script lang="ts">
	let { size = 16 }: { size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
	<path
		fill="none"
		stroke="currentColor"
		stroke-width="2.8"
		d="M10 10.5h9.5a6 6 0 1 1 0 12H10V10.5z"
	/>
	<path stroke="currentColor" stroke-width="2.8" stroke-linecap="square" d="m21 20 4 5" />
</svg>
