import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
	// AuthKit reads process.env while the Cloudflare adapter analyses server modules.
	const env = loadEnv(mode, import.meta.dirname, '');
	for (const [key, value] of Object.entries(env)) {
		process.env[key] ??= value;
	}

	return {
		server: {
			port: 5173,
			strictPort: true,
		},
		plugins: [
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter()
			}),
			tailwindcss(),
		],
	};
});
