<script lang="ts">
	import { page } from "$app/state";

	const messages = {
		ACCESS_DENIED: "Access was denied. Try again, or go back to sign in.",
		AUTH_ERROR: "Something went wrong during sign-in. Try again.",
		AUTH_FAILED: "Sign-in didn't complete. Try again.",
		DEFAULT: "Sign-in didn't complete. Try again.",
	} as const;

	const errorCode = $derived(page.url.searchParams.get("code") ?? "DEFAULT");
	const errorMessage = $derived.by(() => {
		if (errorCode === "ACCESS_DENIED") return messages.ACCESS_DENIED;
		if (errorCode === "AUTH_ERROR") return messages.AUTH_ERROR;
		if (errorCode === "AUTH_FAILED") return messages.AUTH_FAILED;
		return messages.DEFAULT;
	});
</script>

<svelte:head>
	<title>Sign-in error · Qualms</title>
</svelte:head>

<div class="auth">
	<main>
		<p class="brand">Qualms</p>
		<h1>Couldn't sign in</h1>
		<p class="lede">{errorMessage}</p>
		<a href="/" class="btn btn-primary github">Back to sign in</a>
	</main>
</div>
