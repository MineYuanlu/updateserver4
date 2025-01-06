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
	check_project_desc__not_string,
	check_project_desc__too_long,
	check_project_links__not_object,
	check_project_links__too_many_links,
	check_project_links__key_not_string,
	check_project_links__key_too_long,
	check_project_links__value_not_string,
	check_project_links__value_too_long,
	check_project_links__value_not_url,
	check_project_tags__not_array,
	check_project_tags__too_many_tags,
	check_project_tags__tag_not_string,
	check_project_tags__tag_too_long,
} from '$lib/paraglide/messages';
import { isURL } from '$lib/utils/url';
import { z } from 'zod';
import { makeEnum } from './enum';
import { zUS4ID, type US4ID } from './id';
import { langPrefix } from '$lib/i18n';

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
export function whyInvalidProjectName(name: unknown): string | undefined {
	if (typeof name !== 'string') return check_project_name__not_string();
	if (_pnrw.has(name)) return check_project_name__has_special();
	if (name.length === 0) return check_project_name__is_empty();
	if (name.length > 20) return check_project_name__too_long({ max: 20 });
	if (!/^[A-Za-z]$/.test(name[0])) return check_project_name__not_start_with_letter();
	if (!projectNameRegex.test(name)) return check_project_name__bad_char();
	return undefined;
}
export const zProjectName = z.custom<string>(validateProjectName, (t) => ({
	message: whyInvalidProjectName(t),
}));

/** 项目描述最大长度 */
export const maxProjectDescriptionLength = 200;

/**
 * 项目描述合法性检查
 * @param desc 项目描述
 * @returns 是否合法
 */
export function validateProjectDesc(desc: unknown): desc is string {
	if (typeof desc !== 'string') return false;
	if (desc.length > maxProjectDescriptionLength) return false;
	return true;
}

/**
 * 项目描述合法性检查失败原因
 * @param desc 项目描述
 * @returns 失败原因
 */
export function whyInvalidProjectDesc(desc: unknown): string | undefined {
	if (typeof desc !== 'string') return check_project_desc__not_string();
	if (desc.length > maxProjectDescriptionLength)
		return check_project_desc__too_long({ max: maxProjectDescriptionLength });
	return undefined;
}

export const zProjectDesc = z.custom<string>(validateProjectDesc, (t) => ({
	message: whyInvalidProjectDesc(t),
}));

/** 项目链接最大数量 */
export const maxProjectLinksNumber = 10;
/** 项目链接键最大长度 */
export const maxProjectLinkKeyLength = 20;
/** 项目链接值最大长度 */
export const maxProjectLinkValueLength = 200;

/**
 * 项目链接合法性检查
 * @param links 项目链接
 * @returns 是否合法
 */
export function validateProjectLinks(links: unknown): links is Record<string, string> {
	if (typeof links !== 'object' || links === null || Array.isArray(links)) return false;
	let cnt = 0;
	for (const key in links) {
		if (typeof key !== 'string') return false;
		if (!key || key.length > maxProjectLinkKeyLength) return false;
		const val = (links as any)[key];
		if (typeof val !== 'string') return false;
		if (!val || val.length > maxProjectLinkValueLength) return false;
		if (!isURL(val)) return false;
		if (++cnt > maxProjectLinksNumber) return false;
	}
	return true;
}

/**
 * 项目链接合法性检查失败原因
 * @param links 项目链接
 * @returns 失败原因
 */
export function whyInvalidProjectLinks(links: unknown): string | undefined {
	if (typeof links !== 'object' || links === null || Array.isArray(links))
		return check_project_links__not_object();
	let cnt = 0;
	for (const key in links) {
		if (typeof key !== 'string') return check_project_links__key_not_string();
		if (!key || key.length > maxProjectLinkKeyLength)
			return check_project_links__key_too_long({ max: maxProjectLinkKeyLength });
		const val = (links as any)[key];
		if (typeof val !== 'string') return check_project_links__value_not_string();
		if (!val || val.length > maxProjectLinkValueLength)
			return check_project_links__value_too_long({ max: maxProjectLinkValueLength });
		if (!isURL(val)) return check_project_links__value_not_url();
		if (++cnt > maxProjectLinksNumber)
			return check_project_links__too_many_links({ max: maxProjectLinksNumber });
	}
	return undefined;
}

export const zProjectLinks = z.custom<Record<string, string>>(validateProjectLinks, (t) => ({
	message: whyInvalidProjectLinks(t),
}));

/** 项目标签最大数量 */
export const maxProjectTagNumber = 20;
/** 项目标签最大长度 */
export const maxProjectTagLength = 20;

/**
 * 项目标签合法性检查
 * @param tag 项目标签
 * @returns 是否合法
 */
export function validateProjectTag(tag: unknown): tag is string {
	if (typeof tag !== 'string') return false;
	if (!tag || tag.length > maxProjectTagLength) return false;
	return true;
}

/**
 * 项目标签合法性检查失败原因
 * @param tag 项目标签
 * @returns 失败原因
 */
export function whyInvalidProjectTag(tag: unknown): string | undefined {
	if (typeof tag !== 'string') return check_project_tags__tag_not_string();
	if (!tag || tag.length > maxProjectTagLength)
		return check_project_tags__tag_too_long({ max: maxProjectTagLength });
	return undefined;
}

export const zProjectTag = z.custom<string>(validateProjectTag, (t) => ({
	message: whyInvalidProjectTag(t),
}));

/**
 * 项目标签合法性检查
 * @param tags 项目标签
 * @returns 是否合法
 */
export function validateProjectTags(tags: unknown): tags is string[] {
	if (typeof tags !== 'object' || tags === null) return false;
	if (!Array.isArray(tags)) return false;
	if (tags.length > maxProjectTagNumber) return false;
	for (const t of tags) {
		if (typeof t !== 'string') return false;
		if (!t || t.length > maxProjectTagLength) return false;
	}
	return true;
}

/**
 * 项目标签合法性检查失败原因
 * @param tags 项目标签
 * @returns 失败原因
 */
export function whyInvalidProjectTags(tags: unknown): string | undefined {
	if (typeof tags !== 'object' || tags === null || !Array.isArray(tags))
		return check_project_tags__not_array();
	if (tags.length > maxProjectTagNumber)
		return check_project_tags__too_many_tags({ max: maxProjectTagNumber });
	for (const t of tags) {
		if (typeof t !== 'string') return check_project_tags__tag_not_string();
		if (!t || t.length > maxProjectTagLength)
			return check_project_tags__tag_too_long({ max: maxProjectTagLength });
	}
	return undefined;
}

export const zProjectTags = z.custom<string[]>(validateProjectTags, (t) => ({
	message: whyInvalidProjectTags(t),
}));

/** 项目ID */
export type ProjId = US4ID<'p'>;
/** 项目ID zod */
export const zProjId = zUS4ID('p');

/** 项目可见性 */
export const Visibility = makeEnum({
	private: [0, enum_project__visibility_private],
	public: [1, enum_project__visibility_public],
} as const);

/** 项目成员角色 */
export const UserRole = makeEnum({
	guest: [1, enum_project__user_role_guest],
	developer: [2, enum_project__user_role_developer],
	manager: [3, enum_project__user_role_manager],
	owner: [4, enum_project__user_role_owner],
} as const);

/** 获取项目永久(const)链接 */
export const getClinkByProjectId = (projectId: ProjId) => `${langPrefix()}/project/${projectId}`;
/** 获取项目短(short)链接 */
export const getSlinkByProjectName = (projectName: string) =>
	`/p/${encodeURIComponent(projectName)}`;
