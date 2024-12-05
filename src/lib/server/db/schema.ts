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
import type { projCntTypes, CntDimFilter, CntValueFilter } from '$lib/common/cnts';

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
		version: text('version'), // 正在使用中的版本号ID
		createdAt: integer('created_at').default(sql`(current_timestamp)`), // 创建时间
		links: text('links', { mode: 'json' }) // 项目链接
			.$type<Record<string, string>>()
			.notNull()
			.default({}),
	},
	(t) => ({
		ownerIndex: index('proj_owner_index').on(t.owner),
	}),
);
export type Project = typeof project.$inferSelect;

/** 项目版本信息 */
export const projectVersion = createTable(
	'project_version',
	{
		version: text('version').notNull(), // 版本号
		pid: text('pid') // 项目ID
			.$type<ProjId>()
			.references(() => project.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		time: integer('time').notNull(), // 版本创建时间
		desc: text('desc'), // 版本描述
		link: text('link'), // 版本链接
	},
	(t) => ({
		pk: primaryKey({ columns: [t.version, t.pid] }),
		pidIndex: index('proj_ver_pid_index').on(t.pid),
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

/** 项目标签信息 */
export const projectTag = createTable(
	'project_tag',
	{
		pid: text('pid') // 项目ID
			.$type<ProjId>()
			.references(() => project.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		tag: text('tag').notNull(), // 标签
	},
	(t) => ({
		pk: primaryKey({ columns: [t.pid, t.tag] }),
		pidIndex: index('proj_tag_pid_index').on(t.pid),
		tagIndex: index('proj_tag_tag_index').on(t.tag),
	}),
);
export type ProjectTag = typeof projectTag.$inferSelect;

/** 时间计数器表, 可以记住历史数据 */
export const timeCnts = createTable(
	'time_cnts',
	{
		name: text('name').notNull(), // 计数器名称
		unit: integer('unit').notNull(), // 计数器单位的序号（0,1,2,...), -1代表总量
		time: integer('point').notNull(), // 计数点: 计数器时间戳 除以 时间单位, 总量下为0
		value: integer('value').notNull(), // 计数器值
	},
	(t) => ({
		pk: primaryKey({ columns: [t.name, t.unit, t.time] }),
		nuIdx: index('cnts_name_unit_time_index').on(t.name, t.unit),
		utIdx: index('cnts_unit_time_index').on(t.unit, t.time),
	}),
);

export type TimeCnts = typeof timeCnts.$inferSelect;

/** 瞬时计数器表, 只能记住当前和一个历史数据 */
export const instantCnts = createTable(
	'instant_cnts',
	{
		name: text('name').notNull(), // 计数器名称
		time: integer('time').notNull(), // 计数点: 计数器时间戳 除以 时间单位
		dim: text('dim'), // 计数器维度
		value: integer('value').notNull(), // 计数器值
	},
	(t) => ({
		pk: primaryKey({ columns: [t.name, t.time] }),
	}),
);

export type InstantCnts = typeof instantCnts.$inferSelect;

/** 项目计数器表, 记录项目的各种计数器 */
export const projectCounters = createTable(
	'project_counters',
	{
		pid: text('pid') // 项目ID
			.$type<ProjId>()
			.references(() => project.id, {
				onDelete: 'cascade',
				onUpdate: 'cascade',
			}),
		id: text('id').notNull(), // 计数器id
		title: text('title').notNull(), // 计数器名称
		type: integer('type') // 计数器类型
			.$type<EnumVal<typeof projCntTypes>>()
			.notNull(),
		df: text('df', { mode: 'json' }) // 计数器维度过滤条件
			.$type<CntDimFilter>(),
		vf: text('vf', { mode: 'json' }) // 计数器值过滤条件
			.$type<CntValueFilter>(),
		configs: text('configs', { mode: 'json' }), // 计数器配置
	},
	(t) => ({
		pk: primaryKey({ columns: [t.pid, t.id] }),
		pidIndex: index('proj_cnt_pid_index').on(t.pid),
	}),
);

export type ProjectCounters = typeof projectCounters.$inferSelect;
