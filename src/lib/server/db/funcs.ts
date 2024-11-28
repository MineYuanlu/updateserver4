import { and, eq } from 'drizzle-orm';
import { db } from './index';
import * as _t from './schema';

function _lintType(t: _t._User_Raw | undefined): _t.User | undefined;
function _lintType(t: _t._User_Info_Raw | undefined): _t._User_Info | undefined;
/// 内部函数, 仅用于类型检查
function _lintType(t: any): any {
	return t;
}

/**
 * 通过完整用户名获取用户全部信息
 * @note **包含密码等敏感信息**
 */
export async function getUserAllByName(name: string) {
	const results = await db.select().from(_t.user).where(eq(_t.user.name, name)).execute();
	return _lintType(results.at(0));
}

/**
 * 创建用户
 * @param id 用户ID
 * @param name 用户名
 * @param password 密码
 * @param role 角色
 * @returns 用户ID
 */
export function createUser(
	id: _t.User['id'],
	name: string,
	password: string,
	role: _t.User['role'] = 0
) {
	return db.insert(_t.user).values({ id, name, passwordHash: password, role }).execute();
}

/** 创建OAuth提供商 */
export async function createOAuthProvider(
	name: string,
	desc: string,
	type: string,
	client_id: string,
	client_secret: string,
	redirect_uri: string
) {
	return await db
		.insert(_t.oauthProvider)
		.values({
			name: name,
			desc: desc,
			type: type,
			clientId: client_id,
			clientSecret: client_secret,
			redirectUri: redirect_uri
		})
		.execute();
}

/** 列出OAuth提供商名称和类型 */
export async function listOAuthProviders() {
	return await db
		.select({
			name: _t.oauthProvider.name,
			type: _t.oauthProvider.type,
			desc: _t.oauthProvider.desc
		})
		.from(_t.oauthProvider)
		.execute();
}

/** 获取OAuth提供商 */
export async function getOAuthProvider(name: string) {
	const ret = await db
		.select()
		.from(_t.oauthProvider)
		.where(eq(_t.oauthProvider.name, name))
		.execute();
	return ret.at(0);
}

/**
 * 通过OAuth获取已注册过的用户信息
 */
export async function getUserInfoByOAuth(provider: string, provider_id: string) {
	const ret = await db
		.select({ id: _t.user.id, name: _t.user.name, role: _t.user.role })
		.from(_t.oauth)
		.innerJoin(_t.user, eq(_t.oauth.uid, _t.user.id))
		.where(and(eq(_t.oauth.provider, provider), eq(_t.oauth.id, provider_id)));
	return _lintType(ret.at(0));
}

export async function loginByOAuth() {
	db.insert(_t.oauth);
}

/** 获取设置值(如果不存在则插入设置值并返回默认值) */
export async function getSettingValue(
	key: string,
	defaultValue: string | Buffer | (() => string | Buffer)
) {
	const results = await db
		.select({ value: _t.setting.value })
		.from(_t.setting)
		.where(eq(_t.setting.key, key))
		.execute();
	const result = results.at(0);
	if (result) return result.value;

	if (typeof defaultValue === 'function') defaultValue = defaultValue();
	if (typeof defaultValue === 'string') defaultValue = Buffer.from(defaultValue);

	return await db.transaction(async (trx) => {
		const results = await trx
			.select({ value: _t.setting.value })
			.from(_t.setting)
			.where(eq(_t.setting.key, key))
			.execute();
		const result = results.at(0);
		if (result) return result.value;

		await trx.insert(_t.setting).values({ key, value: defaultValue }).execute();
		return defaultValue;
	});
}
