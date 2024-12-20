import type { RequestHandler } from './$types';
import { checkRequestField, success } from '../../../../common.server';
import { listOAuthProviders } from '$lib/server/db/funcs';
import { isMaybeBoolLkie, parseMaybeBoolLike } from '$lib/zod/bool_like';
import { isWebAdmin } from '../../../../perm';

export type ListResp = Awaited<ReturnType<typeof listOAuthProviders>>;

export const GET: RequestHandler = async (req) => {
	let { admin } = checkRequestField(req.url.searchParams, {
		admin: [isMaybeBoolLkie, parseMaybeBoolLike],
	});
	admin = admin && (await isWebAdmin(req));

	return success(await listOAuthProviders(admin));
};
