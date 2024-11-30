import {
	sqliteTable as createTable,
	text,
	integer,
	primaryKey,
	unique,
	blob
} from 'drizzle-orm/sqlite-core';
import type { UserId, UserRole } from '$lib/common/user';

/** 将更精确的类型限制附加到原始类型 */
type LintMerge<Raw, Ext extends { [K in keyof Raw]?: Raw[K] }> = {
	[K in keyof Raw]: K extends keyof Ext ? Ext[K] : Raw[K];
};

/** 用户基本信息 */
export const user = createTable('user', {
	id: text('id').primaryKey(), // 用户ID
	name: text('username').notNull().unique(), // 用户名
	role: integer('role').notNull().default(0), // 用户角色
	passwordHash: text('password_hash'), // 密码哈希
	passwordSalt: blob('password_salt', { mode: 'buffer' }) // 密码盐
});
export type _User_Raw = typeof user.$inferSelect;
export type User = LintMerge<
	_User_Raw,
	{
		id: UserId;
		role: UserRole;
	}
>;
export type _User_Info_Raw = Pick<_User_Raw, 'id' | 'name' | 'role'>;
export type _User_Info = LintMerge<_User_Info_Raw, { id: UserId; role: UserRole }>;

/** 第三方平台信息 */
export const oauthProvider = createTable('oauth_provider', {
	name: text('name').primaryKey(), // 第三方平台名称
	desc: text('desc').notNull().default(''), // 第三方平台描述
	type: text('type').notNull(), // 第三方平台类型
	clientId: text('client_id').notNull(), // 客户端ID
	clientSecret: text('client_secret').notNull(), // 客户端密钥
	redirectUri: text('redirect_uri').notNull() // 回调地址
});
export type OAuthProvider = typeof oauthProvider.$inferSelect;

/** 第三方登录信息 */
export const oauth = createTable(
	'oauth',
	{
		uid: text('uid') // 用户ID
			.references(() => user.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade'
			}),
		provider: text('provider') // 第三方平台名称
			.references(() => oauthProvider.name, {
				onDelete: 'restrict',
				onUpdate: 'restrict'
			}),
		id: text('id'), // 第三方平台用户ID
		info: text('info') // 第三方平台用户信息
	},
	(t) => ({
		pk: primaryKey({ columns: [t.uid, t.provider] }),
		pid: unique().on(t.provider, t.id)
	})
);
export type OAuth = typeof oauth.$inferSelect;

/** 系统设置 */
export const setting = createTable('setting', {
	key: text('key').primaryKey(),
	value: blob('data', { mode: 'buffer' }).notNull()
});
export type Setting = typeof setting.$inferSelect;

/** 项目信息 */
export const project = createTable('project', {
	id: integer('id').primaryKey({ autoIncrement: true }).notNull(), // 项目ID
	owner: text('owner') // 项目所有者ID
		.notNull()
		.references(() => user.id, {
			onDelete: 'restrict',
			onUpdate: 'restrict'
		}),
	name: text('name').notNull(), // 项目名称
	nameKey: text('name_key') // 项目名称的key, 全小写用于比较
		.notNull()
		.unique(),
	visibility: integer('visibility').notNull(), // 仓库可见性
	versionCmp: text('version_cmp'), // 版本比较信息
	version: integer('version') // 正在使用中的版本号ID
});
export type Project = typeof project.$inferSelect;
