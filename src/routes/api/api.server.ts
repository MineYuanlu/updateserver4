import { z } from 'zod';
import type * as Kit from '@sveltejs/kit';
import Cookie from 'cookie';
import { apiResp, failure } from './common.server';
import errorMap from '$lib/zod/error_map';
import type { OpenAPIV3 } from 'openapi-types';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * 参数定义:
 * 1. `code_param_name - [type, http_param_name]`
 * 2. `name - type`
 */
type Params = Record<string, z.ZodType | readonly [z.ZodType, string]>;
type AddParam<T extends Record<string, any>, f extends keyof T & string, A> = T & { [P in f]: A };
/** 成功响应结构定义 */
type Success<D extends any = any, H extends Record<string, string> | undefined = any> = {
	status: number;
	data: D;
	header?: H;
	code?: number;
};
type CommonSuccessResp<D, C extends number = 0> = {
	data: D;
	code: C;
	message?: string;
};
/** 成功响应函数 */
type SuccessFunc<R extends Success, X> =
	R['data'] extends CommonSuccessResp<any, any>
		? R['header'] extends undefined
			? (data: R['data']['data']) => X
			: (data: R['data']['data'], header: R['header']) => X
		: never;

type ParamsKey = 'query' | 'path' | 'header' | 'cookie' | 'body';

/** 解析后的请求参数 */
type ParsedData<T extends Record<string, any>> = {
	[K in ParamsKey]: T[K] extends Params
		? {
				[P in keyof T[K]]: T[K][P] extends readonly [z.ZodType, string]
					? z.output<T[K][P][0]>
					: z.output<T[K][P]>;
			}
		: never;
};
type UnionToIntersection<U> = (U extends any ? (x: U) => any : never) extends (x: infer I) => any
	? I
	: never;
type PlainParsedData<T extends Record<string, any>> = UnionToIntersection<
	Exclude<ParsedData<T>[keyof ParsedData<T>], never>
>;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * API描述信息, 描述了一个API的请求参数, 响应参数, 成功响应, 标签, 摘要, 描述, 废弃等信息, 可以做:
 * 1. 通过`handler`方法获取到规范化的API处理器
 * 2. 通过`$T`方法获取到API描述信息
 * 3. 由插件生成客户端接口代码
 * 4. 由插件转换到`OpenAPI`规范的json文件
 */
class API<
	T extends {
		query?: Params;
		path?: Params;
		header?: Params;
		cookie?: Params;
		body?: Params;
		success?: Success;
		tag?: string[];
		summary?: string;
		description?: string;
		deprecated?: boolean;
		/**
		 * 是否在客户端和服务端都以扁平化参数形式传递参数, 默认为false.
		 *
		 * 在`query`/`path`/`header`/`cookie`/`body`中, 如果key出现冲突, 则需要设为false, 否则简单参数可以设为true
		 */
		flatArgs?: boolean;
	} = {},
> {
	private constructor(private _data: T) {}
	/** 添加query查询参数 */
	public query<Q extends Params>(q: Q): ReturnType<API<AddParam<T, 'query', Q>>['$flatten']> {
		return new API<AddParam<T, 'query', Q>>({
			...this._data,
			query: { ...this._data.query, ...q },
		});
	}
	/** 添加path路径参数 */
	public path<P extends Params>(p: P): ReturnType<API<AddParam<T, 'path', P>>['$flatten']> {
		return new API<AddParam<T, 'path', P>>({
			...this._data,
			path: { ...this._data.path, ...p },
		});
	}
	/** 添加header头参数 */
	public header<H extends Params>(h: H): ReturnType<API<AddParam<T, 'header', H>>['$flatten']> {
		return new API<AddParam<T, 'header', H>>({
			...this._data,
			header: { ...this._data.header, ...h },
		});
	}
	/** 添加cookie参数 */
	public cookie<C extends Params>(c: C): ReturnType<API<AddParam<T, 'cookie', C>>['$flatten']> {
		return new API<AddParam<T, 'cookie', C>>({
			...this._data,
			cookie: { ...this._data.cookie, ...c },
		});
	}
	/** 添加body参数 */
	public body<B extends Params>(b: B): ReturnType<API<AddParam<T, 'body', B>>['$flatten']> {
		return new API<AddParam<T, 'body', B>>({
			...this._data,
			body: { ...this._data.body, ...b },
		});
	}
	/** 设置成功响应 */
	public success<D extends any, H extends Record<string, string> | undefined = undefined>(
		d: z.ZodSchema,
		h?: H,
		c = 0,
		s = 200,
	): ReturnType<API<T & { success: Success<CommonSuccessResp<D>, H> }>['$flatten']> {
		if ('success' in this._data) throw new Error('success already set');
		return new API<T & { success: Success<CommonSuccessResp<D>, H> }>({
			...this._data,
			success: {
				header: h,
				status: s,
				code: c,
				data: z.object({
					data: d,
					code: z.number().default(c),
				}),
			},
		});
	}
	/** 添加标签 */
	public tag(t: string | string[]) {
		return new API<T>({
			...this._data,
			tag: [...(this._data.tag ?? []), ...(Array.isArray(t) ? t : [t])],
		});
	}
	/** 添加摘要 */
	public summary<S extends string>(s: S): ReturnType<API<AddParam<T, 'summary', S>>['$flatten']> {
		return new API<T & { summary: S }>({
			...this._data,
			summary: s,
		});
	}
	/** 添加描述 */
	public description<D extends string>(
		d: D,
	): ReturnType<API<AddParam<T, 'description', D>>['$flatten']> {
		return new API<T & { description: D }>({
			...this._data,
			description: d,
		});
	}
	/** 标记为废弃 */
	public deprecated<B extends boolean>(
		b: B,
	): ReturnType<API<AddParam<T, 'deprecated', B>>['$flatten']> {
		return new API<T & { deprecated: B }>({
			...this._data,
			deprecated: b,
		});
	}

	/** 设置是否在客户端和服务端都以扁平化参数形式传递参数 */
	public flatArgs<B extends boolean>(
		b: B,
	): ReturnType<API<AddParam<T, 'flatArgs', B>>['$flatten']> {
		return new API<T & { flatArgs: B }>({
			...this._data,
			flatArgs: b,
		});
	}

	public handler<ReqHandler extends Kit.RequestHandler>(
		handler: (
			event: Parameters<ReqHandler>[0],
			data: T['flatArgs'] extends true ? PlainParsedData<T> : ParsedData<T>,
			success: T['success'] extends Success ? SuccessFunc<T['success'], Response> : never,
		) => ReturnType<ReqHandler>,
	): ReqHandler {
		const resp_code = this._data.success?.code!;
		const resp_status = this._data.success?.status!;
		const flat_args = this._data.flatArgs ?? false;
		const set_value: (
			d: any,
			p: ParamsKey,
			g: (n: string) => string | undefined,
		) => Promise<void> = async (data, pk, getter) => {
			const params = this._data[pk];
			if (!params) return;
			for (const name in params) {
				const param = params[name];
				const type = Array.isArray(param) ? param[0] : param;
				const getter_name = Array.isArray(param) ? param[1] : name;
				const raw = getter(getter_name);
				const value = await type.safeParseAsync(raw, { errorMap });
				if (value.success) data[name] = value.data;
				else {
					failure(value.error.format()._errors.join('\n'));
				}
			}
		};
		if (flat_args)
			return (async (req: Kit.RequestEvent) => {
				const data: any = {};
				await set_value(data, 'query', (n) => req.url.searchParams.get(n) ?? undefined);
				await set_value(data, 'path', (n) => req.params[n] ?? undefined);
				await set_value(data, 'header', (n) => req.request.headers.get(n) ?? undefined);
				if (this._data.cookie) {
					const raw = req.request.headers.get('cookie');
					const cookies = Cookie.parse(raw ?? '');
					await set_value(data, 'cookie', (n) => cookies[n] ?? undefined);
				}
				if (this._data.body) {
					const body = await req.request.json();
					await set_value(data, 'body', (n) => body[n] ?? undefined);
				}
				return await handler(req, data, ((d: any, h?: any) => {
					return apiResp(d, resp_code, undefined, resp_status, h);
					// throw new Error('not implemented');
				}) as any);
			}) as any;
		else
			return (async (req: Kit.RequestEvent) => {
				const data: any = {};

				await set_value(
					(data.query = {}),
					'query',
					(n) => req.url.searchParams.get(n) ?? undefined,
				);
				await set_value((data.path = {}), 'path', (n) => req.params[n] ?? undefined);
				await set_value(
					(data.header = {}),
					'header',
					(n) => req.request.headers.get(n) ?? undefined,
				);
				if (this._data.cookie) {
					const raw = req.request.headers.get('cookie');
					const cookies = Cookie.parse(raw ?? '');
					await set_value((data.cookie = {}), 'cookie', (n) => cookies[n] ?? undefined);
				}
				if (this._data.body) {
					const body = await req.request.json();
					await set_value((data.body = {}), 'body', (n) => body[n] ?? undefined);
				}
				return await handler(req, data, ((d: any, h?: any) => {
					return apiResp(d, resp_code, undefined, resp_status, h);
				}) as any);
			}) as any;
	}

	public openAPI(): OpenAPIV3.OperationObject {
		const toParam = (
			params: Params | undefined,
			pos: 'query' | 'path' | 'header' | 'cookie',
		): OpenAPIV3.ParameterObject[] => {
			if (!params) return [];
			return Object.entries(params).map(([name, param]) => {
				const type = Array.isArray(param) ? param[0] : param;
				name = Array.isArray(param) ? param[1] : name;
				return {
					name,
					in: pos,
					description: type.description,
					required: type.isOptional() ? false : true,
					schema: zodToJsonSchema(type) as any,
				};
			});
		};
		return {
			tags: this._data.tag,
			summary: this._data.summary,
			description: this._data.description,
			deprecated: this._data.deprecated,
			parameters: [
				...toParam(this._data.query, 'query'),
				...toParam(this._data.path, 'path'),
				...toParam(this._data.header, 'header'),
				...toParam(this._data.cookie, 'cookie'),
			],
			requestBody: this._data.body
				? {
						required: true,
						content: {
							'application/json': {
								schema: zodToJsonSchema(
									z.object(
										Object.fromEntries(
											Object.entries(this._data.body).map(([name, param]) => [
												name,
												Array.isArray(param) ? param[0] : param,
											]),
										),
									),
								) as any,
							},
						},
					}
				: undefined,
			responses: (() => {
				const resps: OpenAPIV3.ResponsesObject = {};
				if (this._data.success) {
					// resp[this._data.success.status] =
					const resp: OpenAPIV3.ResponseObject = {
						description: (this._data.success.data as z.ZodObject<any>).description ?? '',
						content: {
							'application/json': {
								schema: zodToJsonSchema(this._data.success.data) as any,
							},
						},
					};
					if (this._data.success.header) {
						resp.headers = {};
						for (const name in this._data.success.header) {
							resp.headers[name] = {} satisfies OpenAPIV3.HeaderObject;
						}
					}
					resps[this._data.success.status] = resp;
				}
				resps[400] = {
					description: '',
					content: {
						'application/json': {
							schema: zodToJsonSchema(
								z.object({
									code: z.number().int().positive().or(z.number().int().negative()).default(1),
									message: z.string(),
								}),
							) as any,
						},
					},
				};
				return resps;
			})(),
		};
	}

	/** 创建一个API实例, 包含API的描述 */
	public static create() {
		return new API({});
	}
	public $T(): T {
		throw new Error('type only');
	}
	public $query(): 'query' extends keyof T ? T['query'] : never {
		throw new Error('type only');
	}
	public $path(): 'path' extends keyof T ? T['path'] : never {
		throw new Error('type only');
	}
	public $header(): 'header' extends keyof T ? T['header'] : never {
		throw new Error('type only');
	}
	public $cookie(): 'cookie' extends keyof T ? T['cookie'] : never {
		throw new Error('type only');
	}
	public $body(): 'body' extends keyof T ? T['body'] : never {
		throw new Error('type only');
	}
	public $tag(): 'tag' extends keyof T ? T['tag'] : never {
		throw new Error('type only');
	}
	public $flatArgs(): 'flatArgs' extends keyof T ? T['flatArgs'] : never {
		throw new Error('type only');
	}
	public $success(): 'success' extends keyof T
		? T['success'] extends Success
			? T['success']['data']
			: never
		: never {
		throw new Error('type only');
	}
	public $flatten(): API<{ [K in keyof T]: T[K] }> {
		throw new Error('type only');
	}
}

export type ApiType<T extends API<any>, field extends keyof API & `$${string}`> = ReturnType<
	T[field]
>;

export const createAPI = API.create;

// API.create()
// 	.query({
// 		offset: z.number().int().nonnegative(),
// 	})
// 	.query({
// 		limit: z.number().int().min(1).max(1000),
// 	})
// 	.success(z.array(z.string()), undefined, 1, 200)
// 	.$success();
