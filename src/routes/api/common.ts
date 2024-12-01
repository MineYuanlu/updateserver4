import { api__common_invalid_field } from '$lib/paraglide/messages';
import { languageTag, sourceLanguageTag, type availableLanguageTags } from '$lib/paraglide/runtime';
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
 * API失败返回函数
 * @param msg 错误信息
 * @param code 错误码(默认为 1 )
 * @returns Response对象
 */
export function failure(message: string, code = 1): never {
	return error(400, { code, message });
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

/** 类型约束函数 */
type TypeLint<T = any> = (value: unknown) => value is T;
/** 错误回调函数 */
type ErrorHandler<Key> = (field: Key, value: any) => never;
/**
 * 检查请求参数是否符合要求, 仅会返回check中定义的字段
 * @param data 请求参数
 * @param check 检查规则 `{字段: 检查函数 | [检查函数, 错误回调函数]}`
 * @param error 默认错误回调函数
 * @returns 被筛选的请求参数
 */
export function checkRequestField<
	Check extends {
		[key in string]: TypeLint | [TypeLint, ErrorHandler<key>];
	},
>(
	data: Record<keyof Check, unknown>,
	check: Check,
	error: ErrorHandler<keyof Check> = failure_common_invalid_field,
): {
	[key in keyof Check]: Check[key] extends TypeLint<infer T>
		? T
		: Check[key] extends [TypeLint<infer T>, ErrorHandler<key>]
			? T
			: never;
} {
	const result: any = {};

	for (const key in data) {
		const checkItem = check[key as keyof Check];
		if (!checkItem) continue;
		const [checkFunc, errorFunc] = Array.isArray(checkItem) ? checkItem : [checkItem, error];
		if (checkFunc(data[key])) {
			result[key] = data[key];
		} else errorFunc(key, data[key]);
	}

	return result;
}

/** URL语言前缀函数 */
export const langPrefix = (): `/${(typeof availableLanguageTags)[number]}` | '' => {
	const tag = languageTag();
	return tag === sourceLanguageTag ? '' : `/${tag}`;
};
