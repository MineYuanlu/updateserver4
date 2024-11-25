import type { US4ID } from './id';

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
export function validatePassword(password: unknown): password is string {
	if (typeof password !== 'string') return false;
	if (password.length < 6 || password.length > 255) return false;
	return true;
}

export const USER_ROLES = {
	0: 'user',
	1: 'admin'
} as const;
export type UserRole = keyof typeof USER_ROLES;
export type UserId = US4ID<'u'>;

export type UserInfo = {
	id: UserId;
	name: string;
	role: UserRole;
};
export type UserSession = {
	typ: 'USER';
} & UserInfo;
