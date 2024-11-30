import type { RequestHandler } from './$types';
import { failure, success } from '../../common';
import { validatePassword, validateUserName } from '$lib/common/user';
import {
	api_user__err_invalid_username as err_invalid_username,
	api_user__err_invalid_password as err_invalid_password,
	api_user_login__err_no_password_login as err_no_password_login,
	api_user_login__err_invalid_credentials as err_invalid_credentials,
} from '$lib/paraglide/messages';
import { getUserAllByName } from '$lib/server/db/funcs';
import { verify } from '@node-rs/argon2';
import { userJwt } from '$lib/server/jwt';
import { passwordCheckOpt } from '$lib/server/auth';

export const POST: RequestHandler = async (req) => {
	const { username, password } = await req.request.json();

	if (!validateUserName(username)) return failure(err_invalid_username({ username }));
	if (!validatePassword(password)) return failure(err_invalid_password());

	const existingUser = await getUserAllByName(username);
	if (!existingUser) return failure(err_invalid_credentials());

	if (!existingUser.passwordHash) return failure(err_no_password_login());

	const validPassword = await verify(existingUser.passwordHash, password, {
		...passwordCheckOpt,
		salt: existingUser.passwordSalt ?? undefined,
	});
	if (!validPassword) return failure(err_invalid_credentials());

	await userJwt.createJwtCookie(req, {
		id: existingUser.id,
		name: existingUser.name,
		role: existingUser.role,
	});

	return success(true);
};
