import {
	check_project_name__not_string,
	check_project_name__has_special,
	check_project_name__is_empty,
	check_project_name__too_long,
	check_project_name__not_start_with_letter,
	check_project_name__bad_char,
	enum_project__visibility_public,
	enum_project__visibility_private,
	enum_project__user_role_guest,
	enum_project__user_role_developer,
	enum_project__user_role_manager,
	enum_project__user_role_owner,
} from '$lib/paraglide/messages';
import type { Project } from '$lib/server/db/schema';
import { makeEnum } from './enum';
import type { US4ID } from './id';

export const projectNameReservedWords = ['create'] as const;

const _pnrw = new Set<string>(projectNameReservedWords);

const projectNameRegex = /^[A-Za-z][A-Za-z0-9_.-]{0,19}$/;
/**
 * 项目名称合法性检查
 *
 * `^[A-Za-z][A-Za-z0-9_.-]{0,19}$`
 * @param name 项目名称
 * @returns 是否合法
 */
export function validateProjectName(name: unknown): name is string {
	if (typeof name !== 'string') return false;
	if (_pnrw.has(name)) return false;
	return projectNameRegex.test(name);
}

/**
 * 项目名称合法性检查失败原因
 * @param name 项目名称
 * @returns 失败原因
 */
export function whyInvalidProjectName(name: string): string | undefined {
	if (typeof name !== 'string') return check_project_name__not_string();
	if (_pnrw.has(name)) return check_project_name__has_special();
	if (name.length === 0) return check_project_name__is_empty();
	if (name.length > 20) return check_project_name__too_long();
	if (!/^[A-Za-z]$/.test(name[0])) return check_project_name__not_start_with_letter();
	if (!projectNameRegex.test(name)) return check_project_name__bad_char();
	return undefined;
}

/** 项目描述最大长度 */
export const maxProjectDescriptionLength = 200;

export type ProjId = US4ID<'p'>;

/** 项目可见性 */
export const Visibility = makeEnum({
	private: [0, enum_project__visibility_public],
	public: [1, enum_project__visibility_private],
} as const);

/** 项目成员角色 */
export const UserRole = makeEnum({
	guest: [1, enum_project__user_role_guest],
	developer: [2, enum_project__user_role_developer],
	manager: [3, enum_project__user_role_manager],
	owner: [4, enum_project__user_role_owner],
} as const);

/** 获取项目永久(const)链接 */
export const getClinkByProjectId = (projectId: ProjId) => `/project/${projectId}`;
/** 获取项目短(short)链接 */
export const getSlinkByProjectName = (projectName: string) =>
	`/p/${encodeURIComponent(projectName)}`;
