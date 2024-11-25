import { isUS4ID } from '$lib/common/id';
import type { ParamMatcher } from '@sveltejs/kit';

// export const match =(value: string)=>{} satisfies ParamMatcher;
export const match: ParamMatcher = (value) => {
	return isUS4ID('u', value);
};
