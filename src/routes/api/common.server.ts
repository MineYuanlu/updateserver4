import {
	api__common_invalid_field,
	api__common_invalid_field_with_why,
} from '$lib/paraglide/messages';
import { error, json } from '@sveltejs/kit';

/**
 * API通用返回函数
 * @param data 返回数据
 * @param code API状态码, 0表示成功
 * @param msg API状态信息
 * @param status HTTP状态码
 * @param headers HTTP头
 * @returns Response对象
 */
export function apiResp(
	data?: any,
	code = 0,
	message?: string,
	status?: number,
	headers?: Record<string, string>,
) {
	let init: ResponseInit | undefined = undefined;
	if (headers || status) init = { status, headers };
	return json({ data, code, message }, init);
}

/**
 * API成功返回函数
 * @param data 返回数据
 * @param headers HTTP头
 * @returns Response对象
 */
export function success(data?: any, headers?: Record<string, string>) {
	return apiResp(data, 0, undefined, 200, headers);
}

/**
 * API成功返回函数(protobuf)
 * @param data 返回数据(protobuf)
 * @param header HTTP头
 * @returns Response对象
 */
export function success_proto(data: Uint8Array, header?: Record<string, string>) {
	const headers = new Headers(header);

	if (!headers.has('content-type')) {
		headers.set('content-type', 'application/x-protobuf');
	}
	if (!headers.has('content-length')) {
		headers.set('content-length', data.length.toString());
	}

	return new Response(data, {
		headers,
		status: 200,
	});
}

/**
 * API失败返回函数
 * @param msg 错误信息
 * @param code 错误码(默认为 1 )
 * @returns Response对象
 */
export function failure(message: string, code = 1): never {
	return error(400, { code, message } as any);
}

/**
 * API通用参数错误返回函数
 * @param field 错误字段
 * @returns Response对象
 */
export function failure_common_invalid_field(field: NonNullable<unknown>): never {
	return failure(api__common_invalid_field({ field }));
}

/**
 * 设置响应缓存
 * @param resp 响应对象
 * @param seconds 缓存时间(秒), 默认为 3600(=1小时)
 * @returns Response对象
 */
export function cache(resp: Response, seconds: number = 3600) {
	resp.headers.set('Cache-Control', `max-age=${seconds}, public`);
	return resp;
}

type Falsy = false | 0 | '' | null | undefined;
/** 类型约束函数 */
type TypeLint<T = any> = (value: unknown) => value is T;
/** 错误回调函数 */
type ErrorHandler<Key> = (field: Key, value: any) => never;
type TransFunc<T, R> = (v: T) => R;
type Checker<Key, T = any> =
	| TypeLint<T>
	| [TypeLint<T>, TransFunc<T, any>]
	| [TypeLint<T>, TransFunc<T, any> | Falsy, ErrorHandler<Key>];
type Checkers = {
	[key in string]: Checker<key>;
};

/**
 * 检查请求参数是否符合要求, 仅会返回check中定义的字段
 * @param data 请求参数
 * @param check 检查规则 `{字段: 检查函数 | [检查函数, 错误回调函数]}`
 * @param error 默认错误回调函数
 * @returns 被筛选的请求参数
 */
export function checkRequestField<Check extends Checkers>(
	data: Record<keyof Check, unknown> | URLSearchParams,
	check: Check,
	error: ErrorHandler<keyof Check> = failure_common_invalid_field,
): {
	[key in keyof Check]: Check[key] extends TypeLint<infer T>
		? T
		: Check[key] extends [TypeLint<infer T>, TransFunc<infer T, infer R>]
			? R
			: Check[key] extends [TypeLint<infer T>, TransFunc<infer T, infer R>, ErrorHandler<key>]
				? R
				: Check[key] extends [TypeLint<infer T>, Falsy, ErrorHandler<key>]
					? T
					: never;
} {
	const result: any = {};

	const get = data instanceof URLSearchParams ? data.get.bind(data) : (k: keyof Check) => data[k];

	for (const key in check) {
		const checkItem = check[key as keyof Check];
		const _d = get(key);
		let [checkFunc, trans, errorFunc] = Array.isArray(checkItem) ? checkItem : [checkItem];
		if (typeof errorFunc !== 'function') errorFunc = error;
		if (checkFunc(_d)) {
			result[key] = trans ? trans(_d) : _d;
		} else errorFunc(key, _d);
	}

	return result;
}

/**
 * 创建一个带有详细原因说明的失败回调函数
 * @param func 错误原因检查函数
 * @returns 带有详细原因说明的失败回调函数
 */
export function failWhy(func: (v: unknown) => string | undefined): ErrorHandler<any> {
	return (field, value) => {
		failure(api__common_invalid_field_with_why({ field, why: func(value) ?? 'unknown' }));
	};
}
