import type { RequestHandler } from './$types';
import { success } from '../../common';
import { userJwt } from '$lib/server/jwt';

export const POST: RequestHandler = async (req) => {
	userJwt.deleteSessionTokenCookie(req);
	return success();
};
