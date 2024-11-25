import { validateUserName } from '$lib/common/user';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = validateUserName satisfies ParamMatcher;
