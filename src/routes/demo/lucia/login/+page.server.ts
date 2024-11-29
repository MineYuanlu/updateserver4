import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { createUser, getUserAllByName } from '$lib/server/db/funcs';
import { generateId } from '$lib/server/common';
import { validatePassword, validateUserName } from '$lib/common/user';

export const load: PageServerLoad = async (event) => {
	if ((await auth.getSessionTokenCookie(event))?.typ === 'USER') {
		return redirect(302, '/demo/lucia');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUserName(username)) {
			return fail(400, { message: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const existingUser = await getUserAllByName(username);
		if (!existingUser) {
			// 用户不存在
			return fail(400, { message: 'Incorrect username or password' });
		}

		if (!existingUser.passwordHash) {
			//未开启密码验证
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			// 密码错误
			return fail(400, { message: 'Incorrect username or password' });
		}

		await auth.createSessionTokenCookie(event, {
			id: existingUser.id,
			name: existingUser.name,
			role: existingUser.role
		});

		return redirect(302, '/demo/lucia');
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUserName(username)) {
			return fail(400, { message: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { message: 'Invalid password' });
		}

		const userId = generateId('u');
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			await createUser(userId, username, passwordHash, 0);

			await auth.createSessionTokenCookie(event, { id: userId, name: username, role: 0 });
		} catch (e) {
			return fail(500, { message: 'An error has occurred' });
		}
		return redirect(302, '/demo/lucia');
	}
};
