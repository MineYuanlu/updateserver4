import { z } from 'zod';
import type * as Kit from '@sveltejs/kit';
import Cookie from 'cookie';
import { apiResp, failure } from './common.server';
import errorMap from '$lib/zod/error_map';
import type {
	OperationObject,
	ParameterObject,
	ResponsesObject,
	HeaderObject,
	ResponseObject,
} from 'openapi3-ts/oas30';
// import { zodToJsonSchema } from 'zod-to-json-schema';
import { generateSchema } from '@anatine/zod-openapi';
import type { COOKIE_VALUES } from '$lib/common/cookies';
import { zod_failed_to_parse_field } from '$lib/paraglide/messages';

/**
 * 参数定义:
 * 1. `code_param_name - [type, http_param_name]`
 * 2. `name - type`
 */
type Params = Record<string, z.ZodType | readonly [z.ZodType, string]>;
type AddParam<T extends Record<string, any>, f extends keyof T & string, A> = T & { [P in f]: A };
type Flat<T extends { $flatten: () => any }> = ReturnType<T['$flatten']>;
type APIResp<T, D extends RespDef<any>> = Flat<
	API<
		Omit<T, 'resps'> & {
			resps: [
				...('resps' extends keyof T ? (T['resps'] extends RespDef<any>[] ? T['resps'] : []) : []),
				D,
			];
		}
	>
>;
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
type ParsedParams<T extends Params> = {
	[P in keyof T]: T[P] extends readonly [z.ZodType, string]
		? z.output<T[P][0]>
		: T[P] extends z.ZodType
			? z.output<T[P]>
			: never;
};
/** 解析后的请求参数 */
type ParsedData<T extends Record<string, any>> = {
	[K in ParamsKey]: T[K] extends Params ? ParsedParams<T[K]> : never;
};
type UnionToIntersection<U> = (U extends any ? (x: U) => any : never) extends (x: infer I) => any
	? I
	: never;
type PlainParsedData<T extends Record<string, any>> = UnionToIntersection<
	Exclude<ParsedData<T>[keyof ParsedData<T>], never>
>;

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
		resps?: RespDef<any>[];
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
	/** 添加一个响应类型 */
	public resp<D extends RespDef<any>>(data: D): APIResp<T, D> {
		return new API({
			...this._data,
			resps: [...(this._data.resps ?? []), data],
		}) as any;
	}
	/** 添加一个标准的成功响应, code默认为0 */
	public resp1<D extends any>(
		data: z.ZodType<D>,
	): APIResp<
		T,
		RespDef<{
			mime: 'application/json';
			status: 200;
			body: z.ZodType<{
				data: D;
				code: 0;
			}>;
			commonResp: true;
		}>
	>;
	/** 添加一个标准的成功响应 */
	public resp1<D extends any, C extends number>(
		data: z.ZodType<D>,
		code: C,
	): APIResp<
		T,
		RespDef<{
			mime: 'application/json';
			status: 200;
			body: z.ZodType<{
				data: D;
				code: C;
			}>;
			commonResp: true;
		}>
	>;
	/** 添加一个标准的成功响应 */
	public resp1<D extends any>(data: z.ZodType<D>, code: number = 0) {
		return new API({
			...this._data,
			resps: [...(this._data.resps ?? []), RespDef.create().success<D, number>(data, code)],
		}) as any;
	}
	/** 添加一个标准的失败响应, code默认为1 */
	public resp2<D extends string>(
		message: z.ZodType<D>,
	): APIResp<
		T,
		RespDef<{
			mime: 'application/json';
			status: 400;
			body: z.ZodType<{
				message: D;
				code: 1;
			}>;
			commonResp: true;
		}>
	>;
	/** 添加一个标准的失败响应 */
	public resp2<D extends string, C extends number>(
		message: z.ZodType<D>,
		code: C,
	): APIResp<
		T,
		RespDef<{
			mime: 'application/json';
			status: 400;
			body: z.ZodType<{
				message: D;
				code: C;
			}>;
			commonResp: true;
		}>
	>;
	/** 添加一个标准的失败响应 */
	public resp2<D extends string>(message: z.ZodType<D>, code: number = 1) {
		return new API({
			...this._data,
			resps: [
				...(this._data.resps ?? []),
				RespDef.create().status(400).failure<D, number>(message, code),
			],
		}) as any;
	}
	/** 设置成功响应 */
	public success<D extends any, H extends Record<string, string> | undefined = undefined>(
		d: z.ZodSchema<D>,
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
		if (flat_args)
			return (async (req: Kit.RequestEvent) => {
				const data: any = {};
				await this.set_value(data, 'query', (n) => req.url.searchParams.get(n) ?? undefined);
				await this.set_value(data, 'path', (n) => req.params[n] ?? undefined);
				await this.set_value(data, 'header', (n) => req.request.headers.get(n) ?? undefined);
				if (this._data.cookie) {
					const raw = req.request.headers.get('cookie');
					const cookies = Cookie.parse(raw ?? '');
					await this.set_value(data, 'cookie', (n) => cookies[n] ?? undefined);
				}
				if (this._data.body) {
					const body = await req.request.json();
					await this.set_value(data, 'body', (n) => body[n] ?? undefined);
				}
				return await handler(req, data, ((d: any, h?: any) => {
					return apiResp(d, resp_code, undefined, resp_status, h);
					// throw new Error('not implemented');
				}) as any);
			}) as any;
		else
			return (async (req: Kit.RequestEvent) => {
				const data: any = {};

				await this.set_value(
					(data.query = {}),
					'query',
					(n) => req.url.searchParams.get(n) ?? undefined,
				);
				await this.set_value((data.path = {}), 'path', (n) => req.params[n] ?? undefined);
				await this.set_value(
					(data.header = {}),
					'header',
					(n) => req.request.headers.get(n) ?? undefined,
				);
				if (this._data.cookie) {
					const raw = req.request.headers.get('cookie');
					const cookies = Cookie.parse(raw ?? '');
					await this.set_value((data.cookie = {}), 'cookie', (n) => cookies[n] ?? undefined);
				}
				if (this._data.body) {
					const body = await req.request.json();
					await this.set_value((data.body = {}), 'body', (n) => body[n] ?? undefined);
				}
				return await handler(req, data, ((d: any, h?: any) => {
					return apiResp(d, resp_code, undefined, resp_status, h);
				}) as any);
			}) as any;
	}

	public openAPI(): OperationObject {
		const toParam = (
			params: Params | undefined,
			pos: 'query' | 'path' | 'header' | 'cookie',
		): ParameterObject[] => {
			if (!params) return [];
			return Object.entries(params).map(([name, param]) => {
				const type: z.ZodType = Array.isArray(param) ? param[0] : param;
				name = Array.isArray(param) ? param[1] : name;
				if (!(type instanceof z.ZodType)) {
					console.warn(`Invalid type for ${name} in ${pos}`, type);
				}
				return {
					name,
					in: pos,
					description: type.description,
					required: type.isOptional() ? false : true,
					schema: generateSchema(type) as any,
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
								schema: generateSchema(
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
				const resps: ResponsesObject = {};
				if (this._data.success) {
					// resp[this._data.success.status] =
					const resp: ResponseObject = {
						description: (this._data.success.data as z.ZodObject<any>).description ?? '',
						content: {
							'application/json': {
								schema: generateSchema(this._data.success.data) as any,
							},
						},
					};
					if (this._data.success.header) {
						resp.headers = {};
						for (const name in this._data.success.header) {
							resp.headers[name] = {} satisfies HeaderObject;
						}
					}
					resps[this._data.success.status] = resp;
				}
				resps[400] = {
					description: '',
					content: {
						'application/json': {
							schema: generateSchema(
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

	/**
	 * 从请求中获取参数
	 * @param data 存储参数的对象
	 * @param pk 参数类型
	 * @param getter 获取值的函数
	 * @param onFail 特定解析失败时的回调函数
	 */
	private async set_value(
		data: any,
		pk: ParamsKey,
		getter: (n: string) => string | undefined,
		onFail: (name: string, err: z.ZodError) => void = (field, err) => {
			failure(
				zod_failed_to_parse_field({
					field,
					errors: err.format()._errors.join('\n'),
				}),
			);
		},
	): Promise<void> {
		const params = this._data[pk];
		if (!params) return;
		for (const name in params) {
			const param = params[name];
			const type: z.ZodType = Array.isArray(param) ? param[0] : param;
			const getter_name = Array.isArray(param) ? param[1] : name;
			const raw = getter(getter_name);
			const value = await type.safeParseAsync(raw, { errorMap });
			if (value.success) data[name] = value.data;
			else onFail(name, value.error);
		}
	}
	public async parseQuery(
		raw: URLSearchParams,
	): Promise<
		'query' extends keyof T ? (T['query'] extends Params ? ParsedParams<T['query']> : {}) : {}
	> {
		const parsed: any = {};
		await this.set_value(parsed, 'query', (n) => raw.get(n) ?? undefined);
		return parsed;
	}
}

export type ApiType<T extends API<any>, field extends keyof API & `$${string}`> = ReturnType<
	T[field]
>;

export const createAPI = API.create;

/**
 * 定义API的响应
 */
class RespDef<
	T extends {
		/** 响应体 */
		body?: z.ZodType;
		/** 状态码 */
		status?: number;
		/** 响应类型 */
		mime?: string;
		/** 响应头 */
		headers?: [string, z.ZodType][];
		/** 是否为通用响应 */
		commonResp?: boolean;
	},
> {
	private constructor(private _data: T) {}
	/**
	 * 创造一个默认的响应定义, 响应类型为`application/json`, 状态码为`200`
	 */
	public static create() {
		return new RespDef({}).mime('application/json').status(200);
	}
	/**设置响应体*/
	public body<B extends any>(
		body: z.ZodType<B>,
	): Flat<RespDef<Omit<T, 'body'> & { body: z.ZodType<B> }>> {
		return new RespDef({
			...this._data,
			body,
		}) as any;
	}
	/**设置状态码*/
	public status<S extends number>(status: S): Flat<RespDef<Omit<T, 'status'> & { status: S }>> {
		return new RespDef({
			...this._data,
			status: status,
		}) as any;
	}
	/**设置响应类型*/
	public mime<M extends string>(mime: M): Flat<RespDef<Omit<T, 'mime'> & { mime: M }>> {
		return new RespDef({
			...this._data,
			mime,
		}) as any;
	}
	/**添加响应头*/
	public headers<H extends [string, z.ZodType][]>(
		h: H,
	): Flat<
		RespDef<
			Omit<T, 'headers'> & {
				headers: [
					...('headers' extends keyof T
						? T['headers'] extends [string, z.ZodType][]
							? T['headers']
							: []
						: []),
					...H,
				];
			}
		>
	> {
		return new RespDef({
			...this._data,
			headers: [...(this._data.headers ?? []), ...h],
		}) as any;
	}
	/**添加响应头*/
	public header<V extends z.ZodType, K extends string>(
		k: K,
		v: V,
	): Flat<
		RespDef<
			Omit<T, 'headers'> & {
				headers: [
					...('headers' extends keyof T
						? T['headers'] extends [string, z.ZodType][]
							? T['headers']
							: []
						: []),
					[K, V],
				];
			}
		>
	>;
	/**添加响应头*/
	public header<V extends z.ZodType, K extends string>(
		k: [K, V],
	): Flat<
		RespDef<
			Omit<T, 'headers'> & {
				headers: [
					...('headers' extends keyof T
						? T['headers'] extends [string, z.ZodType][]
							? T['headers']
							: []
						: []),
					[K, V],
				];
			}
		>
	>;
	/**添加响应头*/
	public header<V extends z.ZodType, K extends string>(
		k: K | [K, V],
		v?: V,
	): Flat<
		RespDef<
			Omit<T, 'headers'> & {
				headers: [
					...('headers' extends keyof T
						? T['headers'] extends [string, z.ZodType][]
							? T['headers']
							: []
						: []),
					[K, V],
				];
			}
		>
	> {
		if (Array.isArray(k)) {
			v = k[1];
			k = k[0];
		}

		return new RespDef({
			...this._data,
			headers: {
				...this._data.headers,
				[k]: v,
			},
		}) as any;
	}
	/**
	 * 添加响应Cookie
	 * @see header
	 */
	public cookie<Type extends COOKIE_VALUES>(type: Type) {
		return this.header('set-cookie', z.string());
	}
	/**
	 * 设置标准成功响应, 响应状态码为`0`
	 * @param data 响应数据
	 */
	public success<D extends any>(
		data: z.ZodSchema<D>,
	): Flat<RespDef<T & { body: z.ZodType<{ data: D; code: 0 }>; commonResp: true }>>;
	/**
	 * 设置标准成功响应
	 * @param data 响应数据
	 * @param code 响应状态码
	 */
	public success<D extends any, C extends number>(
		data: z.ZodSchema<D>,
		code: C,
	): Flat<RespDef<T & { body: z.ZodType<{ data: D; code: C }>; commonResp: true }>>;
	/**
	 * 设置标准成功响应
	 * @param data 响应数据
	 * @param code 响应状态码, 默认为`0`
	 * @returns
	 */
	public success<D extends any>(
		data: z.ZodSchema<D>,
		code: number = 0,
	): Flat<RespDef<T & { body: z.ZodType<{ data: D; code: 0 }>; commonResp: true }>> {
		return new RespDef({
			...this._data,
			body: z.object({
				data,
				code: z.literal(code),
			}) as z.ZodType<{ data: D; code: typeof code }>,
			commonResp: true,
		});
	}
	/**
	 * 设置标准失败响应, 响应状态码为`1`
	 * @param message 响应消息
	 */
	public failure<M extends string>(
		message: z.ZodSchema<M>,
	): Flat<RespDef<T & { body: z.ZodType<{ message: M; code: 1 }>; commonResp: true }>>;
	/**
	 * 设置标准失败响应
	 * @param message 响应消息
	 * @param code 响应状态码
	 */
	public failure<M extends string, C extends number>(
		message: z.ZodSchema<M>,
		code: C,
	): Flat<RespDef<T & { body: z.ZodType<{ message: M; code: C }>; commonResp: true }>>;
	/**
	 * 设置标准失败响应
	 * @param message 响应消息
	 * @param code 响应状态码, 默认为`1`
	 * @returns
	 */
	public failure<M extends string>(message: z.ZodSchema<M>, code: number = 1) {
		return new RespDef({
			...this._data,
			body: z.object({
				message,
				code: z.literal(code),
			}) as z.ZodType<{ message: M; code: typeof code }>,
			commonResp: true,
		});
	}
	public $T(): T {
		throw new Error('type only');
	}
	public $body(): 'body' extends keyof T ? T['body'] : never {
		throw new Error('type only');
	}
	public $status(): 'status' extends keyof T ? T['status'] : never {
		throw new Error('type only');
	}
	public $mime(): 'mime' extends keyof T ? T['mime'] : never {
		throw new Error('type only');
	}
	public $headers(): 'headers' extends keyof T ? T['headers'] : never {
		throw new Error('type only');
	}
	public $flatten(): RespDef<{ [K in keyof T]: T[K] }> {
		throw new Error('type only');
	}
}

export const createResp = RespDef.create;

createResp().success(z.string(), 1);
