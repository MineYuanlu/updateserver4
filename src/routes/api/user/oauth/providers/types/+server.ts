import type { RequestHandler } from './$types';
import { OAuthProviderTypeNames } from '$lib/server/oauth';
import { success } from '../../../../common';

export const GET: RequestHandler = async () => {
	return success(OAuthProviderTypeNames);
};
