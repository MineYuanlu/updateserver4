import { json } from '@sveltejs/kit';

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
	msg?: string,
	status?: number,
	headers?: Record<string, string>,
) {
	let init: ResponseInit | undefined = undefined;
	if (headers || status) init = { status, headers };
	return json({ data, code, msg }, init);
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
 * @param headers HTTP头
 * @returns Response对象
 */
export function failure(msg: string, code = 1, headers?: Record<string, string>) {
	return apiResp(undefined, code, msg, 400, headers);
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
