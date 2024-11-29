import { defaultUserRole, validateUserName } from '$lib/common/user';
import { generateId } from '$lib/server/common';
import { linkOAuthToNewUser } from '$lib/server/db/funcs';
import {
	api_user_register__err_invalid_username as err_invalid_username,
	api_user_register__err_username_taken as err_username_taken,
	api_user_oauth_register__invalid_token as err_invalid_token
} from '$lib/paraglide/messages';
import type { RequestHandler } from './$types';
import { failure, success } from '../../../common';
import { oauthRegisterJwt, userJwt } from '$lib/server/jwt';
import { SqliteError } from 'better-sqlite3';

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
	} catch (e) {
		return failure(err_invalid_token());
	}

	const userId = generateId('u');
	try {
		await linkOAuthToNewUser(userId, provider, id, username, defaultUserRole);
	} catch (e) {
		if (e instanceof SqliteError) {
			if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return failure(err_username_taken({ username }));
		}
		throw e;
	}

	await userJwt.createJwtCookie(req, {
		id: userId,
		name: username,
		role: defaultUserRole
	});
	return success(true);
};
