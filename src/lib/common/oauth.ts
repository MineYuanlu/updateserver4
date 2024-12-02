import { siGithub, type SimpleIcon } from 'simple-icons';
import type { JwtInfo } from './jwt';

export type OAuthRegisterInfo = {
	/** 第三方平台ID */
	id: string;
	/** 第三方平台名称 */
	p: string;
};
export type UserSession = JwtInfo<OAuthRegisterInfo, 'OAUTH_R'>;

export const OAuthProviderTypeNames = ['GitHub'] as const;
export type OAuthProviderTypeName = (typeof OAuthProviderTypeNames)[number];

const icons: Readonly<Record<OAuthProviderTypeName, SimpleIcon>> = {
	GitHub: siGithub,
} as const;

export function getIcon(provider: string): SimpleIcon | undefined {
	return icons[provider as OAuthProviderTypeName];
}
