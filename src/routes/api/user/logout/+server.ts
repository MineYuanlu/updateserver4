import type { RequestHandler } from './$types';
import { deleteSessionTokenCookie } from '$lib/server/auth';
import { success } from '../../common';

export const POST: RequestHandler = async (req) => {
	deleteSessionTokenCookie(req);
	return success();
};
