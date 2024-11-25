import { apiReq } from './common';

/** 获取oauth提供商类型 */
export function getOauthProviderTypes() {
	return apiReq<string[]>('/api/user/oauth/providers/types', 'GET', []);
}
