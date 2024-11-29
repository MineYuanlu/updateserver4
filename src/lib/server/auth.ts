import type { RequestEvent } from '@sveltejs/kit';
import { SignJWT, jwtVerify } from 'jose';
import { getSetting, type US4ID } from './common';
import { COOKIES } from '../common/cookies';
import type { UserInfo, UserSession } from '$lib/common/user';

export async function createSession(user: UserInfo, expiresAt?: Date) {
	if (expiresAt === undefined) {
		const expInS = await getSetting('JWT_EXPIRATION');
		expiresAt = new Date(Date.now() + expInS * 1000);
	}
	const token = await new SignJWT({
		typ: 'U',
		...user
	} satisfies UserSession)
		.setProtectedHeader({ alg: await getSetting('JWT_ALGORITHM') })
		.setIssuedAt()
		.setExpirationTime(expiresAt)
		.sign(await getSetting('JWT_SECRET'));
	return token;
}

export async function parseSession(token: string) {
	const { payload } = await jwtVerify<UserSession>(token, await getSetting('JWT_SECRET'));
	if (payload.typ !== 'U') throw new Error('Invalid token type');
	return payload;
}

export async function createSessionTokenCookie(event: RequestEvent, user: UserInfo) {
	const expInS = await getSetting('JWT_EXPIRATION');
	const expire = new Date(Date.now() + expInS * 1000);
	const token = await createSession(user, expire);
	event.cookies.set(COOKIES.Session, token, {
		expires: expire,
		path: '/'
	});
}

/**
 * 校验并解析session cookies中的payload部分
 * @param event
 * @returns 解析结果
 */
export async function getSessionTokenCookie(event: RequestEvent) {
	const token = event.cookies.get(COOKIES.Session);
	if (token === undefined) return undefined;
	try {
		return await parseSession(token);
	} catch (e) {
		deleteSessionTokenCookie(event);
		return undefined;
	}
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(COOKIES.Session, {
		path: '/'
	});
}
