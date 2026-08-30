import path from 'node:path';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
	const envDirs = [import.meta.dirname, path.resolve(import.meta.dirname, '../..')];
	for (const envDir of envDirs) {
		for (const [key, value] of Object.entries(loadEnv(mode, envDir, ''))) {
			process.env[key] ??= value;
		}
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
