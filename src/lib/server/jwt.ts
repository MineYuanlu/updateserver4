import type { JwtInfo, JwtTypes } from '$lib/common/jwt';
import { jwtVerify, SignJWT } from 'jose';
import { getSetting } from './common';
import type { RequestEvent } from '@sveltejs/kit';
import { COOKIES, type COOKIE_VALUES } from '$lib/common/cookies';
import type { UserInfo } from '$lib/common/user';
import type { OAuthRegisterInfo } from '$lib/common/oauth';

/**
 * 创建JWT
 * @param data 数据
 * @param type 类型
 * @param expiresAt 过期时间
 * @returns jwt
 */
async function createJwt(
	data: Record<string, unknown>,
	type: JwtTypes,
	expiresAt?: Date,
): Promise<string> {
	if (expiresAt === undefined) {
		const expInS = await getSetting('JWT_EXPIRATION');
		expiresAt = new Date(Date.now() + expInS * 1000);
	}
	const token = await new SignJWT({
		typ: type,
		...data,
	})
		.setProtectedHeader({ alg: await getSetting('JWT_ALGORITHM') })
		.setIssuedAt()
		.setExpirationTime(expiresAt)
		.sign(await getSetting('JWT_SECRET'));
	return token;
}

/**
 * 校验并解析jwt
 * @param token jwt
 * @param type 类型
 * @throws jwt校验失败/类型不匹配
 * @returns 解析结果
 */
async function parseJwt<Data extends Record<string, unknown>, T extends JwtTypes>(
	token: string,
	type: T,
): Promise<JwtInfo<Data, T>> {
	if (typeof token !== 'string') throw new Error('Invalid token');
	const { payload } = await jwtVerify(token, await getSetting('JWT_SECRET'));
	if (payload.typ !== type) throw new Error('Invalid token type');
	return payload as JwtInfo<Data, T>;
}

/**
 * 对`event`添加jwt cookie
 * @param event 请求事件
 * @param data 数据
 * @param type 类型
 * @param cookie cookie名称
 */
async function createJwtCookie(
	event: RequestEvent,
	data: Record<string, unknown>,
	type: JwtTypes,
	cookie: COOKIE_VALUES,
) {
	const expInS = await getSetting('JWT_EXPIRATION');
	const expire = new Date(Date.now() + expInS * 1000);
	const token = await createJwt(data, type, expire);
	event.cookies.set(cookie, token, {
		expires: expire,
		path: '/',
	});
}

/**
 * 校验并解析jwt cookie
 * @param event 请求事件
 * @param type 类型
 * @param cookie cookie名称
 * @throws jwt校验失败/类型不匹配
 * @returns 解析结果
 */
async function getJwtCookie<Data extends Record<string, unknown>, T extends JwtTypes>(
	event: RequestEvent,
	type: T,
	cookie: COOKIE_VALUES,
): Promise<JwtInfo<Data, T> | undefined> {
	const token = event.cookies.get(cookie);
	if (token === undefined) return undefined;
	try {
		return await parseJwt<Data, T>(token, type);
	} catch (_) {
		deleteSessionTokenCookie(event, cookie);
		return undefined;
	}
}

/**
 * 删除jwt cookie
 * @param event 请求事件
 * @param cookie cookie名称
 */
function deleteSessionTokenCookie(event: RequestEvent, cookie: COOKIE_VALUES) {
	event.cookies.delete(cookie, {
		path: '/',
	});
}

type JwtFuncs<Data extends Record<string, unknown>, T extends JwtTypes> = {
	/** 创建JWT */
	createJwt: (data: Data, expiresAt?: Date) => Promise<string>;
	/** 校验并解析jwt */
	parseJwt: (token: string) => Promise<JwtInfo<Data, T>>;
};
type JwtCookieFuncs<Data extends Record<string, unknown>, T extends JwtTypes> = {
	/** 对`event`添加jwt cookie */
	createJwtCookie: (event: RequestEvent, data: Data) => Promise<void>;
	/** 校验并解析jwt cookie */
	getJwtCookie: (event: RequestEvent) => Promise<JwtInfo<Data, T> | undefined>;
	/** 删除jwt cookie */
	deleteSessionTokenCookie: (event: RequestEvent) => void;
};

function generateFuncs<Data extends Record<string, unknown>, T extends JwtTypes>(
	type: T,
	cookie: COOKIE_VALUES,
): JwtFuncs<Data, T> & JwtCookieFuncs<Data, T>;
function generateFuncs<Data extends Record<string, unknown>, T extends JwtTypes>(
	type: T,
): JwtFuncs<Data, T>;

function generateFuncs<Data extends Record<string, unknown>, T extends JwtTypes>(
	type: T,
	cookie?: COOKIE_VALUES,
) {
	const funcs: JwtFuncs<Data, T> = {
		createJwt: (data: Data, expiresAt?: Date) => createJwt(data, type, expiresAt),
		parseJwt: (token: string) => parseJwt<Data, T>(token, type),
	};
	if (!cookie) return funcs;
	return {
		...funcs,
		createJwtCookie: (event: RequestEvent, data: Data) =>
			createJwtCookie(event, data, type, cookie),
		getJwtCookie: (event: RequestEvent) => getJwtCookie<Data, T>(event, type, cookie),
		deleteSessionTokenCookie: (event: RequestEvent) => deleteSessionTokenCookie(event, cookie),
	} satisfies JwtFuncs<Data, T> & JwtCookieFuncs<Data, T>;
}

export const userJwt = generateFuncs<UserInfo, 'U'>('U', COOKIES.Session);
export const oauthRegisterJwt = generateFuncs<OAuthRegisterInfo, 'OAUTH_R'>('OAUTH_R');
