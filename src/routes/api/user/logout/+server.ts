import type { RequestHandler } from './$types';
import { success } from '../../common.server';
import { userJwt } from '$lib/server/user/jwt';

export const POST: RequestHandler = async (req) => {
	userJwt.deleteSessionTokenCookie(req);
	return success();
};
