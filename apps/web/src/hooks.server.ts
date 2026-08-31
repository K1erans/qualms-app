import { sequence } from "@sveltejs/kit/hooks";
import { configureAuthKit, authKitHandle } from "@workos/authkit-sveltekit";
import { env } from "$env/dynamic/private";
import { closeDb } from "$lib/server/db";

configureAuthKit({
	clientId: env.WORKOS_CLIENT_ID,
	apiKey: env.WORKOS_API_KEY,
	redirectUri: env.WORKOS_REDIRECT_URI,
	cookiePassword: env.WORKOS_COOKIE_PASSWORD,
});

export const handle = sequence(authKitHandle(), async ({ event, resolve }) => {
	try {
		return await resolve(event);
	} finally {
		closeDb(event);
	}
});
