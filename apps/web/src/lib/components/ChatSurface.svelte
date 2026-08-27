<script lang="ts">
	import MessageSquare from "@lucide/svelte/icons/message-square";
	import { getWorkspace } from "$lib/shell/context";
	import { formatRelativeTime } from "$lib/shell/time";

	const workspace = getWorkspace();
	const now = Date.now();

	function onComposerKey(event: KeyboardEvent): void {
		if (event.key === "Enter") {
			event.preventDefault();
			workspace.sendDraft();
		}
	}
</script>

<div class="chat">
	{#if workspace.threadRailOpen}
		<button
			type="button"
			class="rail-backdrop"
			aria-label="Close chat list"
			onclick={() => workspace.closeThreadRail()}
		></button>
	{/if}

	<section class="transcript">
		<div class="messages">
			{#if workspace.selectedThread}
				{#each workspace.selectedThread.messages as message (message.id)}
					<article class={message.role}>
						<p class="who">{message.role === "assistant" ? "Qualms" : "You"}</p>
						<p class="body">{message.body}</p>
					</article>
				{/each}
			{:else}
				<p class="blank">Start a chat about this repository.</p>
			{/if}
		</div>

		<form
			class="composer join"
			onsubmit={(event) => {
				event.preventDefault();
				workspace.sendDraft();
			}}
		>
			<label class="sr" for="chat-draft">Message</label>
			<input
				id="chat-draft"
				class="input join-item"
				type="text"
				placeholder="What are we testing today"
				bind:value={workspace.draft}
				onkeydown={onComposerKey}
			/>
			<button type="submit" class="btn btn-primary join-item" aria-label="Send">
				<MessageSquare size={18} strokeWidth={1.75} />
			</button>
		</form>
	</section>

	<aside id="chat-rail" class={{ rail: true, open: workspace.threadRailOpen }}>
		<div class="rail-head">
			<p>Chats</p>
		</div>
		{#if workspace.repoThreads.length === 0}
			<p class="rail-empty">No chats yet.</p>
		{/if}
		<ul class="menu menu-sm">
			{#each workspace.repoThreads as thread (thread.id)}
				<li>
					<button
						type="button"
						class={{ thread: true, active: workspace.selectedThreadId === thread.id }}
						onclick={() => workspace.selectThread(thread.id)}
					>
						<span class="title">{thread.title}</span>
						<span class="meta">
							{#if thread.testNumber !== null}
								T-{thread.testNumber}
							{:else}
								Repo
							{/if}
							· {formatRelativeTime(thread.updatedAt, now)}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</aside>
</div>
