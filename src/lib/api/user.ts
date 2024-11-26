import type { ReqData as OauthProviderCreateReq } from '../../routes/api/user/oauth/providers/create/+server';
import type { ListResp as OauthProviderListResp } from '../../routes/api/user/oauth/providers/list/+server';
import { apiReq } from './common';

/** 获取oauth提供商类型 */
export const getOauthProviderTypes = () =>
	apiReq<string[]>('/api/user/oauth/providers/types', 'GET', []);

/** 获取oauth提供商列表 */
export const getOauthProviderList = () =>
	apiReq<OauthProviderListResp>('/api/user/oauth/providers/list', 'GET', []);

/** 创建oauth提供商 */
export const createOauthProvider = (data: OauthProviderCreateReq) =>
	apiReq<string | null>('/api/user/oauth/providers/create', 'POST', null, data);
