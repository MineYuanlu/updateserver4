import type { ParamMatcher } from '@sveltejs/kit';

export const match = function checkProjectName(v: string) {
	return !isNaN(parseInt(v));
} satisfies ParamMatcher;
