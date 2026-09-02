<script lang="ts">
	import ArrowUp from "@lucide/svelte/icons/arrow-up";
	import ChevronRight from "@lucide/svelte/icons/chevron-right";
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import QualmsMark from "./QualmsMark.svelte";
	import { getWorkspace } from "$lib/shell/context";
	import { formatCompactTime, formatOutcome, formatTrigger } from "$lib/shell/time";

	const workspace = getWorkspace();
	const now = Date.now();
	const repo = $derived(workspace.selectedRepo);
	const thread = $derived(workspace.selectedThread);
	const threadTest = $derived(workspace.selectedThreadTest);
	const canSend = $derived(workspace.draft.trim() !== "");

	function onComposerKey(event: KeyboardEvent): void {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			workspace.sendDraft();
		}
	}

	function stickToBottom(node: HTMLElement): void {
		const messageCount = workspace.selectedThread?.messages.length ?? 0;
		if (messageCount > 0) node.scrollTop = node.scrollHeight;
	}
</script>

{#if repo}
	<main class="chat">
		<div class="transcript" {@attach stickToBottom}>
			{#if thread}
				{#if threadTest}
					<button
						type="button"
						class="card test-card"
						onclick={() => workspace.openTest(threadTest.id)}
					>
						{#if threadTest.lastOutcome === "failed"}
							<CircleX size={16} strokeWidth={2} class="ico-fail" />
						{:else}
							<CircleCheck size={16} strokeWidth={2} class="ico-ok" />
						{/if}
						<span class="chip">T-{threadTest.number}</span>
						<span class="name">{threadTest.name}</span>
						<span class="state">
							{formatOutcome(threadTest.lastOutcome)} · {formatTrigger(threadTest.lastTrigger)} ·
							{formatCompactTime(threadTest.lastRunAt, now)}
						</span>
						<ChevronRight size={16} strokeWidth={2} class="chevron" />
					</button>
				{/if}

				{#each thread.messages as message (message.id)}
					<article class={{ msg: true, [message.role]: true }}>
						{#if message.role === "assistant"}
							<span class="qmark" aria-hidden="true"><QualmsMark size={16} /></span>
							<p class="text">{message.body}</p>
						{:else}
							<p class="bubble">{message.body}</p>
						{/if}
					</article>
				{/each}
			{:else}
				<div class="welcome">
					<span class="qmark lg" aria-hidden="true"><QualmsMark size={22} /></span>
					<h1>What should we test in {repo.name}?</h1>
					<p>
						Describe a behavior you want checked. Qualms writes it up as a test an agent can
						run, and CI or the app can run it from then on.
					</p>
					<div class="suggestions">
						{#each workspace.suggestions as suggestion (suggestion)}
							<button
								type="button"
								class="suggest"
								onclick={() => workspace.useSuggestion(suggestion)}
							>
								{suggestion}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<form
			class="composer-wrap"
			onsubmit={(event) => {
				event.preventDefault();
				workspace.sendDraft();
			}}
		>
			<div class="composer">
				<label class="sr" for="chat-draft">Message</label>
				<textarea
					id="chat-draft"
					rows="1"
					placeholder={`Message Qualms about ${repo.name}…`}
					bind:value={workspace.draft}
					onkeydown={onComposerKey}
				></textarea>
				<button type="submit" class="send" aria-label="Send" disabled={!canSend}>
					<ArrowUp size={16} strokeWidth={2.25} />
				</button>
			</div>
			<p class="hint">Enter to send · Shift+Enter for a new line</p>
		</form>
	</main>
{/if}
