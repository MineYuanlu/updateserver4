import type { RequestHandler } from './$types';
import { OAuthProviderTypeNames } from '$lib/server/oauth';
import { cache, success } from '../../../../common';

export const GET: RequestHandler = async () => {
	return cache(success(OAuthProviderTypeNames));
};
