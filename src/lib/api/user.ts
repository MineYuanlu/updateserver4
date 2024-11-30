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
	apiReq<boolean>('/api/user/oauth/providers/create', 'POST', false, data);

/**
 * 登陆oauth提供商
 * @return 跳转链接
 */
export const loginOauth = (provider: string) =>
	apiReq<string>(`/api/user/oauth/login/${provider}`, 'POST', '');

/**
 * oauth提供商回调
 * @return true: 登陆成功, obj: 新用户, 注册token, null: 登陆失败
 */
export const loginOauthCallback = (provider: string, params: Record<string, string>) =>
	apiReq<true | { jwt: string; name: string } | null>(
		`/api/user/oauth/login/${provider}/callback`,
		'POST',
		null,
		params,
		60 * 1000,
	);

/**
 * 注册oauth用户
 * @param username 用户名
 * @param jwt oauth token
 */
export const registerOauth = (username: string, jwt: string) =>
	apiReq<boolean>(`/api/user/oauth/register`, 'POST', false, { username, jwt }, 60 * 1000);

/**
 * 登陆用户
 * @param username 用户名
 * @param password 密码
 */
export const loginUser = (username: string, password: string) =>
	apiReq<boolean>('/api/user/login', 'POST', false, { username, password });

/**
 * 注册用户
 * @param username 用户名
 * @param password 密码
 */
export const registerUser = (username: string, password: string) =>
	apiReq<boolean>('/api/user/register', 'POST', false, { username, password });

/** 登出用户 */
export const logoutUser = () => apiReq<null>('/api/user/logout', 'POST', null);
