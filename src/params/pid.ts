import type { ParamMatcher } from '@sveltejs/kit';
import { checkProjectName } from '../routes/api/project/common';

export const match = checkProjectName satisfies ParamMatcher;
