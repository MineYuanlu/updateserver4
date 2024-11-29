import type { JwtInfo } from './jwt';

export type OAuthRegisterInfo = {
	/** 第三方平台ID */
	id: string;
	/** 第三方平台名称 */
	p: string;
};
export type UserSession = JwtInfo<OAuthRegisterInfo, 'OAUTH_R'>;
