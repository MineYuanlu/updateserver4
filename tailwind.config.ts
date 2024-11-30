import containerQueries from '@tailwindcss/container-queries';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: [
		// {
		// 	// pattern: /.*(bg|text|border|placeholder|ring|shadow)-\w+(-\d+)?.*/
		// }
	],

	theme: {
		extend: {
			backdropBlur: {
				xs: '0.8px',
			},
		},
	},

	plugins: [typography, forms, containerQueries],
} satisfies Config;
