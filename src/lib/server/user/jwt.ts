import type { JwtInfo, JwtTypes } from '$lib/common/jwt';
import { jwtVerify, SignJWT } from 'jose';
import { getSetting } from '../common';
import { COOKIES, type COOKIE_VALUES } from '$lib/common/cookies';
import type { UserInfo } from '$lib/common/user';
import type { OAuthRegisterInfo } from '$lib/common/oauth';
import type { Cookies } from '@sveltejs/kit';
import { z } from 'zod';

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
 * 校验jwt是否有效
 * @param token jwt
 * @param type 类型
 * @returns 校验结果
 */
async function checkJwt(token: string, type: JwtTypes) {
	try {
		parseJwt(token, type);
	} catch (e) {
		return false;
	}
	return true;
}
/**
 * 解析jwt失败原因
 * @param token jwt
 * @param type 类型
 * @returns 原因
 */
async function whyFailedJwt(token: string, type: JwtTypes) {
	try {
		parseJwt(token, type);
	} catch (e) {
		if (e instanceof Error) return e.message;
		else return 'unknown';
	}
	return 'no error';
}

/**
 * 对`event`添加jwt cookie
 * @param event 请求事件
 * @param data 数据
 * @param type 类型
 * @param cookie cookie名称
 */
async function createJwtCookie(
	event: CookieData,
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
	event: CookieData,
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
function deleteSessionTokenCookie(event: CookieData, cookie: COOKIE_VALUES) {
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
type ZodExtra<T extends z.ZodType, CookieName extends COOKIE_VALUES> = readonly [T, CookieName] & {
	describe(description: string): [T, CookieName];
	optional(): [z.ZodOptional<T>, CookieName];
	nullable(): [z.ZodNullable<T>, CookieName];
	nullish(): [z.ZodOptional<z.ZodNullable<T>>, CookieName];
};
type JwtCookieFuncs<
	Data extends Record<string, unknown>,
	T extends JwtTypes,
	CookieName extends COOKIE_VALUES,
> = {
	/** 对`event`添加jwt cookie */
	createJwtCookie: (event: CookieData, data: Data) => Promise<void>;
	/** 校验并解析jwt cookie */
	getJwtCookie: (event: CookieData) => Promise<JwtInfo<Data, T> | undefined>;
	/** 删除jwt cookie */
	deleteSessionTokenCookie: (event: CookieData) => void;

	zod: ZodExtra<z.ZodType<Data, z.ZodTypeDef, string>, CookieName>;
};

function generateFuncs<
	Data extends Record<string, unknown>,
	T extends JwtTypes,
	CookieName extends COOKIE_VALUES,
>(type: T, cookie: CookieName): JwtFuncs<Data, T> & JwtCookieFuncs<Data, T, CookieName>;
function generateFuncs<Data extends Record<string, unknown>, T extends JwtTypes>(
	type: T,
): JwtFuncs<Data, T>;

function generateFuncs<
	Data extends Record<string, unknown>,
	T extends JwtTypes,
	CookieName extends COOKIE_VALUES,
>(type: T, cookie?: CookieName) {
	const funcs: JwtFuncs<Data, T> = {
		createJwt: (data: Data, expiresAt?: Date) => createJwt(data, type, expiresAt),
		parseJwt: (token: string) => parseJwt<Data, T>(token, type),
	};
	if (!cookie) return funcs;
	const zt = z
		.string()
		.transform<{ ok: true; r: JwtInfo<Data, T>; e?: string } | { ok: false; e: string }>(
			async (val) => {
				try {
					const r = await parseJwt<Data, T>(val, type);
					return { ok: true, r };
				} catch (e) {
					if (e instanceof Error) return { ok: false, e: e.message };
					return { ok: false, e: 'unknown' };
				}
			},
		)
		.refine(
			(v) => v.ok,
			(v) => ({ message: v.e }),
		)
		.transform((v) => v.r);
	const zod: any = [zt, cookie];
	zod.describe = (desc: string) => [zt.describe(desc), cookie];
	zod.nullable = () => [zt.nullable(), cookie];
	zod.nullish = () => [zt.nullish(), cookie];
	zod.optional = () => [zt.optional(), cookie];
	return {
		...funcs,
		createJwtCookie: (event: CookieData, data: Data) => createJwtCookie(event, data, type, cookie),
		getJwtCookie: (event: CookieData) => getJwtCookie<Data, T>(event, type, cookie),
		deleteSessionTokenCookie: (event: CookieData) => deleteSessionTokenCookie(event, cookie),
		zod,
	} satisfies JwtFuncs<Data, T> & JwtCookieFuncs<Data, T, CookieName>;
}

export const userJwt = generateFuncs<UserInfo, 'U', typeof COOKIES.Session>('U', COOKIES.Session);
export const oauthRegisterJwt = generateFuncs<OAuthRegisterInfo, 'OAUTH_R'>('OAUTH_R');
type CookieData = { cookies: Cookies };
