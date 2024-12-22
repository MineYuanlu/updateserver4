import {
	check_user_name__not_string,
	check_user_name__has_special,
	check_user_name__is_empty,
	check_user_name__too_long,
	check_user_name__not_start_with_letter,
	check_user_name__bad_char,
	check_user_password__not_string,
	check_user_password__too_short,
	check_user_password__too_long,
	enum_user__web_role_user,
	enum_user__web_role_admin,
} from '$lib/paraglide/messages';
import type { User } from '$lib/server/db/schema';
import { z } from 'zod';
import { makeEnum } from './enum';
import { zUS4ID, type US4ID } from './id';
import type { JwtInfo } from './jwt';

export const userNameReservedWords = ['login', 'logout', 'register', 'oauth'] as const;

const _unrw = new Set<string>(userNameReservedWords);

const userNameRegex = /^[A-Za-z][A-Za-z0-9_.-]{0,19}$/;

/**
 * 项目名称合法性检查
 *
 * `^[A-Za-z][A-Za-z0-9_.-]{0,19}$`
 * @param name 项目名称
 * @returns 是否合法
 */
export function validateUserName(name: unknown): name is string {
	if (typeof name !== 'string') return false;
	if (_unrw.has(name)) return false;
	return userNameRegex.test(name);
}
/**
 * 用户名称合法性检查失败原因
 * @param name 用户名称
 * @returns 失败原因
 */
export function whyInvalidUserName(name: string): string | undefined {
	if (typeof name !== 'string') return check_user_name__not_string();
	if (_unrw.has(name)) return check_user_name__has_special();
	if (name.length === 0) return check_user_name__is_empty();
	if (name.length > 20) return check_user_name__too_long();
	if (!/^[A-Za-z]$/.test(name[0])) return check_user_name__not_start_with_letter();
	if (!userNameRegex.test(name)) return check_user_name__bad_char();
	return undefined;
}

export const zUserName = z.custom<string>(validateUserName, (t) => ({
	message: whyInvalidUserName(t)
}));

/**
 * 密码合法性检查
 *
 * 密码长度6-255个字符
 * @param password 密码
 * @returns 是否合法
 */
export function validatePassword(password: unknown): password is string {
	if (typeof password !== 'string') return false;
	if (password.length < 6 || password.length > 255) return false;
	return true;
}
/**
 * 密码合法性检查失败原因
 * @param password 密码
 * @returns 失败原因
 */
export function whyInvalidPassword(password: string): string | undefined {
	if (typeof password !== 'string') return check_user_password__not_string();
	if (password.length < 6) return check_user_password__too_short();
	if (password.length > 255) return check_user_password__too_long();
	return undefined;
}

export const zPassword = z.custom<string>(validatePassword, (t) => ({
	message: whyInvalidPassword(t)
}));

/** 用户ID */
export type UserId = US4ID<'u'>;
/** 用户ID zod */
export const zUserId = zUS4ID('u');
/**
 * 网站用户角色, 仅代表整个网站的角色, 而不是某个项目的角色
 *
 * 即, 大部分人都应该是'user', 只有网站管理员才应该是'admin'
 */
export const WebRole = makeEnum({
	user: [0, enum_user__web_role_user],
	admin: [1, enum_user__web_role_admin],
} as const);
/** 默认网站用户角色: 'user' */
export const defaultWebRole = WebRole.user.val;

/** 用户信息 */
export type UserInfo = Pick<User, 'id' | 'name' | 'role'>;
export type UserSession = JwtInfo<UserInfo, 'U'>;
