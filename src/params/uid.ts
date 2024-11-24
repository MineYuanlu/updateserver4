import type { ParamMatcher } from '@sveltejs/kit';
import { checkUserName } from '../routes/api/user/common';

export const match = checkUserName satisfies ParamMatcher;
