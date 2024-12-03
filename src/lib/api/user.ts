import type { ReqData as OauthProviderCreateReq } from '../../routes/api/user/oauth/providers/create/+server';
import type { ListResp as OauthProviderListResp } from '../../routes/api/user/oauth/providers/list/+server';
import { apiReq2 } from './common';

/** 获取oauth提供商列表 */
export const getOauthProviderList = () =>
	apiReq2<OauthProviderListResp>('/api/user/oauth/providers/list', []);

/** 创建oauth提供商 */
export const createOauthProvider = (data: OauthProviderCreateReq) =>
	apiReq2<boolean>('/api/user/oauth/providers/create', false, { method: 'POST', data });

/**
 * 登陆oauth提供商
 * @return 跳转链接
 */
export const loginOauth = (provider: string) =>
	apiReq2<string>(`/api/user/oauth/login/${provider}`, '', { method: 'POST' });

/**
 * oauth提供商回调
 * @return true: 登陆成功, obj: 新用户, 注册token, null: 登陆失败
 */
export const loginOauthCallback = (provider: string, params: Record<string, string>) =>
	apiReq2<true | { jwt: string; name: string } | null>(
		`/api/user/oauth/login/${provider}/callback`,
		null,
		{
			method: 'POST',
			data: params,
			showErr: 60 * 1000,
		},
	);

/**
 * 注册oauth用户
 * @param username 用户名
 * @param jwt oauth token
 */
export const registerOauth = (username: string, jwt: string) =>
	apiReq2<boolean>(`/api/user/oauth/register`, false, {
		method: 'POST',
		data: { username, jwt },
		showErr: 60 * 1000,
	});

/**
 * 登陆用户
 * @param username 用户名
 * @param password 密码
 */
export const loginUser = (username: string, password: string) =>
	apiReq2<boolean>('/api/user/login', false, { method: 'POST', data: { username, password } });

/**
 * 注册用户
 * @param username 用户名
 * @param password 密码
 */
export const registerUser = (username: string, password: string) =>
	apiReq2<boolean>('/api/user/register', false, { method: 'POST', data: { username, password } });

/** 登出用户 */
export const logoutUser = () => apiReq2<null>('/api/user/logout', null, { method: 'POST' });
