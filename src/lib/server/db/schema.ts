import {
	sqliteTable as createTable,
	text,
	integer,
	primaryKey,
	unique,
	blob,
	index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { UserId, WebRole } from '$lib/common/user';
import type { Visibility, ProjId, UserRole } from '$lib/common/project';
import type { EnumVal } from '$lib/common/enum';

/** 用户基本信息 */
export const user = createTable('user', {
	id: text('id').$type<UserId>().primaryKey(), // 用户ID
	name: text('username').notNull().unique(), // 用户名
	role: integer('role').$type<EnumVal<typeof WebRole>>().notNull().default(0), // 用户角色
	passwordHash: text('password_hash'), // 密码哈希
	passwordSalt: blob('password_salt', { mode: 'buffer' }), // 密码盐
});
export type User = typeof user.$inferSelect;

/** 第三方平台信息 */
export const oauthProvider = createTable('oauth_provider', {
	name: text('name').primaryKey(), // 第三方平台名称
	desc: text('desc').notNull().default(''), // 第三方平台描述
	type: text('type').notNull(), // 第三方平台类型
	clientId: text('client_id').notNull(), // 客户端ID
	clientSecret: text('client_secret').notNull(), // 客户端密钥
	redirectUri: text('redirect_uri').notNull(), // 回调地址
});
export type OAuthProvider = typeof oauthProvider.$inferSelect;

/** 第三方登录信息 */
export const oauth = createTable(
	'oauth',
	{
		uid: text('uid') // 用户ID
			.$type<UserId>()
			.references(() => user.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		provider: text('provider') // 第三方平台名称
			.references(() => oauthProvider.name, {
				onDelete: 'restrict',
				onUpdate: 'restrict',
			}),
		id: text('id'), // 第三方平台用户ID
		info: text('info'), // 第三方平台用户信息
	},
	(t) => ({
		pk: primaryKey({ columns: [t.uid, t.provider] }),
		pid: unique().on(t.provider, t.id),
	}),
);
export type OAuth = typeof oauth.$inferSelect;

/** 系统设置 */
export const setting = createTable('setting', {
	key: text('key').primaryKey(),
	value: blob('data', { mode: 'buffer' }).notNull(),
});
export type Setting = typeof setting.$inferSelect;

/** 项目信息 */
export const project = createTable(
	'project',
	{
		id: text('id').$type<ProjId>().primaryKey().notNull(), // 项目ID
		owner: text('owner') // 项目所有者ID
			.$type<UserId>()
			.notNull()
			.references(() => user.id, {
				onDelete: 'restrict',
				onUpdate: 'restrict',
			}),
		name: text('name').notNull(), // 项目名称
		nameKey: text('name_key') // 项目名称的key, 全小写用于比较
			.notNull()
			.unique(),
		desc: text('desc') // 项目描述
			.notNull()
			.default(''),
		visibility: integer('visibility') // 仓库可见性
			.$type<EnumVal<typeof Visibility>>()
			.notNull(),
		versionCmp: text('version_cmp'), // 版本比较信息
		version: integer('version'), // 正在使用中的版本号ID
		createdAt: integer('created_at').default(sql`(current_timestamp)`), // 创建时间
	},
	(t) => ({
		ownerIndex: index('owner_index').on(t.owner),
	}),
);
export type Project = typeof project.$inferSelect;

/** 项目版本信息 */
export const projectVersion = createTable(
	'project_version',
	{
		version: text('version').notNull(), // 版本号
		pid: text('pid'), // 项目ID
	},
	(t) => ({
		pk: primaryKey({ columns: [t.version, t.pid] }),
	}),
);
export type ProjectVersion = typeof projectVersion.$inferSelect;

/** 项目成员信息 */
export const projectMember = createTable(
	'project_member',
	{
		uid: text('uid') // 用户ID
			.$type<UserId>()
			.references(() => user.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		pid: text('pid') // 项目ID
			.$type<ProjId>()
			.references(() => project.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		role: integer('role') // 角色
			.$type<EnumVal<typeof UserRole>>()
			.notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.uid, t.pid] }),
	}),
);
export type ProjectMember = typeof projectMember.$inferSelect;
