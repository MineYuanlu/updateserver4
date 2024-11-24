import { eq } from 'drizzle-orm';
import { db } from './index';
import * as table from './schema';

/** 通过完整用户名获取用户全部信息 */
export async function getUserAllByName(username: string) {
	const results = await db
		.select()
		.from(table.user)
		.where(eq(table.user.username, username))
		.execute();
	return results.at(0);
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
		.insert(table.oauthProvider)
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
			name: table.oauthProvider.name,
			type: table.oauthProvider.type,
			desc: table.oauthProvider.desc
		})
		.from(table.oauthProvider)
		.execute();
}

/** 获取OAuth提供商 */
export async function getOAuthProvider(name: string) {
	const ret = await db
		.select()
		.from(table.oauthProvider)
		.where(eq(table.oauthProvider.name, name))
		.execute();
	return ret.at(0);
}

/** 获取设置值(如果不存在则插入设置值并返回默认值) */
export async function getSettingValue(key: string, defaultValue: string | (() => string)) {
	const results = await db
		.select({ value: table.setting.value })
		.from(table.setting)
		.where(eq(table.setting.key, key))
		.execute();
	const result = results.at(0);
	if (result) return result.value;

	if (typeof defaultValue === 'function') defaultValue = defaultValue();

	return await db.transaction(async (trx) => {
		const results = await trx
			.select({ value: table.setting.value })
			.from(table.setting)
			.where(eq(table.setting.key, key))
			.execute();
		const result = results.at(0);
		if (result) return result.value;

		await trx.insert(table.setting).values({ key, value: defaultValue }).execute();
		return defaultValue;
	});
}
