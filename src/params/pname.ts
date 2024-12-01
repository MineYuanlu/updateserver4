import { validateProjectName } from '$lib/common/project';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = validateProjectName satisfies ParamMatcher;
