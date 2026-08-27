// Keep this app-facing Env declaration in sync with wrangler.jsonc and WorkOS bindings.
// `npm run cf-typegen` writes Wrangler's generated declaration outside src.
interface Env {
	ASSETS: Fetcher;
	WORKOS_CLIENT_ID: string;
	WORKOS_API_KEY: string;
	WORKOS_REDIRECT_URI: string;
	WORKOS_COOKIE_PASSWORD: string;
}
