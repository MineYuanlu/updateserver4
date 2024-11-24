import type { DefaultColors } from 'tailwindcss/types/generated/colors';

export type Color = {
	[K in keyof DefaultColors]: DefaultColors[K] extends Record<string, any> ? K : never;
}[keyof DefaultColors];
