import { defineConfig } from 'vitest/config';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { apiGenPlugin } from './plugins/api_gen';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
		}),
		apiGenPlugin(),
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},

	optimizeDeps: {
		exclude: [
			'@codemirror/commands',
			'@codemirror/lang-json',
			'@codemirror/language',
			'@codemirror/lint',
			'@codemirror/state',
			'@codemirror/theme-one-dark',
			'@codemirror/view',
			'codemirror',
			'codemirror-json-schema',
			'svelte-codemirror-editor',
		],
	},
});
