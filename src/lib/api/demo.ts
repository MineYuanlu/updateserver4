import { apiReq } from './common';

/** 示例api，请求一个不存在的接口 */
export const demoMakeErrorResp = () => apiReq<null>('/api/not-exist111.yuanlu', 'GET', null);
