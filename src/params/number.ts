import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (v: string) => {
	return !isNaN(parseInt(v));
};
