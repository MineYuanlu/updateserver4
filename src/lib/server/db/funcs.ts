import { eq } from 'drizzle-orm';
import { db } from './index';
import * as _t from './schema';
import type { US4ID } from '../common';

function _lintType(t: _t._User_Raw | undefined): _t.User | undefined;
/// 内部函数, 仅用于类型检查
function _lintType(t: any): any {
	return t;
}

/**
 * 通过完整用户名获取用户全部信息
 * @note **包含密码等敏感信息**
 */
export async function getUserAllByName(username: string) {
	const results = await db.select().from(_t.user).where(eq(_t.user.username, username)).execute();
	return _lintType(results.at(0));
}

/**
 * 创建用户
 * @param id 用户ID
 * @param username 用户名
 * @param password 密码
 * @param role 角色
 * @returns 用户ID
 */
export function createUser(
	id: _t.User['id'],
	username: string,
	password: string,
	role: _t.User['role'] = 0
) {
	return db.insert(_t.user).values({ id, username, passwordHash: password, role }).execute();
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

/** 获取设置值(如果不存在则插入设置值并返回默认值) */
export async function getSettingValue(key: string, defaultValue: string | (() => string)) {
	const results = await db
		.select({ value: _t.setting.value })
		.from(_t.setting)
		.where(eq(_t.setting.key, key))
		.execute();
	const result = results.at(0);
	if (result) return result.value;

	if (typeof defaultValue === 'function') defaultValue = defaultValue();

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
