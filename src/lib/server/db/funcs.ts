import { and, eq } from 'drizzle-orm';
import { db } from './index';
import * as _t from './schema';
import { defaultUserRole } from '$lib/common/user';

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
	password: string | null = null,
	role: _t.User['role'] = defaultUserRole
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

/**
 * 注册OAuth用户
 *
 * 此方法仅注册OAuth侧信息, 将uid置空, 需要链接到实际用户时再更新uid
 * @param id OAuthID
 * @param provider OAuth提供商名称
 * @param info OAuth用户信息
 */
export async function createOAuthUser(id: string, provider: string, info: string) {
	return await db
		.insert(_t.oauth)
		.values({ id, provider, info })
		.onConflictDoUpdate({
			target: [_t.oauth.id, _t.oauth.provider],
			set: { info }
		})
		.execute();
}

/**
 * 链接OAuth用户到实际用户
 * @param uid 实际用户ID
 * @param provider OAuth提供商名称
 * @param provider_id OAuth用户ID
 */
export async function linkOAuthUser(uid: _t.User['id'], provider: string, provider_id: string) {
	return await db
		.update(_t.oauth)
		.set({ uid })
		.where(and(eq(_t.oauth.provider, provider), eq(_t.oauth.id, provider_id)))
		.execute();
}

/**
 * 创建新的用户并与OAuth用户关联, 如果OAuth用户已经关联则不创建新用户
 * @param uid 实际用户ID
 * @param provider OAuth提供商名称
 * @param provider_id OAuth用户ID
 * @return 已关联的用户ID / null
 */
export async function linkOAuthToNewUser(
	uid: _t.User['id'],
	provider: string,
	provider_id: string,
	username: string,
	role: _t.User['role'] = defaultUserRole
) {
	return await db.transaction(
		async (trx) => {
			const ret = await trx
				.select({ uid: _t.oauth.uid })
				.from(_t.oauth)
				.where(and(eq(_t.oauth.provider, provider), eq(_t.oauth.id, provider_id)))
				.execute();
			const oldUid = ret.at(0)?.uid;
			if (oldUid) return oldUid;

			await trx.insert(_t.user).values({ id: uid, name: username, role }).execute();

			await trx
				.update(_t.oauth)
				.set({ uid })
				.where(and(eq(_t.oauth.provider, provider), eq(_t.oauth.id, provider_id)))
				.execute();

			return null;
		},
		{ behavior: 'exclusive' }
	);
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
