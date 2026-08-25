<script lang="ts">
	import { getWorkspace } from "$lib/shell/context";
	import { formatRelativeTime } from "$lib/shell/time";

	const workspace = getWorkspace();
	const now = Date.now();

	function onComposerKey(event: KeyboardEvent): void {
		if (event.key === "Enter" && !event.shiftKey) {
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

	<aside class={{ rail: true, open: workspace.threadRailOpen }}>
		<div class="rail-head">
			<p>Chats</p>
			<button type="button" class="rail-close" onclick={() => workspace.closeThreadRail()}>
				Close
			</button>
		</div>
		{#if workspace.repoThreads.length === 0}
			<p class="rail-empty">No chats yet.</p>
		{/if}
		<ul>
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

	<section class="transcript">
		<div class="mobile-chats">
			<button type="button" onclick={() => workspace.openThreadRail()}>Chats</button>
			{#if workspace.selectedThread}
				<span>{workspace.selectedThread.title}</span>
			{/if}
		</div>

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
			class="composer"
			onsubmit={(event) => {
				event.preventDefault();
				workspace.sendDraft();
			}}
		>
			<label class="sr" for="chat-draft">Message</label>
			<textarea
				id="chat-draft"
				rows="2"
				placeholder="What are we testing today"
				bind:value={workspace.draft}
				onkeydown={onComposerKey}
			></textarea>
			<button type="submit">Send</button>
		</form>
	</section>
</div>

<style>
	.chat {
		display: flex;
		flex: 1;
		min-height: 0;
		position: relative;
	}

	.rail {
		display: flex;
		flex-direction: column;
		width: var(--rail-width);
		border-right: 1px solid var(--border);
		background: var(--bg);
		overflow: auto;
	}

	.rail-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 12px 8px;
		font-weight: 500;
	}

	.rail-close,
	.rail-backdrop {
		display: none;
	}

	.rail-empty {
		padding: 0 12px 8px;
		color: var(--muted);
	}

	ul {
		margin: 0;
		padding: 0 8px 8px;
		list-style: none;
	}

	.thread {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 100%;
		padding: 8px;
		border: 0;
		border-radius: var(--radius);
		background: transparent;
		text-align: left;
	}

	.thread:hover,
	.thread.active {
		background: var(--hover);
	}

	.title {
		font-weight: 500;
	}

	.meta {
		color: var(--muted);
		font-size: 12px;
	}

	.transcript {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.mobile-chats {
		display: none;
	}

	.messages {
		flex: 1;
		overflow: auto;
		padding: 16px 20px 8px;
	}

	article {
		max-width: 640px;
		margin-bottom: 16px;
	}

	.who {
		margin-bottom: 4px;
		font-size: 12px;
		font-weight: 500;
		color: var(--muted);
	}

	.body {
		white-space: pre-wrap;
	}

	.blank {
		color: var(--muted);
	}

	.composer {
		display: flex;
		gap: 8px;
		padding: 12px 20px 16px;
		border-top: 1px solid var(--border);
	}

	textarea {
		flex: 1;
		padding: 8px 10px;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		resize: none;
	}

	textarea:focus {
		outline: 2px solid var(--text);
		outline-offset: 1px;
	}

	.composer button {
		align-self: flex-end;
		height: 36px;
		padding: 0 12px;
		border: 0;
		border-radius: var(--radius);
		background: var(--text);
		color: var(--surface);
	}

	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	@media (max-width: 799px) {
		.rail {
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			z-index: 10;
			display: none;
			background: var(--surface);
			box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
		}

		.rail.open {
			display: flex;
		}

		.rail-close {
			display: block;
			height: 28px;
			padding: 0 8px;
			border: 1px solid var(--border);
			border-radius: var(--radius);
			background: var(--surface);
		}

		.rail-backdrop {
			display: block;
			position: absolute;
			inset: 0;
			z-index: 9;
			border: 0;
			background: var(--overlay);
		}

		.mobile-chats {
			display: flex;
			align-items: center;
			gap: 12px;
			height: 44px;
			padding: 0 12px;
			border-bottom: 1px solid var(--border);
		}

		.mobile-chats button {
			height: 32px;
			padding: 0 10px;
			border: 1px solid var(--border);
			border-radius: var(--radius);
			background: var(--surface);
		}

		.mobile-chats span {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
</style>
