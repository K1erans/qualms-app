import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
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
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},
				adapter: adapter()
			}),
			tailwindcss(),
		],
	};
});
