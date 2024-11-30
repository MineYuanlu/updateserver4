export const jwtTypes = {
	/**用户信息 */
	U: 'User',
	/**机器人信息 */
	R: 'Robot',
	/**OAuth注册信息: 在用户Oauth登录后, 在本平台注册时的临时token */
	OAUTH_R: 'OAuthR',
};
export type JwtTypes = keyof typeof jwtTypes;

export type JwtInfo<Data extends Record<string, unknown>, Type extends JwtTypes> = {
	typ: Type;
} & Data;
