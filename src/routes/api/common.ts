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
 * 设置响应缓存
 * @param resp 响应对象
 * @param seconds 缓存时间(秒), 默认为 3600(=1小时)
 * @returns Response对象
 */
export function cache(resp: Response, seconds: number = 3600) {
	resp.headers.set('Cache-Control', `max-age=${seconds}, public`);
	return resp;
}

/**
 * 检查请求参数是否符合要求, 仅会返回check中定义的字段
 * @param data 请求参数
 * @param check 检查规则
 * @param error 错误回调函数
 * @returns 被筛选的请求参数
 */
export function checkRequestField<
	Check extends {
		[key in string]: (value: unknown) => value is any;
	},
>(
	data: Record<keyof Check, unknown>,
	check: Check,
	error: (field: keyof Check, value: unknown) => void,
): { [key in keyof Check]: Check[key] extends (value: unknown) => value is infer T ? T : never } {
	const result: any = {};

	for (const key in data) {
		if (!Object.prototype.hasOwnProperty.call(check, key)) continue;
		if (check[key]?.(data[key])) {
			result[key] = data[key];
		} else error(key, data[key]);
	}

	return result;
}
