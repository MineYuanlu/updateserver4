export const COOKIES = {
	Session: 'Session',
	Robot: 'Robot'
};
export const COOKIE_PREFIX = 'US4-';

for (const key in COOKIES) {
	COOKIES[key as keyof typeof COOKIES] = `${COOKIE_PREFIX}${key}`;
}
