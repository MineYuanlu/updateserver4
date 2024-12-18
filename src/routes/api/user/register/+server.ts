import type { RequestHandler } from './$types';
import { failure, success } from '../../common.server';
import { defaultWebRole, validatePassword, validateUserName } from '$lib/common/user';
import {
	api_user__err_invalid_username as err_invalid_username,
	api_user__err_invalid_password as err_invalid_password,
	api_user_register__err_username_taken as err_username_taken,
} from '$lib/paraglide/messages';
import { createUser } from '$lib/server/db/funcs';
import { hash } from '@node-rs/argon2';
import { userJwt } from '$lib/server/user/jwt';
import { passwordCheckOpt } from '$lib/server/user/auth';
import { generateId } from '$lib/server/common';
import crypto from 'crypto';
import { SqliteError } from 'better-sqlite3';
import { isConflictError } from '$lib/server/db/err';

export const POST: RequestHandler = async (req) => {
	const { username, password } = await req.request.json();

	if (!validateUserName(username)) return failure(err_invalid_username({ username }));
	if (!validatePassword(password)) return failure(err_invalid_password());

	const userId = generateId('u');
	const passwordSalt = crypto.randomBytes(16);
	const passwordHash = await hash(password, {
		...passwordCheckOpt,
		salt: passwordSalt,
	});

	try {
		await createUser(userId, username, defaultWebRole, {
			hash: passwordHash,
			salt: passwordSalt,
		});
	} catch (e) {
		if (isConflictError(e)) return failure(err_username_taken({ username }));
		throw e;
	}
	await userJwt.createJwtCookie(req, { id: userId, name: username, role: defaultWebRole });
	return success(true);
};
