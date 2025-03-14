import { defaultWebRole, validateUserName } from '$lib/common/user';
import { generateId } from '$lib/server/common';
import { linkOAuthToNewUser } from '$lib/server/db/funcs';
import {
	api_user__err_invalid_username as err_invalid_username,
	api_user_register__err_username_taken as err_username_taken,
	api_user_oauth_register__invalid_token as err_invalid_token,
} from '$lib/paraglide/messages';
import type { RequestHandler } from './$types';
import { failure, success } from '../../../common.server';
import { oauthRegisterJwt, userJwt } from '$lib/server/user/jwt';
import { isConflictError } from '$lib/server/db/err';

export const POST: RequestHandler = async (req) => {
	const { username, jwt } = await req.request.json();

	if (!validateUserName(username)) {
		return failure(err_invalid_username({ username }));
	}
	let id: string;
	let provider: string;
	try {
		const data = await oauthRegisterJwt.parseJwt(jwt);
		id = data.id;
		provider = data.p;
	} catch (_) {
		return failure(err_invalid_token());
	}

	const userId = generateId('u');
	try {
		await linkOAuthToNewUser(userId, provider, id, username, defaultWebRole);
	} catch (e) {
		if (isConflictError(e)) return failure(err_username_taken({ username }));
		throw e;
	}

	await userJwt.createJwtCookie(req, {
		id: userId,
		name: username,
		role: defaultWebRole,
	});
	return success(true);
};
