import { defineConfig } from 'vitest/config';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import heroiconsPlugin from './plugins/heroicon';
import path from 'path';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
		}),
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
