import { and, desc, eq, exists, gte, lt, ne, or } from 'drizzle-orm';
import { db } from './index';
import * as _t from './schema';
import { defaultWebRole } from '$lib/common/user';
import { UserRole, Visibility } from '$lib/common/project';

/** 获取设置值(如果不存在则插入设置值并返回默认值) */
export async function getSettingValue(
	key: string,
	defaultValue: string | Buffer | (() => string | Buffer),
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

/**
 * 通过完整用户名获取用户全部信息
 * @note **包含密码等敏感信息**
 */
export async function getUserAllByName(name: string) {
	const results = await db.select().from(_t.user).where(eq(_t.user.name, name)).execute();
	return results.at(0);
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
	role: _t.User['role'] = defaultWebRole,
	password: { hash: string; salt: Buffer } | null = null,
) {
	return db
		.insert(_t.user)
		.values({
			id,
			name,
			passwordHash: password?.hash,
			passwordSalt: password?.salt,
			role,
		})
		.execute();
}

/** 创建OAuth提供商 */
export async function createOAuthProvider(
	name: string,
	desc: string,
	type: string,
	client_id: string,
	client_secret: string,
	redirect_uri: string,
) {
	return await db
		.insert(_t.oauthProvider)
		.values({
			name: name,
			desc: desc,
			type: type,
			clientId: client_id,
			clientSecret: client_secret,
			redirectUri: redirect_uri,
		})
		.execute();
}

/** 列出OAuth提供商名称和类型 */
export async function listOAuthProviders() {
	return await db
		.select({
			name: _t.oauthProvider.name,
			type: _t.oauthProvider.type,
			desc: _t.oauthProvider.desc,
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
	return ret.at(0);
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
			set: { info },
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
	role: _t.User['role'] = defaultWebRole,
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
		{ behavior: 'exclusive' },
	);
}

/**
 * 创建项目
 * @param id 项目ID
 * @param name 项目名称
 * @param owner 项目所有者ID
 * @param desc 项目描述
 * @param visibility 项目可见性
 */
export async function createProject(
	id: _t.Project['id'],
	name: string,
	owner: _t.User['id'],
	desc: string = '',
	visibility: _t.Project['visibility'] = Visibility.private.val,
) {
	const nameKey = name.trim().toLowerCase();
	return await db
		.insert(_t.project)
		.values({ id, owner, name, nameKey, desc, visibility })
		.execute();
}

/**
 * 列出项目
 * @param limit 条数
 * @param offset 偏移量
 */
export async function listProjects(offset: number, limit: number) {
	return await db
		.select({
			id: _t.project.id,
			name: _t.project.name,
			oid: _t.project.owner,
			owner: _t.user.name,
			desc: _t.project.desc,
			visibility: _t.project.visibility,
		})
		.from(_t.project)
		.leftJoin(_t.user, eq(_t.project.owner, _t.user.id))
		.orderBy(_t.project.nameKey)
		.limit(limit)
		.offset(offset)
		.execute();
}

const _proj_check_perm_public = eq(_t.project.visibility, Visibility.public.val);
const _proj_check_perm_role = (user: _t.User['id'], role: _t.ProjectMember['role']) =>
	exists(
		db
			.select({ uid: _t.projectMember.uid })
			.from(_t.projectMember)
			.where(
				and(
					eq(_t.projectMember.uid, user),
					eq(_t.projectMember.pid, _t.project.id),
					gte(_t.projectMember.role, role),
				),
			),
	);
const _proj_check_perm = (
	user?: _t.User['id'] | null | undefined,
	role: _t.ProjectMember['role'] = UserRole.guest.val,
) =>
	user ? or(_proj_check_perm_public, _proj_check_perm_role(user, role)) : _proj_check_perm_public;
/**
 * 检查项目权限并获取项目ID
 *
 * 只在此种情况下返回有效的项目ID:
 * - 项目可见性为公开
 * - 用户拥有权限(至少`role`的权限)
 * @param name 项目名称(key)
 * @param user 用户ID
 * @param role 最小权限
 * @returns 项目ID / undefined
 */
export async function checkPermGetProjIdByName(
	name: string,
	user?: _t.User['id'] | null | undefined,
	role: _t.ProjectMember['role'] = UserRole.guest.val,
) {
	const nameKey = name.trim().toLowerCase();
	const ret = await db
		.select({
			id: _t.project.id,
		})
		.from(_t.project)
		.where(and(eq(_t.project.nameKey, nameKey), _proj_check_perm(user, role)))
		.execute();
	return ret.at(0)?.id;
}

/**
 * 检查用户是否拥有项目权限
 *
 * 只在此种情况下返回true:
 * - 项目可见性为公开
 * - 用户拥有权限(至少`role`的权限)
 * @param name 项目名称(key)
 * @param user 用户ID
 * @param role 最小权限
 */
export async function checkPermByProjId(
	id: _t.Project['id'],
	user?: _t.User['id'] | null | undefined,
	role: _t.ProjectMember['role'] = UserRole.guest.val,
) {
	const ret = await db
		.select({
			id: _t.project.id,
		})
		.from(_t.project)
		.where(and(eq(_t.project.id, id), _proj_check_perm(user, role)))
		.execute();
	return !!ret.at(0);
}

/**
 * 检查用户权限, 并获取项目详情
 * @param id 项目ID
 * @param user 请求用户的ID
 * @param role 最小权限
 * @returns 项目详情 / undefined
 */
export async function getProjectDetailById(
	id: _t.Project['id'],
	user?: _t.User['id'] | null | undefined,
	role: _t.ProjectMember['role'] = UserRole.guest.val,
) {
	const ret0 = await db
		.select({
			id: _t.project.id,
			name: _t.project.name,
			oid: _t.project.owner,
			owner: _t.user.name,
			desc: _t.project.desc,
			visibility: _t.project.visibility,
			version: _t.project.version,
			versionCmp: _t.project.versionCmp,
			createdAt: _t.project.createdAt,
			links: _t.project.links,
		})
		.from(_t.project)
		.leftJoin(_t.user, eq(_t.project.owner, _t.user.id))
		.where(and(eq(_t.project.id, id), _proj_check_perm(user, role)))
		.execute();
	const proj = ret0.at(0);
	if (!proj) return undefined;

	const versions = await db
		.select({
			version: _t.projectVersion.version,
			desc: _t.projectVersion.desc,
			time: _t.projectVersion.time,
			size: _t.projectVersion.link,
		})
		.from(_t.projectVersion)
		.where(eq(_t.projectVersion.pid, id))
		.orderBy(desc(_t.projectVersion.time))
		.limit(3)
		.execute();

	const ret1 = await db
		.select({
			tag: _t.projectTag.tag,
		})
		.from(_t.projectTag)
		.where(eq(_t.projectTag.pid, id))
		.execute();
	const tags = ret1.map((t) => t.tag);
	return {
		proj,
		versions,
		tags,
	};
}

export async function getTotalCount(key: string) {
	const ret = await db
		.select({
			count: _t.cnts.value,
		})
		.from(_t.cnts)
		.where(and(eq(_t.cnts.name, key), eq(_t.cnts.unit, -1), eq(_t.cnts.time, 0)))
		.execute();
	return ret.at(0)?.count || 0;
}

export async function getSubCounts(key: string) {
	return await db
		.select({
			c: _t.cnts.value,
			u: _t.cnts.unit,
			t: _t.cnts.time,
		})
		.from(_t.cnts)
		.where(and(eq(_t.cnts.name, key)))
		.execute();
}
