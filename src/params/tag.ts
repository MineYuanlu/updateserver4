import { validateProjectTag } from '$lib/common/project';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (value) => {
	return validateProjectTag(value);
};
