export const COOKIE_PREFIX = 'US4-';
export const COOKIES = (() => {
	const cookies = {
		Session: 'Session', // 用户
		Robot: 'Robot', // 机器人
		Theme: 'Theme', // 主题
		OAuthState: 'OAuthState', // OAuth 请求状态
	} as const;
	for (const key in cookies) {
		(cookies as any)[key] = `${COOKIE_PREFIX}${key}`;
	}
	return cookies as unknown as { [key in keyof typeof cookies]: `${typeof COOKIE_PREFIX}${key}` };
})();

export type COOKIE_VALUES = (typeof COOKIES)[keyof typeof COOKIES];
