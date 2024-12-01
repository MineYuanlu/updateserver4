import type { RequestHandler } from './$types';
import { success } from '../../../../common';
import { listOAuthProviders } from '$lib/server/db/funcs';

export type ListResp = Awaited<ReturnType<typeof listOAuthProviders>>;

export const GET: RequestHandler = async () => {
	return success(await listOAuthProviders());
};
