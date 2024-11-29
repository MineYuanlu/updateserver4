import type { ReqData as OauthProviderCreateReq } from '../../routes/api/user/oauth/providers/create/+server';
import type { ListResp as OauthProviderListResp } from '../../routes/api/user/oauth/providers/list/+server';
import { apiReq } from './common';

/** 示例api，请求一个不存在的接口 */
export const demoMakeErrorResp = () => apiReq<null>('/api/not-exist111.yuanlu', 'GET', null);
