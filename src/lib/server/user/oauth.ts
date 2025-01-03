import type { OAuthProviderTypeName, OAuthProviderTypeNames } from '$lib/common/oauth';

type ServerCfg = {
	client_id: string;
	redirect_uri: string;
};
type ServerSecretCfg = {
	client_secret: string;
};
type PreUserCfg = {
	state: string;
};
type AuthedUserCfg = {
	code: string;
};
type LoginedUserCfg = {
	access_token: string;
	token_type: string;
	scope: string;
};

export type OAuthReqDef<Callback extends string, Param extends Record<string, any>> = {
	origin: string;
	path: string;

	callback: Record<Callback, string | ((resp: any) => string)>;
} & (
	| {
			method: 'GET';
			query?: Record<string, string> | ((param: Param) => Record<string, string>);
			headers?: Record<string, string> | ((param: Param) => Record<string, string>);
	  }
	| {
			method: 'POST';
			body?:
				| string
				| number
				| Record<string, any>
				| boolean
				| null
				| undefined
				| ((param: Param) => any);
			headers?: Record<string, string> | ((param: Param) => Record<string, string>);
	  }
);
export type OAuthProviderType = {
	/** OAuth提供商的名称 */
	name: string;

	authorize: OAuthReqDef<'code' | 'state', ServerCfg & PreUserCfg>;
	access_token: OAuthReqDef<
		'access_token' | 'token_type' | 'scope',
		ServerCfg & ServerSecretCfg & PreUserCfg & AuthedUserCfg
	>;
	get_user: OAuthReqDef<
		'id' | 'name' | 'info',
		ServerCfg & ServerSecretCfg & PreUserCfg & AuthedUserCfg & LoginedUserCfg
	>;
};

const Github: OAuthProviderType = {
	name: 'GitHub',
	authorize: {
		origin: 'https://github.com',
		path: '/login/oauth/authorize',
		method: 'GET',
		query: ({ client_id, redirect_uri, state }) => ({
			client_id,
			redirect_uri,
			scope: 'user:email',
			state,
		}),
		callback: {
			code: 'code',
			state: 'state',
		},
	},
	access_token: {
		origin: 'https://github.com',
		path: '/login/oauth/access_token',
		method: 'POST',
		body: ({ client_id, client_secret, code, redirect_uri, state }) => ({
			client_id,
			client_secret,
			code,
			redirect_uri,
			state,
		}),
		callback: {
			access_token: 'access_token',
			token_type: 'token_type',
			scope: 'scope',
		},
	},
	get_user: {
		origin: 'https://api.github.com',
		path: '/user',
		method: 'GET',
		headers: ({ access_token }) => ({
			Authorization: `token ${access_token}`,
		}),
		callback: {
			id: 'id',
			name: 'name',
			info: (r) => JSON.stringify(r),
		},
	},
};

/** OAuth提供商类型列表 */
export const OAuthProviderTypes: Readonly<Record<OAuthProviderTypeName, OAuthProviderType>> = {
	GitHub: Github,
};

/**
 * 构建OAuth请求URL, 仅支持纯GET请求, 且不支持headers
 *
 * 用于返回给前端跳转
 * @param define OAuth请求定义
 * @param param oauth请求参数
 * @returns 请求URL
 */
export function buildURL<Param extends Record<string, any>>(
	define: OAuthReqDef<any, Param>,
	param: Param,
): string {
	if (define.method !== 'GET') throw new Error('Only GET method is supported');
	if (define.headers) throw new Error('Headers is not supported in buildURL');

	const query = typeof define.query === 'function' ? define.query(param) : define.query;
	const url = _url(define.origin, define.path, query);

	return url.toString();
}

export async function parseResp<Callback extends string>(
	define: OAuthReqDef<Callback, any>,
	data: any,
): Promise<Record<Callback, string>> {
	const result: Record<Callback, string> = {} as any;
	for (const name in define.callback) {
		const cb = define.callback[name];
		if (typeof cb === 'function') result[name] = cb(data);
		else if (name in data) result[name] = data[cb];
		else throw new Error(`Failed to get callback value for '${name}': ${JSON.stringify(data)}`);
	}
	return result;
}
/**
 * 执行OAuth请求
 * @param define OAuth请求定义
 * @param param oauth请求参数
 * @param fetchParam fetch请求选项(可选)
 * @returns 请求结果
 */
export async function execute<Callback extends string, Param extends Record<string, any>>(
	define: OAuthReqDef<Callback, Param>,
	param: Param,
	fetchParam?: RequestInit,
): Promise<Record<Callback, string>> {
	let resp: Response;
	if (define.method === 'GET') {
		const query = typeof define.query === 'function' ? define.query(param) : define.query;
		let headers = typeof define.headers === 'function' ? define.headers(param) : define.headers;
		if (!headers) headers = {};
		headers['Accept'] = headers['Accept'] || 'application/json';
		const url = _url(define.origin, define.path, query);
		resp = await fetch(url, { headers, method: 'GET', ...fetchParam });
	} else {
		const body = typeof define.body === 'function' ? define.body(param) : define.body;
		let headers = typeof define.headers === 'function' ? define.headers(param) : define.headers;
		if (!headers) headers = {};
		headers['Content-Type'] = headers['Content-Type'] || 'application/json';
		headers['Accept'] = headers['Accept'] || 'application/json';
		const url = _url(define.origin, define.path);
		resp = await fetch(url, { headers, method: 'POST', body: JSON.stringify(body), ...fetchParam });
	}

	if (!resp.ok) throw new Error(`Failed to fetch ${resp.url}: ${resp.status} ${resp.statusText}`);
	let data;
	try {
		data = await resp.text();
		data = JSON.parse(data);
	} catch (e) {
		throw new Error(`Failed to parse response data: ${data}: ${e}`);
	}
	return parseResp(define, data);
}

/** 构造URL */
function _url(origin: string, path: string, query?: Record<string, string>): URL {
	const _url = new URL(origin + path);
	if (query) _url.search = new URLSearchParams(query).toString();
	return _url;
}
